"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  generateAssignment,
  type GenerateAssignmentState,
} from "@/actions/generate-assignment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getCategoryLabel,
  getSubjectsByCategory,
  SUBJECT_CATEGORIES,
} from "@/lib/subjects";

const initial: GenerateAssignmentState = {};

type Props = {
  classes: Array<{ id: string; name: string }>;
};

export function GenerateAssignmentForm({ classes }: Props) {
  const router = useRouter();
  const [state, action, pending] = useActionState(generateAssignment, initial);

  useEffect(() => {
    if (state.classId) {
      router.push(`/teacher/classes/${state.classId}`);
    }
  }, [router, state.classId]);

  if (classes.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Create a class first, then generate an assignment.
      </p>
    );
  }

  return (
    <form action={action} className="grid max-w-xl gap-4">
      <div className="space-y-2">
        <Label htmlFor="classId">Class</Label>
        <select
          id="classId"
          name="classId"
          required
          className="border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm"
          defaultValue={classes[0]?.id}
        >
          {classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <select
          id="subject"
          name="subject"
          required
          className="border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm"
          defaultValue="Algebra"
        >
          {SUBJECT_CATEGORIES.map((category) => (
            <optgroup key={category.id} label={getCategoryLabel(category.id)}>
              {getSubjectsByCategory(category.id).map((subject) => (
                <option key={subject.id} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>
        <Input
          id="topic"
          name="topic"
          required
          placeholder="Quadratic equations"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <select
            id="difficulty"
            name="difficulty"
            className="border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm"
            defaultValue="medium"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="ap">AP</option>
            <option value="ib">IB</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="format">Format</Label>
          <select
            id="format"
            name="format"
            className="border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm"
            defaultValue="mixed"
          >
            <option value="multiple_choice">Multiple choice</option>
            <option value="free_response">Free response</option>
            <option value="mixed">Mixed</option>
            <option value="ap_style">AP style</option>
            <option value="ib_style">IB style</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="questionCount">Number of questions</Label>
        <Input
          id="questionCount"
          name="questionCount"
          type="number"
          min={1}
          max={50}
          defaultValue={5}
          required
        />
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="calculatorAllowed"
            id="calculatorAllowed"
            className="size-4 rounded border"
          />
          Calculator allowed
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="includeAnswerKey"
            id="includeAnswerKey"
            defaultChecked
            className="size-4 rounded border"
          />
          Include answer key for teachers
        </label>
      </div>

      {state.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} size="lg">
        {pending ? "Generating with AI…" : "Generate worksheet"}
      </Button>
    </form>
  );
}
