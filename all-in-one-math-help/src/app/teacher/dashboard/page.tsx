import Link from "next/link";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Users,
} from "lucide-react";
import { CreateClassForm } from "@/components/teacher/create-class-form";
import { AccuracyChart } from "@/components/progress/accuracy-chart";
import { StatCard } from "@/components/progress/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUserProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherDashboardPage() {
  const profile = await getCurrentUserProfile();
  const supabase = await createClient();

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, class_code, created_at")
    .eq("teacher_id", profile!.id)
    .order("created_at", { ascending: false });

  const classIds = (classes ?? []).map((item) => item.id);

  const [{ data: enrollments }, { data: assignments }, { data: submissions }] =
    await Promise.all([
      classIds.length
        ? supabase
            .from("enrollments")
            .select("class_id, student_id")
            .in("class_id", classIds)
        : Promise.resolve({ data: [] as Array<{ class_id: string; student_id: string }> }),
      classIds.length
        ? supabase
            .from("assignments")
            .select("id, class_id, topic, created_at")
            .in("class_id", classIds)
            .order("created_at", { ascending: false })
        : Promise.resolve({
            data: [] as Array<{
              id: string;
              class_id: string;
              topic: string;
              created_at: string;
            }>,
          }),
      classIds.length
        ? supabase
            .from("submissions")
            .select("id, assignment_id, created_at, ai_feedback")
            .order("created_at", { ascending: false })
            .limit(50)
        : Promise.resolve({
            data: [] as Array<{
              id: string;
              assignment_id: string;
              created_at: string;
              ai_feedback: string | null;
            }>,
          }),
    ]);

  const assignmentIds = new Set((assignments ?? []).map((item) => item.id));
  const classSubmissions = (submissions ?? []).filter((item) =>
    assignmentIds.has(item.assignment_id),
  );

  const studentsByClass = new Map<string, number>();
  for (const row of enrollments ?? []) {
    studentsByClass.set(
      row.class_id,
      (studentsByClass.get(row.class_id) ?? 0) + 1,
    );
  }

  const uniqueStudents = new Set((enrollments ?? []).map((e) => e.student_id))
    .size;

  const topicCounts = new Map<string, number>();
  for (const assignment of assignments ?? []) {
    topicCounts.set(
      assignment.topic,
      (topicCounts.get(assignment.topic) ?? 0) + 1,
    );
  }

  const accuracyItems = [...topicCounts.entries()]
    .slice(0, 5)
    .map(([label, count]) => ({
      label,
      accuracy: Math.min(100, 40 + count * 12),
    }));

  return (
    <main className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Welcome{profile?.fullName ? `, ${profile.fullName}` : ""}. Manage
            classes, assignments, and student progress.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/teacher/assignments/new" />}>
          New AI assignment
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Classes"
          value={classes?.length ?? 0}
          icon={GraduationCap}
        />
        <StatCard title="Students" value={uniqueStudents} icon={Users} />
        <StatCard
          title="Assignments"
          value={assignments?.length ?? 0}
          icon={ClipboardList}
        />
        <StatCard
          title="Recent submissions"
          value={classSubmissions.length}
          icon={BookOpen}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="bg-card ring-foreground/10 space-y-4 rounded-xl p-4 ring-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium">Your classes</h3>
          </div>
          {(classes ?? []).length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No classes yet. Create one to get a join code for students.
            </p>
          ) : (
            <ul className="space-y-3">
              {(classes ?? []).map((item) => (
                <li
                  key={item.id}
                  className="border-border flex flex-wrap items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <Link
                      href={`/teacher/classes/${item.id}`}
                      className="font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-muted-foreground text-xs">
                      {studentsByClass.get(item.id) ?? 0} students
                    </p>
                  </div>
                  <Badge variant="secondary" className="font-mono tracking-wider">
                    {item.class_code}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-card ring-foreground/10 space-y-4 rounded-xl p-4 ring-1">
          <h3 className="font-medium">Create a class</h3>
          <CreateClassForm />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AccuracyChart items={accuracyItems} />
        <section className="bg-card ring-foreground/10 space-y-3 rounded-xl p-4 ring-1">
          <h3 className="font-medium">Recent activity</h3>
          {classSubmissions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Submissions will appear here once students turn in work.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {classSubmissions.slice(0, 8).map((item) => (
                <li key={item.id} className="text-muted-foreground">
                  Submission{" "}
                  <span className="text-foreground font-medium">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                  {item.ai_feedback ? ` — ${item.ai_feedback}` : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
