import { createClient } from "@/lib/supabase/server";
import {
  dashboardPathForRole,
  isUserRole,
  type UserRole,
} from "@/lib/auth/roles";

export type UserProfile = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: UserRole;
};

/**
 * Returns the authenticated user profile from public.users.
 * Role always comes from the database — never from client input.
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || !isUserRole(profile.role)) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
  };
}

export async function requireUserProfile(): Promise<UserProfile> {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    throw new Error("Not authenticated");
  }

  return profile;
}

export async function requireRole(role: UserRole): Promise<UserProfile> {
  const profile = await requireUserProfile();

  if (profile.role !== role) {
    throw new Error("Forbidden");
  }

  return profile;
}

export function homePathForProfile(profile: UserProfile): string {
  return dashboardPathForRole(profile.role);
}
