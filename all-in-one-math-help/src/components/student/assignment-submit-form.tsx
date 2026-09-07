"use client";

import { useActionState } from "react";
import {
  submitAssignment,
  type SubmitAssignmentState,
} from "@/actions/submit-assignment";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { GeneratedAssignment } from "@/lib/validations/assignment";

const initial: SubmitAssignmentState = {};

type Props = {
  assignmentId: string;
  content: GeneratedAssignment;
  existingAnswers?: Record<string, string>;
  existingFeedback?: string | null;
};

export function AssignmentSubmitForm({
  assignmentId,
  content,
  existingAnswers,
  existingFeedback,
}: Props) {
  const [state, action, pending] = useActionState(submitAssignment, initial);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <ol className="space-y-6">
        {content.questions.map((question, index) => (
          <li
            key={question.id}
            className="bg-card ring-foreground/10 space-y-3 rounded-xl p-4 ring-1"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium">
                {index + 1}. {question.prompt}
              </p>
              <span className="text-muted-foreground text-xs">
                {question.points} pts
              </span>
            </div>
            {question.type === "multiple_choice" && question.choices ? (
              <fieldset className="space-y-2">
                <legend className="sr-only">Choices for question {index + 1}</legend>
                {question.choices.map((choice) => (
                  <label
                    key={choice}
                    className="border-input hover:bg-muted/40 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                  >
                    <input
                      type="radio"
                      name={`answer_${question.id}`}
                      value={choice}
                      defaultChecked={existingAnswers?.[question.id] === choice}
                      className="size-4"
                    />
                    {choice}
                  </label>
                ))}
              </fieldset>
            ) : (
              <div className="space-y-2">
                <Label htmlFor={`answer_${question.id}`}>Your answer</Label>
                <Textarea
                  id={`answer_${question.id}`}
                  name={`answer_${question.id}`}
                  defaultValue={existingAnswers?.[question.id] ?? ""}
                  rows={3}
                  placeholder="Show your reasoning…"
                />
              </div>
            )}
          </li>
        ))}
      </ol>

      {state.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">
          Submitted{state.scoreLabel ? ` — ${state.scoreLabel}` : ""}.
        </p>
      ) : null}
      {existingFeedback && !state.success ? (
        <p className="text-muted-foreground text-sm">
          Previous feedback: {existingFeedback}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Submitting…" : "Submit assignment"}
      </Button>
    </form>
  );
}
