"use client";

import Link from "next/link";
import {
  BookOpen,
  Gamepad2,
  LayoutDashboard,
  Menu,
  ScanLine,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

export function MobileNav({ role }: { role: UserRole }) {
  const links = role === "teacher" ? TEACHER_LINKS : STUDENT_LINKS;

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            className="md:hidden"
            aria-label="Open navigation"
          />
        }
      >
        <Menu className="size-4" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b p-4 text-left">
          <SheetTitle>Navigate</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-3" aria-label="Mobile">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="hover:bg-muted flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
              >
                <Icon className="size-4" aria-hidden />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
