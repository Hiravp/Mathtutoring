"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  FORMULA_BANK,
  type FormulaSubject,
} from "@/lib/flashcards/formula-bank";
import { SUBJECTS, type SubjectName, getCategoryLabel, getSubjectsByCategory, SUBJECT_CATEGORIES } from "@/lib/subjects";

export type Flashcard = {
  front: string;
  back: string;
  explanation: string;
};

type CardMark = "known" | "practice";

type FlashcardDeckProps = {
  cards?: Flashcard[];
};

function isFormulaSubject(value: string): value is FormulaSubject {
  return value in FORMULA_BANK;
}

function bankForSubject(subject: SubjectName): Flashcard[] {
  if (!isFormulaSubject(subject)) {
    return FORMULA_BANK.Algebra.map((card) => ({
      front: card.front,
      back: card.back,
      explanation: card.explanation,
    }));
  }
  return FORMULA_BANK[subject].map((card) => ({
    front: card.front,
    back: card.back,
    explanation: card.explanation,
  }));
}

function shuffleCards(cards: Flashcard[]): Flashcard[] {
  const next = [...cards];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = next[i];
    const swap = next[j];
    if (current === undefined || swap === undefined) continue;
    next[i] = swap;
    next[j] = current;
  }
  return next;
}

function cardKey(card: Flashcard): string {
  return `${card.front}::${card.back}::${card.explanation}`;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function FlashcardDeck({ cards }: FlashcardDeckProps) {
  const [subject, setSubject] = useState<SubjectName>("Algebra");
  const [deck, setDeck] = useState<Flashcard[]>(
    () => cards ?? bankForSubject("Algebra"),
  );
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [marks, setMarks] = useState<Record<string, CardMark>>({});

  const total = deck.length;
  const current = deck[index];
  const knownCount = Object.values(marks).filter((mark) => mark === "known").length;
  const practiceCount = Object.values(marks).filter(
    (mark) => mark === "practice",
  ).length;
  const progress = total === 0 ? 0 : Math.round((knownCount / total) * 100);
  const currentMark = current ? marks[cardKey(current)] : undefined;

  function goNext() {
    if (total === 0) return;
    setIndex((currentIndex) => (currentIndex + 1) % total);
    setFlipped(false);
  }

  function goPrevious() {
    if (total === 0) return;
    setIndex((currentIndex) => (currentIndex - 1 + total) % total);
    setFlipped(false);
  }

  function markCurrent(mark: CardMark) {
    if (!current) return;
    setMarks((currentMarks) => ({ ...currentMarks, [cardKey(current)]: mark }));
    goNext();
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevious();
        return;
      }
      if (event.key === "k" || event.key === "K") {
        event.preventDefault();
        markCurrent("known");
        return;
      }
      if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        markCurrent("practice");
        return;
      }
      if (event.key === " " || event.key === "Enter") {
        if (
          event.target instanceof HTMLElement &&
          event.target.closest("button")
        ) {
          return;
        }
        event.preventDefault();
        setFlipped((value) => !value);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function onSubjectChange(next: SubjectName) {
    setSubject(next);
    setDeck(bankForSubject(next));
    setIndex(0);
    setFlipped(false);
    setMarks({});
  }

  if (!current || total === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No flashcards in this deck yet.
      </p>
    );
  }

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Formula deck</CardTitle>
            <CardDescription>
              Space or Enter to flip · arrows to move · K known · N needs
              practice
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {index + 1} / {total}
            </Badge>
            <Badge variant="secondary">{knownCount} known</Badge>
            <Badge variant="outline">{practiceCount} to practice</Badge>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="flashcard-subject">Subject</Label>
          <select
            id="flashcard-subject"
            className="border-input bg-background h-8 w-full max-w-xs rounded-lg border px-2.5 text-sm"
            value={subject}
            onChange={(event) => {
              const value = event.target.value;
              const match = SUBJECTS.find((item) => item.name === value);
              if (match) onSubjectChange(match.name);
            }}
          >
            {SUBJECT_CATEGORIES.map((category) => (
              <optgroup key={category.id} label={getCategoryLabel(category.id)}>
                {getSubjectsByCategory(category.id).map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Mastered
            </p>
            <p className="text-sm tabular-nums">{progress}%</p>
          </div>
          <Progress value={progress} aria-label={`Mastered ${progress}%`} />
        </div>
      </CardHeader>
      <CardContent>
        <button
          type="button"
          aria-pressed={flipped}
          aria-label={flipped ? "Show formula name" : "Show formula"}
          onClick={() => setFlipped((value) => !value)}
          className="border-border bg-muted/40 hover:bg-muted/70 focus-visible:ring-ring min-h-48 w-full rounded-xl border p-6 text-left transition-colors focus-visible:ring-3 focus-visible:outline-none"
        >
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {flipped ? "Formula" : "Name"}
          </p>
          <p className="mt-3 font-mono text-xl font-semibold tracking-tight sm:text-2xl">
            {flipped ? current.back : current.front}
          </p>
          {flipped ? (
            <p className="text-muted-foreground mt-3 text-sm">
              {current.explanation}
            </p>
          ) : (
            <p className="text-muted-foreground mt-3 text-sm">
              Flip to reveal the formula.
            </p>
          )}
          {currentMark ? (
            <p className="mt-4 text-sm">
              Marked as {currentMark === "known" ? "known" : "needs practice"}.
            </p>
          ) : null}
        </button>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={goPrevious}>
          Previous
        </Button>
        <Button type="button" variant="outline" onClick={goNext}>
          Next
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setDeck((currentDeck) => shuffleCards(currentDeck));
            setIndex(0);
            setFlipped(false);
          }}
        >
          Shuffle
        </Button>
        <Button type="button" onClick={() => markCurrent("known")}>
          Known
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => markCurrent("practice")}
        >
          Needs practice
        </Button>
      </CardFooter>
    </Card>
  );
}
