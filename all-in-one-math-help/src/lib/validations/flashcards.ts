import { z } from "zod";

export const flashcardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1),
  explanation: z.string().min(1),
});

export const generatedFlashcardsSchema = z.object({
  cards: z.array(flashcardSchema).min(1),
});

export const generateFlashcardsInputSchema = z.object({
  subject: z.string().min(1),
  topic: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  numberOfCards: z.number().int().min(1).max(30),
});

export type GeneratedFlashcards = z.infer<typeof generatedFlashcardsSchema>;
export type GenerateFlashcardsInput = z.infer<
  typeof generateFlashcardsInputSchema
>;
