import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUserProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { generatedAssignmentSchema } from "@/lib/validations/assignment";

type PageProps = {
  params: Promise<{ classId: string }>;
};

export default async function TeacherClassPage({ params }: PageProps) {
  const { classId } = await params;
  const profile = await getCurrentUserProfile();
  const supabase = await createClient();

  const { data: classRow } = await supabase
    .from("classes")
    .select("id, name, class_code, teacher_id, created_at")
    .eq("id", classId)
    .eq("teacher_id", profile!.id)
    .maybeSingle();

  if (!classRow) {
    notFound();
  }

  const [{ data: enrollments }, { data: assignments }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("student_id, created_at, users(full_name, email)")
      .eq("class_id", classId),
    supabase
      .from("assignments")
      .select("id, topic, content, created_at")
      .eq("class_id", classId)
      .order("created_at", { ascending: false }),
  ]);

  const assignmentIds = (assignments ?? []).map((item) => item.id);
  const { data: submissions } = assignmentIds.length
    ? await supabase
        .from("submissions")
        .select("id, assignment_id, student_id, ai_feedback, updated_at, users(full_name)")
        .in("assignment_id", assignmentIds)
        .order("updated_at", { ascending: false })
    : { data: [] as Array<{
        id: string;
        assignment_id: string;
        student_id: string;
        ai_feedback: string | null;
        updated_at: string;
        users: { full_name: string | null } | { full_name: string | null }[] | null;
      }> };

  const completionByAssignment = new Map<string, number>();
  for (const submission of submissions ?? []) {
    completionByAssignment.set(
      submission.assignment_id,
      (completionByAssignment.get(submission.assignment_id) ?? 0) + 1,
    );
  }

  const studentCount = enrollments?.length ?? 0;

  return (
    <main className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">
            <Link href="/teacher/dashboard" className="hover:underline">
              Classes
            </Link>{" "}
            / {classRow.name}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {classRow.name}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Share code{" "}
            <Badge variant="secondary" className="font-mono tracking-wider">
              {classRow.class_code}
            </Badge>{" "}
            with students.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/teacher/assignments/new" />}
        >
          Generate assignment
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="bg-card ring-foreground/10 space-y-3 rounded-xl p-4 ring-1">
          <h3 className="font-medium">Students ({studentCount})</h3>
          {studentCount === 0 ? (
            <p className="text-muted-foreground text-sm">
              No students enrolled yet.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {(enrollments ?? []).map((row) => {
                const user = Array.isArray(row.users) ? row.users[0] : row.users;
                return (
                  <li key={row.student_id}>
                    {user?.full_name || user?.email || "Student"}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="bg-card ring-foreground/10 space-y-3 rounded-xl p-4 ring-1">
          <h3 className="font-medium">Class analytics</h3>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>Class size: {studentCount}</li>
            <li>Assignments: {assignments?.length ?? 0}</li>
            <li>Submissions: {submissions?.length ?? 0}</li>
            <li>
              Completion rate:{" "}
              {studentCount === 0 || (assignments?.length ?? 0) === 0
                ? "—"
                : `${Math.round(
                    ((submissions?.length ?? 0) /
                      (studentCount * (assignments?.length ?? 1))) *
                      100,
                  )}%`}
            </li>
          </ul>
        </section>
      </div>

      <section className="space-y-4">
        <h3 className="font-medium">Assignments</h3>
        {(assignments ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No assignments yet. Generate one with AI.
          </p>
        ) : (
          <ul className="space-y-4">
            {(assignments ?? []).map((assignment) => {
              const content = generatedAssignmentSchema.safeParse(
                assignment.content,
              );
              const completed = completionByAssignment.get(assignment.id) ?? 0;
              return (
                <li
                  key={assignment.id}
                  className="bg-card ring-foreground/10 rounded-xl p-4 ring-1"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {content.success
                          ? content.data.title
                          : assignment.topic}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Topic: {assignment.topic} ·{" "}
                        {content.success
                          ? `${content.data.questions.length} questions`
                          : "Worksheet"}{" "}
                        · {completed}/{studentCount} submitted
                      </p>
                    </div>
                    <Badge variant="outline">
                      {new Date(assignment.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                  {content.success ? (
                    <ol className="text-muted-foreground mt-3 list-decimal space-y-1 pl-5 text-sm">
                      {content.data.questions.slice(0, 3).map((q) => (
                        <li key={q.id}>{q.prompt}</li>
                      ))}
                    </ol>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="font-medium">Students needing help</h3>
        <p className="text-muted-foreground text-sm">
          {(submissions ?? []).length === 0
            ? "No submission signals yet. After students submit, low-confidence feedback will surface here."
            : "Review recent feedback for coaching opportunities."}
        </p>
        <ul className="space-y-2 text-sm">
          {(submissions ?? []).slice(0, 6).map((item) => {
            const user = Array.isArray(item.users) ? item.users[0] : item.users;
            return (
              <li key={item.id} className="text-muted-foreground">
                <span className="text-foreground font-medium">
                  {user?.full_name ?? "Student"}
                </span>
                {item.ai_feedback ? ` — ${item.ai_feedback}` : null}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
