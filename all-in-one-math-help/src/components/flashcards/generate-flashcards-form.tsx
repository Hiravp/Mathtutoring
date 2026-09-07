"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import {
  generateFlashcards,
  type GenerateFlashcardsState,
} from "@/actions/generate-flashcards";
import type { Flashcard } from "@/components/flashcards/flashcard-deck";
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
import {
  getCategoryLabel,
  getSubjectsByCategory,
  SUBJECT_CATEGORIES,
} from "@/lib/subjects";

const initial: GenerateFlashcardsState = {};

type GenerateFlashcardsFormProps = {
  onGenerated: (cards: Flashcard[], usedFallback?: boolean) => void;
};

export function GenerateFlashcardsForm({
  onGenerated,
}: GenerateFlashcardsFormProps) {
  const onGeneratedRef = useRef(onGenerated);
  const [state, action, pending] = useActionState(generateFlashcards, initial);

  useEffect(() => {
    onGeneratedRef.current = onGenerated;
  }, [onGenerated]);

  useEffect(() => {
    if (state.cards && state.cards.length > 0) {
      onGeneratedRef.current(state.cards, state.usedFallback);
    }
  }, [state.cards, state.usedFallback]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate a set</CardTitle>
        <CardDescription>
          Ask the tutor for a focused deck, or fall back to the formula bank if
          generation is unavailable.
        </CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="flashcards-subject">Subject</Label>
            <select
              id="flashcards-subject"
              name="subject"
              required
              className="border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm"
              defaultValue="Algebra"
            >
              {SUBJECT_CATEGORIES.map((category) => (
                <optgroup key={category.id} label={getCategoryLabel(category.id)}>
                  {getSubjectsByCategory(category.id).map((subject) => (
                    <option key={subject.id} value={subject.name}>
                      {subject.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="flashcards-topic">Topic</Label>
            <Input
              id="flashcards-topic"
              name="topic"
              required
              placeholder="Quadratic formula"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flashcards-difficulty">Difficulty</Label>
            <select
              id="flashcards-difficulty"
              name="difficulty"
              className="border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm"
              defaultValue="medium"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="flashcards-count">Number of cards</Label>
            <Input
              id="flashcards-count"
              name="numberOfCards"
              type="number"
              min={1}
              max={30}
              defaultValue={8}
              required
            />
          </div>
          {state.error ? (
            <p role="alert" className="text-destructive text-sm sm:col-span-2">
              {state.error}
            </p>
          ) : null}
          {state.usedFallback ? (
            <p
              role="status"
              className="text-muted-foreground text-sm sm:col-span-2"
            >
              Used the local formula bank because generation was unavailable.
            </p>
          ) : null}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={pending}>
            {pending ? "Generating…" : "Generate flashcards"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
