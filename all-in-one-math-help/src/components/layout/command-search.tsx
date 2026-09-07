"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SUBJECTS } from "@/lib/subjects";
import { FORMULA_BANK } from "@/lib/flashcards/formula-bank";

type CommandItem = {
  id: string;
  label: string;
  group: string;
  href: string;
};

type CommandSearchProps = {
  role: "teacher" | "student";
  classes?: Array<{ id: string; name: string }>;
  assignments?: Array<{ id: string; topic: string; href: string }>;
};

export function CommandSearch({
  role,
  classes = [],
  assignments = [],
}: CommandSearchProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const items = useMemo<CommandItem[]>(() => {
    const base: CommandItem[] = [
      ...SUBJECTS.map((subject) => ({
        id: `subject-${subject.id}`,
        label: subject.name,
        group: "Subjects",
        href:
          role === "student"
            ? "/student/flashcards"
            : "/teacher/assignments/new",
      })),
      ...classes.map((item) => ({
        id: `class-${item.id}`,
        label: item.name,
        group: "Classes",
        href:
          role === "teacher"
            ? `/teacher/classes/${item.id}`
            : `/student/classes/${item.id}`,
      })),
      ...assignments.map((item) => ({
        id: `assignment-${item.id}`,
        label: item.topic,
        group: "Assignments",
        href: item.href,
      })),
      ...Object.entries(FORMULA_BANK).flatMap(([subject, cards]) =>
        cards.map((card) => ({
          id: `formula-${subject}-${card.front}`,
          label: `${card.front} (${subject})`,
          group: "Formulas",
          href: "/student/flashcards",
        })),
      ),
    ];

    if (role === "teacher") {
      base.unshift(
        {
          id: "nav-teacher-dash",
          label: "Teacher dashboard",
          group: "Navigation",
          href: "/teacher/dashboard",
        },
        {
          id: "nav-new-assignment",
          label: "Create assignment",
          group: "Navigation",
          href: "/teacher/assignments/new",
        },
      );
    } else {
      base.unshift(
        {
          id: "nav-student-dash",
          label: "Student dashboard",
          group: "Navigation",
          href: "/student/dashboard",
        },
        {
          id: "nav-scanner",
          label: "Homework tutor",
          group: "Navigation",
          href: "/student/scanner",
        },
        {
          id: "nav-games",
          label: "Math games",
          group: "Navigation",
          href: "/student/games",
        },
        {
          id: "nav-flashcards",
          label: "Formula flashcards",
          group: "Navigation",
          href: "/student/flashcards",
        },
      );
    }

    const q = query.trim().toLowerCase();
    if (!q) return base.slice(0, 40);
    return base.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 40);
  }, [assignments, classes, query, role]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-input text-muted-foreground hover:bg-muted/50 inline-flex h-8 items-center gap-2 rounded-lg border px-2.5 text-sm transition-colors"
        aria-label="Open command search"
      >
        <Search className="size-3.5" aria-hidden />
        <span className="hidden sm:inline">Search</span>
        <kbd className="bg-muted text-muted-foreground ml-1 hidden rounded px-1.5 py-0.5 font-mono text-[10px] sm:inline">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="sr-only">
            <DialogTitle>Command search</DialogTitle>
            <DialogDescription>
              Search subjects, classes, assignments, and formulas.
            </DialogDescription>
          </DialogHeader>
          <div className="border-b p-3">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search subjects, classes, assignments, formulas…"
              autoFocus
              aria-label="Search"
            />
          </div>
          <ul className="max-h-80 overflow-y-auto p-2" role="listbox">
            {items.length === 0 ? (
              <li className="text-muted-foreground px-3 py-6 text-center text-sm">
                No matches.
              </li>
            ) : (
              items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="hover:bg-muted flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm"
                    onClick={() => go(item.href)}
                  >
                    <span>{item.label}</span>
                    <span className="text-muted-foreground text-xs">
                      {item.group}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
