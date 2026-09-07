"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Calculator,
  ClipboardList,
  Gamepad2,
  LayoutDashboard,
  ScanLine,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/auth/roles";

const TEACHER_LINKS = [
  { href: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/assignments/new", label: "New assignment", icon: Sparkles },
];

const STUDENT_LINKS = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/scanner", label: "Homework tutor", icon: ScanLine },
  { href: "/student/games", label: "Games", icon: Gamepad2 },
  { href: "/student/flashcards", label: "Flashcards", icon: BookOpen },
];

type AppSidebarProps = {
  role: UserRole;
};

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname();
  const links = role === "teacher" ? TEACHER_LINKS : STUDENT_LINKS;

  return (
    <aside className="border-border bg-sidebar text-sidebar-foreground hidden w-56 shrink-0 border-r md:flex md:flex-col">
      <div className="border-border flex items-center gap-2 border-b px-4 py-4">
        <Calculator className="size-5" aria-hidden />
        <div>
          <p className="text-sm font-semibold">Math Help</p>
          <p className="text-muted-foreground text-xs capitalize">{role}</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main">
        {links.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4" aria-hidden />
              {link.label}
            </Link>
          );
        })}
        {role === "student" ? (
          <p className="text-muted-foreground mt-4 px-3 text-xs">
            <ClipboardList className="mr-1 inline size-3" aria-hidden />
            Join classes from your dashboard
          </p>
        ) : null}
      </nav>
    </aside>
  );
}
