import { z } from "zod";

export const assignmentQuestionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["multiple_choice", "free_response"]),
  prompt: z.string().min(1),
  choices: z.array(z.string()).optional(),
  answer: z.string().min(1),
  explanation: z.string().min(1),
  points: z.number().positive(),
});

export const generatedAssignmentSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  topic: z.string().min(1),
  difficulty: z.string().min(1),
  instructions: z.string().min(1),
  questions: z.array(assignmentQuestionSchema).min(1),
});

export const generateAssignmentInputSchema = z.object({
  classId: z.string().uuid(),
  subject: z.string().min(1),
  topic: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard", "ap", "ib"]),
  questionCount: z.number().int().min(1).max(50),
  format: z.enum([
    "multiple_choice",
    "free_response",
    "mixed",
    "ap_style",
    "ib_style",
  ]),
  calculatorAllowed: z.boolean(),
  includeAnswerKey: z.boolean(),
});

export type GeneratedAssignment = z.infer<typeof generatedAssignmentSchema>;
export type GenerateAssignmentInput = z.infer<
  typeof generateAssignmentInputSchema
>;
