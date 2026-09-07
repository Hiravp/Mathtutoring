"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { saveStudentSubjectsSchema } from "@/lib/validations/subjects";

export type SaveStudentSubjectsState = {
  error?: string;
  message?: string;
};

export async function saveStudentSubjects(
  _prev: SaveStudentSubjectsState,
  formData: FormData,
): Promise<SaveStudentSubjectsState> {
  try {
    const profile = await requireRole("student");
    const raw = formData.getAll("subjectIds");
    const subjectIds = raw.filter((value): value is string => typeof value === "string");

    const parsed = saveStudentSubjectsSchema.safeParse({ subjectIds });

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Invalid subject selection.",
      };
    }

    const supabase = await createClient();

    const { error: deleteError } = await supabase
      .from("student_subjects")
      .delete()
      .eq("student_id", profile.id);

    if (deleteError) {
      return { error: "Could not update your subjects. Please try again." };
    }

    const { error: insertError } = await supabase.from("student_subjects").insert(
      parsed.data.subjectIds.map((subjectId) => ({
        student_id: profile.id,
        subject_id: subjectId,
      })),
    );

    if (insertError) {
      return { error: "Could not save your subjects. Please try again." };
    }

    revalidatePath("/student/dashboard");
    revalidatePath("/student/flashcards");

    return { message: "Your subjects were saved." };
  } catch {
    return { error: "You must be signed in as a student to save subjects." };
  }
}
