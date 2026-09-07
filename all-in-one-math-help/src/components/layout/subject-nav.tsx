import Link from "next/link";
import { SUBJECTS } from "@/lib/subjects";
import { cn } from "@/lib/utils";

type SubjectNavProps = {
  active?: string;
  hrefForSubject?: (subjectName: string) => string;
  className?: string;
};

export function SubjectNav({
  active,
  hrefForSubject = () => "/student/flashcards",
  className,
}: SubjectNavProps) {
  return (
    <nav
      aria-label="Subjects"
      className={cn("flex flex-wrap gap-2", className)}
    >
      {SUBJECTS.map((subject) => {
        const isActive = active === subject.name;
        return (
          <Link
            key={subject.id}
            href={hrefForSubject(subject.name)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm transition-colors",
              isActive
                ? "border-primary bg-primary/5 text-foreground font-medium"
                : "border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {subject.name}
          </Link>
        );
      })}
    </nav>
  );
}
