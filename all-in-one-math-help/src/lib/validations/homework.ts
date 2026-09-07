import { z } from "zod";

export const homeworkStepSchema = z.object({
  studentStep: z.string(),
  status: z.enum(["correct", "incorrect", "unclear"]),
  feedback: z.string(),
  hint: z.string().optional(),
});

export const homeworkTutorResponseSchema = z.object({
  assessment: z.string(),
  steps: z.array(homeworkStepSchema),
  nextHint: z.string(),
  encouragingMessage: z.string(),
});

export const scanHomeworkInputSchema = z.object({
  problem: z.string().min(1),
  studentWork: z.string().optional(),
  imageText: z.string().optional(),
  hintLevel: z.number().int().min(0).max(5).default(0),
});

export type HomeworkTutorResponse = z.infer<typeof homeworkTutorResponseSchema>;
export type ScanHomeworkInput = z.infer<typeof scanHomeworkInputSchema>;
