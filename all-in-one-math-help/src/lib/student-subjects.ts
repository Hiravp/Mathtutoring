import { getSubjectById, SUBJECTS, type SubjectId } from "@/lib/subjects";
import { createClient } from "@/lib/supabase/server";

export async function getStudentSubjectIds(studentId: string): Promise<SubjectId[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("student_subjects")
    .select("subject_id")
    .eq("student_id", studentId);

  return (data ?? [])
    .map((row) => row.subject_id)
    .filter((id): id is SubjectId => Boolean(getSubjectById(id)));
}

export function resolveActiveSubjectIds(
  savedSubjectIds: SubjectId[],
  classSubjectIds: Array<string | null | undefined>,
): SubjectId[] {
  const fromClasses = classSubjectIds
    .filter((id): id is string => typeof id === "string" && Boolean(getSubjectById(id)))
    .map((id) => id as SubjectId);

  const combined = new Set<SubjectId>([...savedSubjectIds, ...fromClasses]);
  return SUBJECTS.filter((subject) => combined.has(subject.id)).map(
    (subject) => subject.id,
  );
}

export function subjectsForIds(ids: SubjectId[]) {
  return SUBJECTS.filter((subject) => ids.includes(subject.id));
}
