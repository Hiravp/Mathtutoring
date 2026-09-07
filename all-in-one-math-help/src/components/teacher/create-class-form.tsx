"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClass, type CreateClassState } from "@/actions/create-class";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getCategoryLabel,
  getSubjectsByCategory,
  SUBJECT_CATEGORIES,
} from "@/lib/subjects";

const initial: CreateClassState = {};

export function CreateClassForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(createClass, initial);

  useEffect(() => {
    if (state.classId) {
      router.push(`/teacher/classes/${state.classId}`);
    }
  }, [router, state.classId]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Class name</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Algebra 2 — Period 3"
          aria-invalid={Boolean(state.error)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subjectId">Subject</Label>
        <select
          id="subjectId"
          name="subjectId"
          required
          defaultValue=""
          className="border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm"
          aria-invalid={Boolean(state.error)}
        >
          <option value="" disabled>
            Select a subject
          </option>
          {SUBJECT_CATEGORIES.map((category) => (
            <optgroup key={category.id} label={getCategoryLabel(category.id)}>
              {getSubjectsByCategory(category.id).map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      {state.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
      {state.classCode ? (
        <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">
          Class created. Code: <strong>{state.classCode}</strong>
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create class"}
      </Button>
    </form>
  );
}
