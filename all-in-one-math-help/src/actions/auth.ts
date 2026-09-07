"use server";

import { redirect } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  dashboardPathForRole,
  isUserRole,
} from "@/lib/auth/roles";
import { loginSchema, signupSchema } from "@/lib/validations/auth";

export type AuthActionState = {
  error?: string;
  message?: string;
};

function friendlyAuthError(error: AuthError | null | undefined): string {
  const message = error?.message ?? "";
  const code = (error?.code ?? "").toLowerCase();
  const normalized = message.toLowerCase();

  if (
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit" ||
    normalized.includes("rate limit")
  ) {
    return "Too many signup attempts. Please wait a few minutes and try again.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "Incorrect email or password. Please try again.";
  }

  if (
    code === "user_already_exists" ||
    normalized.includes("user already registered") ||
    normalized.includes("already been registered") ||
    normalized.includes("already exists")
  ) {
    return "An account with this email already exists. Try logging in.";
  }

  if (normalized.includes("invalid role")) {
    return "Please select whether you are a teacher or student.";
  }

  if (
    code === "email_address_invalid" ||
    normalized.includes("email_address_invalid")
  ) {
    return "That email address is not accepted. Use a real email you can access (for example Gmail or Outlook).";
  }

  if (normalized.includes("password")) {
    return "That password could not be used. Please choose another.";
  }

  if (
    normalized.includes("database error") ||
    normalized.includes("does not exist")
  ) {
    return "Account setup is incomplete on the server. Run supabase/schema.sql in your Supabase SQL editor, then try again.";
  }

  if (normalized.includes("email")) {
    return "Something went wrong with that email address. Please try again.";
  }

  if (process.env.NODE_ENV === "development" && message) {
    return `Signup failed: ${message}`;
  }

  return "Something went wrong. Please try again.";
}

async function resolveDashboardPath(userId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile || !isUserRole(profile.role)) {
    return null;
  }

  return dashboardPathForRole(profile.role);
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid login details.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { error: friendlyAuthError(error) };
  }

  const dashboardPath = await resolveDashboardPath(data.user.id);

  if (!dashboardPath) {
    await supabase.auth.signOut();
    return {
      error:
        "Your account profile could not be loaded. Please contact support.",
    };
  }

  redirect(dashboardPath);
}

export async function signupAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid signup details.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        role: parsed.data.role,
      },
    },
  });

  if (error) {
    return { error: friendlyAuthError(error) };
  }

  // Email confirmation may be required — no session yet.
  if (!data.session || !data.user) {
    return {
      message:
        "Account created. Check your email to confirm your address, then log in.",
    };
  }

  // Role for redirect comes from the database trigger result, not form input.
  const dashboardPath = await resolveDashboardPath(data.user.id);

  if (!dashboardPath) {
    return {
      message:
        "Account created, but your profile is still syncing. Please log in.",
    };
  }

  redirect(dashboardPath);
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
