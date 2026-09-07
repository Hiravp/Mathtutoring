"use client";

import { useState } from "react";
import {
  FlashcardDeck,
  type Flashcard,
} from "@/components/flashcards/flashcard-deck";
import { GenerateFlashcardsForm } from "@/components/flashcards/generate-flashcards-form";
import { FORMULA_BANK } from "@/lib/flashcards/formula-bank";

const ALGEBRA_DECK: Flashcard[] = FORMULA_BANK.Algebra.map((card) => ({
  front: card.front,
  back: card.back,
  explanation: card.explanation,
}));

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>(ALGEBRA_DECK);
  const [deckKey, setDeckKey] = useState(0);

  return (
    <main className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Flashcards</h2>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          Review core formulas by subject, then generate a custom deck for the
          topic you are studying.
        </p>
      </div>
      <GenerateFlashcardsForm
        onGenerated={(next) => {
          setCards(next);
          setDeckKey((value) => value + 1);
        }}
      />
      <FlashcardDeck key={deckKey} cards={cards} />
    </main>
  );
}
