"use server";

import { generateWithPuter } from "@/lib/ai/puter";
import { requireRole } from "@/lib/auth/session";
import { FORMULA_BANK, type FormulaSubject } from "@/lib/flashcards/formula-bank";
import {
  generateFlashcardsInputSchema,
  generatedFlashcardsSchema,
} from "@/lib/validations/flashcards";

export type GenerateFlashcardsState = {
  error?: string;
  cards?: Array<{ front: string; back: string; explanation: string }>;
  usedFallback?: boolean;
};

function fallbackCards(
  subject: string,
  numberOfCards: number,
): Array<{ front: string; back: string; explanation: string }> {
  const bank =
    FORMULA_BANK[subject as FormulaSubject] ?? FORMULA_BANK.Algebra;
  const cards = [...bank];
  while (cards.length < numberOfCards) {
    cards.push(...bank);
  }
  return cards.slice(0, numberOfCards).map((card) => ({
    front: card.front,
    back: card.back,
    explanation: card.explanation,
  }));
}

export async function generateFlashcards(
  _prev: GenerateFlashcardsState,
  formData: FormData,
): Promise<GenerateFlashcardsState> {
  try {
    await requireRole("student");

    const parsed = generateFlashcardsInputSchema.safeParse({
      subject: formData.get("subject"),
      topic: formData.get("topic"),
      difficulty: formData.get("difficulty"),
      numberOfCards: Number(formData.get("numberOfCards")),
    });

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Invalid flashcard request.",
      };
    }

    try {
      const raw = await generateWithPuter({
        messages: [
          {
            role: "system",
            content:
              "You create concise math formula flashcards. Return ONLY JSON: {\"cards\":[{\"front\":\"\",\"back\":\"\",\"explanation\":\"\"}]}",
          },
          {
            role: "user",
            content: JSON.stringify(parsed.data),
          },
        ],
        responseFormatJson: true,
        temperature: 0.4,
      });

      const json = JSON.parse(raw) as unknown;
      const validated = generatedFlashcardsSchema.safeParse(json);
      if (validated.success) {
        return { cards: validated.data.cards };
      }
    } catch {
      // Fall through to local formula bank.
    }

    return {
      cards: fallbackCards(parsed.data.subject, parsed.data.numberOfCards),
      usedFallback: true,
    };
  } catch {
    return { error: "You must be signed in as a student." };
  }
}
