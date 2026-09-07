import Link from "next/link";
import {
  BookOpenCheck,
  Brain,
  ChartColumnIncreasing,
  Gamepad2,
  GraduationCap,
  ScanLine,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    title: "AI Homework Tutor",
    description: "Step-by-step coaching that teaches reasoning, not just answers.",
    icon: ScanLine,
  },
  {
    title: "AI Worksheet Generator",
    description: "Teachers create AP/IB-ready practice in seconds with Puter.js AI.",
    icon: Sparkles,
  },
  {
    title: "Interactive Math Games",
    description: "Rapid Fire mental math and equation balancing with streak tracking.",
    icon: Gamepad2,
  },
  {
    title: "Formula Flashcards",
    description: "Master formulas across Algebra through Calculus, AP, and IB.",
    icon: BookOpenCheck,
  },
  {
    title: "Teacher Class Management",
    description: "Create classes, share join codes, and review submissions securely.",
    icon: Users,
  },
  {
    title: "AP & IB Support",
    description: "Formats and difficulty levels tailored for advanced pathways.",
    icon: GraduationCap,
  },
  {
    title: "Progress Tracking",
    description: "See completion, accuracy, and topics that need more practice.",
    icon: ChartColumnIncreasing,
  },
  {
    title: "Personalized Practice",
    description: "Flashcards, games, and tutoring adapt to what you’re learning.",
    icon: Brain,
  },
] as const;

export default function HomePage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_oklch(0.96_0.02_250),_transparent_55%),linear-gradient(to_bottom,_oklch(0.99_0.01_90),_oklch(0.97_0.01_220))]"
      />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <p className="text-sm font-semibold tracking-tight">All-in-One Math Help</p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
            Log In
          </Button>
          <Button nativeButton={false} render={<Link href="/signup" />}>
            Get Started
          </Button>
        </div>
      </header>

      <main>
        <section className="mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col justify-center gap-8 px-6 pb-20 pt-10">
          <div className="max-w-3xl space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <p className="text-muted-foreground text-sm font-medium tracking-[0.2em] uppercase">
              All-in-One Math Help
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              Everything you need to learn, practice, teach, and master advanced
              mathematics.
            </h1>
            <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
              A modern academic workspace for teachers and students — AI tutoring,
              worksheets, games, flashcards, and class tools in one place.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/signup" />}
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Log In
              </Button>
            </div>
          </div>
        </section>

        <section className="border-border/60 border-t bg-background/70 py-16 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Built for real classrooms
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Modular tools for Algebra through Calculus, with AP and IB support —
                ready to grow without rebuilding the architecture.
              </p>
            </div>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <li
                    key={feature.title}
                    className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-700"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div className="space-y-3">
                      <Icon className="text-foreground/80 size-5" aria-hidden />
                      <h3 className="font-medium">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>

      <footer className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-10 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span>All-in-One Math Help · Secure by design · Teachers and students</span>
        <a
          href="https://developer.puter.com"
          className="underline-offset-4 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by Puter
        </a>
      </footer>
    </div>
  );
}
