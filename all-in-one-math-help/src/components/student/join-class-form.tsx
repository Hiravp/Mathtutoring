"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { joinClass, type JoinClassState } from "@/actions/join-class";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: JoinClassState = {};

export function JoinClassForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(joinClass, initial);

  useEffect(() => {
    if (state.classId) {
      router.push(`/student/classes/${state.classId}`);
    }
  }, [router, state.classId]);

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="classCode">Class code</Label>
        <Input
          id="classCode"
          name="classCode"
          required
          maxLength={6}
          placeholder="ABC234"
          className="uppercase tracking-widest"
          aria-invalid={Boolean(state.error)}
        />
      </div>
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
        {pending ? "Joining…" : "Join class"}
      </Button>
    </form>
  );
}
