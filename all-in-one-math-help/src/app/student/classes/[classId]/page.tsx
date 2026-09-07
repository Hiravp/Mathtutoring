import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getCurrentUserProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ classId: string }>;
};

export default async function StudentClassPage({ params }: PageProps) {
  const { classId } = await params;
  const profile = await getCurrentUserProfile();
  const supabase = await createClient();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("class_id, classes(id, name, class_code)")
    .eq("class_id", classId)
    .eq("student_id", profile!.id)
    .maybeSingle();

  if (!enrollment) {
    notFound();
  }

  const classRelated = enrollment.classes as
    | { id: string; name: string; class_code: string }
    | { id: string; name: string; class_code: string }[]
    | null;
  const classRow = Array.isArray(classRelated)
    ? classRelated[0]
    : classRelated;

  if (!classRow) {
    notFound();
  }

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, topic, created_at")
    .eq("class_id", classId)
    .order("created_at", { ascending: false });

  const { data: submissions } = await supabase
    .from("submissions")
    .select("assignment_id")
    .eq("student_id", profile!.id);

  const submitted = new Set((submissions ?? []).map((s) => s.assignment_id));

  return (
    <main className="space-y-6">
      <div>
        <p className="text-muted-foreground text-sm">
          <Link href="/student/dashboard" className="hover:underline">
            Classes
          </Link>{" "}
          / {classRow.name}
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          {classRow.name}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Class code{" "}
          <Badge variant="secondary" className="font-mono">
            {classRow.class_code}
          </Badge>
        </p>
      </div>

      <section className="space-y-3">
        <h3 className="font-medium">Assignments</h3>
        {(assignments ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No assignments posted yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {(assignments ?? []).map((item) => (
              <li
                key={item.id}
                className="bg-card ring-foreground/10 flex items-center justify-between gap-3 rounded-xl p-4 ring-1"
              >
                <div>
                  <Link
                    href={`/student/assignments/${item.id}`}
                    className="font-medium hover:underline"
                  >
                    {item.topic}
                  </Link>
                  <p className="text-muted-foreground text-xs">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={submitted.has(item.id) ? "secondary" : "outline"}>
                  {submitted.has(item.id) ? "Submitted" : "Pending"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
