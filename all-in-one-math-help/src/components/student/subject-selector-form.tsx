"use client";

import { useActionState } from "react";
import { saveStudentSubjects, type SaveStudentSubjectsState } from "@/actions/save-student-subjects";
import { Button } from "@/components/ui/button";
import {
  getCategoryLabel,
  getSubjectsByCategory,
  SUBJECT_CATEGORIES,
  type SubjectId,
} from "@/lib/subjects";
import { cn } from "@/lib/utils";

const initial: SaveStudentSubjectsState = {};

type SubjectSelectorFormProps = {
  defaultSelected?: SubjectId[];
  submitLabel?: string;
  showSkipHint?: boolean;
};

export function SubjectSelectorForm({
  defaultSelected = [],
  submitLabel = "Save subjects",
  showSkipHint = false,
}: SubjectSelectorFormProps) {
  const [state, action, pending] = useActionState(saveStudentSubjects, initial);

  return (
    <form action={action} className="space-y-5">
      {SUBJECT_CATEGORIES.map((category) => {
        const subjects = getSubjectsByCategory(category.id);

        return (
          <fieldset key={category.id} className="space-y-3">
            <legend className="text-sm font-medium">
              {getCategoryLabel(category.id)}
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {subjects.map((subject) => {
                const checked = defaultSelected.includes(subject.id);

                return (
                  <label
                    key={subject.id}
                    className={cn(
                      "border-input hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5 flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                    )}
                  >
                    <input
                      type="checkbox"
                      name="subjectIds"
                      value={subject.id}
                      defaultChecked={checked}
                      className="mt-1 size-4 shrink-0 accent-primary"
                    />
                    <span className="grid gap-0.5">
                      <span className="text-sm font-medium">{subject.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {subject.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      {showSkipHint ? (
        <p className="text-muted-foreground text-sm">
          Have a class code from your teacher? Join below instead — you&apos;ll be
          placed in that class and its subject.
        </p>
      ) : null}

      {state.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
