import { redirect } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandSearch } from "@/components/layout/command-search";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import {
  getCurrentUserProfile,
  homePathForProfile,
} from "@/lib/auth/session";
import type { UserRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

type RoleGateLayoutProps = {
  children: React.ReactNode;
  requiredRole: UserRole;
  title: string;
};

export async function RoleGateLayout({
  children,
  requiredRole,
  title,
}: RoleGateLayoutProps) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== requiredRole) {
    redirect(homePathForProfile(profile));
  }

  const supabase = await createClient();
  let classes: Array<{ id: string; name: string }> = [];
  let assignments: Array<{ id: string; topic: string; href: string }> = [];

  if (requiredRole === "teacher") {
    const { data } = await supabase
      .from("classes")
      .select("id, name")
      .eq("teacher_id", profile.id)
      .order("created_at", { ascending: false });
    classes = data ?? [];

    if (classes.length > 0) {
      const { data: assignmentRows } = await supabase
        .from("assignments")
        .select("id, topic, class_id")
        .in(
          "class_id",
          classes.map((item) => item.id),
        )
        .order("created_at", { ascending: false })
        .limit(20);
      assignments = (assignmentRows ?? []).map((row) => ({
        id: row.id,
        topic: row.topic,
        href: `/teacher/classes/${row.class_id}`,
      }));
    }
  } else {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("class_id, classes(id, name)")
      .eq("student_id", profile.id);

    classes = (enrollments ?? [])
      .map((row) => {
        const related = row.classes as
          | { id: string; name: string }
          | { id: string; name: string }[]
          | null;
        if (!related) return null;
        const cls = Array.isArray(related) ? related[0] : related;
        return cls ? { id: cls.id, name: cls.name } : null;
      })
      .filter((item): item is { id: string; name: string } => Boolean(item));

    if (classes.length > 0) {
      const { data: assignmentRows } = await supabase
        .from("assignments")
        .select("id, topic")
        .in(
          "class_id",
          classes.map((item) => item.id),
        )
        .order("created_at", { ascending: false })
        .limit(20);
      assignments = (assignmentRows ?? []).map((row) => ({
        id: row.id,
        topic: row.topic,
        href: `/student/assignments/${row.id}`,
      }));
    }
  }

  return (
    <div className="bg-background flex min-h-full flex-1">
      <AppSidebar role={requiredRole} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border bg-background/80 sticky top-0 z-20 border-b backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <MobileNav role={requiredRole} />
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  All-in-One Math Help
                </p>
                <h1 className="truncate text-lg font-semibold">{title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <CommandSearch
                role={requiredRole}
                classes={classes}
                assignments={assignments}
              />
              <p className="text-muted-foreground hidden max-w-[10rem] truncate text-sm lg:block">
                {profile.fullName ?? profile.email}
              </p>
              <form action={logoutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Log out
                </Button>
              </form>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col px-4 py-6 md:px-6">{children}</div>
      </div>
    </div>
  );
}
