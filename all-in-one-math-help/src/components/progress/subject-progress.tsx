import { SUBJECTS, type SubjectId } from "@/lib/subjects";
import { ProgressCard } from "@/components/progress/progress-card";

type SubjectProgressProps = {
  subjectIds?: SubjectId[];
  scores: Partial<Record<string, number>>;
};

export function SubjectProgress({ subjectIds, scores }: SubjectProgressProps) {
  const subjects = subjectIds
    ? SUBJECTS.filter((subject) => subjectIds.includes(subject.id))
    : SUBJECTS;

  if (subjects.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Select subjects above or join a class to start tracking practice.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {subjects.map((subject) => (
        <ProgressCard
          key={subject.id}
          title={subject.name}
          value={scores[subject.name] ?? 0}
          description={subject.description}
        />
      ))}
    </div>
  );
}
