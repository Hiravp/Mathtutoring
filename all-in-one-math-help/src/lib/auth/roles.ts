export const USER_ROLES = ["teacher", "student"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    (USER_ROLES as readonly string[]).includes(value)
  );
}

/**
 * Maps a verified database role to the correct app dashboard path.
 * Never trust a client-supplied role for authorization.
 */
export function dashboardPathForRole(role: UserRole): string {
  return role === "teacher" ? "/teacher/dashboard" : "/student/dashboard";
}
