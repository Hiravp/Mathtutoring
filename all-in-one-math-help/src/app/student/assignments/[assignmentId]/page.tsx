import Link from "next/link";
import { notFound } from "next/navigation";
import { AssignmentSubmitForm } from "@/components/student/assignment-submit-form";
import { getCurrentUserProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { generatedAssignmentSchema } from "@/lib/validations/assignment";

type PageProps = {
  params: Promise<{ assignmentId: string }>;
};

export default async function StudentAssignmentPage({ params }: PageProps) {
  const { assignmentId } = await params;
  const profile = await getCurrentUserProfile();
  const supabase = await createClient();

  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, topic, content, class_id, created_at")
    .eq("id", assignmentId)
    .maybeSingle();

  if (!assignment) {
    notFound();
  }

  const content = generatedAssignmentSchema.safeParse(assignment.content);
  if (!content.success) {
    notFound();
  }

  const { data: submission } = await supabase
    .from("submissions")
    .select("answers, ai_feedback")
    .eq("assignment_id", assignmentId)
    .eq("student_id", profile!.id)
    .maybeSingle();

  const answers =
    submission?.answers &&
    typeof submission.answers === "object" &&
    !Array.isArray(submission.answers)
      ? (submission.answers as Record<string, string>)
      : undefined;

  return (
    <main className="space-y-6">
      <div>
        <p className="text-muted-foreground text-sm">
          <Link
            href={`/student/classes/${assignment.class_id}`}
            className="hover:underline"
          >
            Back to class
          </Link>
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          {content.data.title}
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          {content.data.instructions}
        </p>
      </div>
      <AssignmentSubmitForm
        assignmentId={assignment.id}
        content={content.data}
        existingAnswers={answers}
        existingFeedback={submission?.ai_feedback}
      />
    </main>
  );
}
