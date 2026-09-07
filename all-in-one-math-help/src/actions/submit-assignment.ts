"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { generatedAssignmentSchema } from "@/lib/validations/assignment";

const submitSchema = z.object({
  assignmentId: z.string().uuid(),
  answers: z.record(z.string(), z.string()),
});

export type SubmitAssignmentState = {
  error?: string;
  success?: boolean;
  scoreLabel?: string;
};

function scoreSubmission(
  content: z.infer<typeof generatedAssignmentSchema>,
  answers: Record<string, string>,
) {
  let earned = 0;
  let total = 0;

  for (const question of content.questions) {
    total += question.points;
    const given = (answers[question.id] ?? "").trim().toLowerCase();
    const expected = question.answer.trim().toLowerCase();
    if (given && (given === expected || expected.includes(given))) {
      earned += question.points;
    }
  }

  return { earned, total };
}

export async function submitAssignment(
  _prev: SubmitAssignmentState,
  formData: FormData,
): Promise<SubmitAssignmentState> {
  try {
    const profile = await requireRole("student");
    const assignmentId = String(formData.get("assignmentId") ?? "");

    const answers: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("answer_") && typeof value === "string") {
        answers[key.replace("answer_", "")] = value;
      }
    }

    const parsed = submitSchema.safeParse({ assignmentId, answers });
    if (!parsed.success) {
      return { error: "Please answer at least one question before submitting." };
    }

    const supabase = await createClient();
    const { data: assignment, error: assignmentError } = await supabase
      .from("assignments")
      .select("id, class_id, content")
      .eq("id", parsed.data.assignmentId)
      .maybeSingle();

    if (assignmentError || !assignment) {
      return { error: "Assignment not found or you are not enrolled." };
    }

    const content = generatedAssignmentSchema.safeParse(assignment.content);
    if (!content.success) {
      return { error: "This assignment could not be loaded." };
    }

    const { earned, total } = scoreSubmission(content.data, parsed.data.answers);
    const feedback = `Auto-scored ${earned} of ${total} points. Review explanations with your teacher.`;

    const { data: existing } = await supabase
      .from("submissions")
      .select("id")
      .eq("assignment_id", parsed.data.assignmentId)
      .eq("student_id", profile.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("submissions")
        .update({
          answers: parsed.data.answers,
          ai_feedback: feedback,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) {
        return { error: "Could not update your submission. Please try again." };
      }
    } else {
      const { error } = await supabase.from("submissions").insert({
        assignment_id: parsed.data.assignmentId,
        student_id: profile.id,
        answers: parsed.data.answers,
        ai_feedback: feedback,
      });

      if (error) {
        return { error: "Could not save your submission. Please try again." };
      }
    }

    revalidatePath(`/student/assignments/${parsed.data.assignmentId}`);
    revalidatePath("/student/dashboard");
    revalidatePath(`/student/classes/${assignment.class_id}`);

    return {
      success: true,
      scoreLabel: `${earned}/${total} points`,
    };
  } catch {
    return { error: "You must be signed in as a student to submit work." };
  }
}
