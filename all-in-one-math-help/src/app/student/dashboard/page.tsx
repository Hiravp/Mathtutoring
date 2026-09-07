import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Gamepad2,
  ScanLine,
} from "lucide-react";
import { JoinClassForm } from "@/components/student/join-class-form";
import { SubjectSelectorForm } from "@/components/student/subject-selector-form";
import { ProgressCard } from "@/components/progress/progress-card";
import { StatCard } from "@/components/progress/stat-card";
import { SubjectProgress } from "@/components/progress/subject-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUserProfile } from "@/lib/auth/session";
import {
  getStudentSubjectIds,
  resolveActiveSubjectIds,
  subjectsForIds,
} from "@/lib/student-subjects";
import { getSubjectById } from "@/lib/subjects";
import { createClient } from "@/lib/supabase/server";

export default async function StudentDashboardPage() {
  const profile = await getCurrentUserProfile();
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("class_id, classes(id, name, class_code, subject_id)")
    .eq("student_id", profile!.id);

  const classes = (enrollments ?? [])
    .map((row) => {
      const related = row.classes as
        | { id: string; name: string; class_code: string; subject_id: string | null }
        | { id: string; name: string; class_code: string; subject_id: string | null }[]
        | null;
      if (!related) return null;
      return Array.isArray(related) ? related[0] : related;
    })
    .filter(
      (
        item,
      ): item is {
        id: string;
        name: string;
        class_code: string;
        subject_id: string | null;
      } => Boolean(item),
    );

  const savedSubjectIds = await getStudentSubjectIds(profile!.id);
  const activeSubjectIds = resolveActiveSubjectIds(
    savedSubjectIds,
    classes.map((item) => item.subject_id),
  );
  const activeSubjects = subjectsForIds(activeSubjectIds);
  const needsSubjectSelection =
    classes.length === 0 && savedSubjectIds.length === 0;

  const classIds = classes.map((item) => item.id);

  const { data: assignments } = classIds.length
    ? await supabase
        .from("assignments")
        .select("id, class_id, topic, created_at")
        .in("class_id", classIds)
        .order("created_at", { ascending: false })
    : { data: [] as Array<{ id: string; class_id: string; topic: string; created_at: string }> };

  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, assignment_id, ai_feedback, updated_at")
    .eq("student_id", profile!.id);

  const submittedIds = new Set((submissions ?? []).map((s) => s.assignment_id));
  const pending = (assignments ?? []).filter((a) => !submittedIds.has(a.id));
  const completed = (assignments ?? []).filter((a) => submittedIds.has(a.id));
  const completionPct =
    (assignments?.length ?? 0) === 0
      ? 0
      : Math.round((completed.length / (assignments?.length ?? 1)) * 100);

  const progressScores = Object.fromEntries(
    activeSubjects.map((subject, index) => [
      subject.name,
      Math.min(100, (index + 1) * 10 + completed.length * 5),
    ]),
  );

  return (
    <main className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Welcome{profile?.fullName ? `, ${profile.fullName}` : ""}. Keep
          practicing and stay ahead on assignments.
        </p>
      </div>

      {needsSubjectSelection ? (
        <section className="bg-card ring-foreground/10 space-y-4 rounded-xl p-4 ring-1">
          <div>
            <h3 className="font-medium">Choose your subjects</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Pick what you want to practice. If your teacher gave you a class
              code, join below instead — you&apos;ll be placed in that class.
            </p>
          </div>
          <SubjectSelectorForm
            defaultSelected={savedSubjectIds}
            submitLabel="Start practicing"
            showSkipHint
          />
        </section>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Active classes" value={classes.length} icon={BookOpen} />
        <StatCard
          title="Pending"
          value={pending.length}
          icon={ClipboardList}
        />
        <StatCard
          title="Completed"
          value={completed.length}
          icon={CheckCircle2}
        />
        <ProgressCard
          title="Assignment progress"
          value={completionPct}
          description={`${completed.length} of ${assignments?.length ?? 0} done`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="bg-card ring-foreground/10 space-y-4 rounded-xl p-4 ring-1">
          <h3 className="font-medium">Your classes</h3>
          {classes.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Join a class with the code from your teacher.
            </p>
          ) : (
            <ul className="space-y-3">
              {classes.map((item) => {
                const subject = item.subject_id
                  ? getSubjectById(item.subject_id)
                  : null;

                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/student/classes/${item.id}`}
                        className="font-medium hover:underline"
                      >
                        {item.name}
                      </Link>
                      {subject ? (
                        <p className="text-muted-foreground truncate text-xs">
                          {subject.name}
                        </p>
                      ) : null}
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {item.class_code}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="bg-card ring-foreground/10 space-y-4 rounded-xl p-4 ring-1">
          <h3 className="font-medium">Join a class</h3>
          <JoinClassForm />
        </section>
      </div>

      {!needsSubjectSelection && savedSubjectIds.length > 0 ? (
        <section className="bg-card ring-foreground/10 space-y-4 rounded-xl p-4 ring-1">
          <div>
            <h3 className="font-medium">Your subjects</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Update what you want to practice on your own.
            </p>
          </div>
          <SubjectSelectorForm
            defaultSelected={savedSubjectIds}
            submitLabel="Update subjects"
          />
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h3 className="font-medium">Pending assignments</h3>
          {pending.length === 0 ? (
            <p className="text-muted-foreground text-sm">You&apos;re all caught up.</p>
          ) : (
            <ul className="space-y-2">
              {pending.slice(0, 6).map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/student/assignments/${item.id}`}
                    className="hover:underline"
                  >
                    {item.topic}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="font-medium">Quick tools</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/student/scanner" />}
            >
              <ScanLine className="size-4" />
              Homework tutor
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/student/games" />}
            >
              <Gamepad2 className="size-4" />
              Games
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/student/flashcards" />}
            >
              <BookOpen className="size-4" />
              Flashcards
            </Button>
          </div>
        </section>
      </div>

      <section className="space-y-3">
        <h3 className="font-medium">Subject practice</h3>
        <SubjectProgress subjectIds={activeSubjectIds} scores={progressScores} />
      </section>
    </main>
  );
}
