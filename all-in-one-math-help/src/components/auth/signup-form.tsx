"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signupAction, type AuthActionState } from "@/actions/auth";
import { type UserRole } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const initialState: AuthActionState = {};

export function SignupForm() {
  const [role, setRole] = useState<UserRole>("student");
  const [state, formAction, pending] = useActionState(
    signupAction,
    initialState,
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Join as a teacher or student to get started.
        </CardDescription>
      </CardHeader>
      <form action={formAction} noValidate>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              placeholder="Your full name"
              aria-invalid={Boolean(state.error)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="your.name@gmail.com"
              aria-invalid={Boolean(state.error)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              aria-invalid={Boolean(state.error)}
            />
          </div>
          <input type="hidden" name="role" value={role} />
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">I am a…</legend>
            <RadioGroup
              value={role}
              onValueChange={(value) => {
                if (value === "teacher" || value === "student") {
                  setRole(value);
                }
              }}
              className="grid gap-2"
              aria-label="Account role"
            >
              <label
                htmlFor="role-student"
                className="border-input hover:bg-muted/50 has-data-checked:border-primary has-data-checked:bg-primary/5 flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors"
              >
                <RadioGroupItem value="student" id="role-student" />
                <span className="grid gap-0.5">
                  <span className="text-sm font-medium">Student</span>
                  <span className="text-muted-foreground text-xs">
                    Join classes, practice, and get homework help
                  </span>
                </span>
              </label>
              <label
                htmlFor="role-teacher"
                className="border-input hover:bg-muted/50 has-data-checked:border-primary has-data-checked:bg-primary/5 flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors"
              >
                <RadioGroupItem value="teacher" id="role-teacher" />
                <span className="grid gap-0.5">
                  <span className="text-sm font-medium">Teacher</span>
                  <span className="text-muted-foreground text-xs">
                    Create classes and generate assignments
                  </span>
                </span>
              </label>
            </RadioGroup>
          </fieldset>
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
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3">
          <Button type="submit" size="lg" disabled={pending} className="w-full">
            {pending ? "Creating account…" : "Sign up"}
          </Button>
          <p className="text-muted-foreground text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
