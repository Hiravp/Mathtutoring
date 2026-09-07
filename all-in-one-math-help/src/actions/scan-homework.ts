"use server";

import { generateWithPuter } from "@/lib/ai/puter";
import { requireRole } from "@/lib/auth/session";
import {
  homeworkTutorResponseSchema,
  scanHomeworkInputSchema,
} from "@/lib/validations/homework";

export type ScanHomeworkState = {
  error?: string;
  result?: {
    assessment: string;
    steps: Array<{
      studentStep: string;
      status: "correct" | "incorrect" | "unclear";
      feedback: string;
      hint?: string;
    }>;
    nextHint: string;
    encouragingMessage: string;
  };
};

const TUTOR_SYSTEM = `Act as a supportive math tutor.

Check the student's work step-by-step.

If there is an error:
- identify the exact step where the reasoning went wrong
- explain why it is incorrect
- provide a useful hint
- help the student figure out the correction

Do NOT simply provide the final answer.

Prioritize teaching the student's reasoning process over producing an answer.

Return ONLY JSON:
{
  "assessment": string,
  "steps": [
    {
      "studentStep": string,
      "status": "correct" | "incorrect" | "unclear",
      "feedback": string,
      "hint": string (optional)
    }
  ],
  "nextHint": string,
  "encouragingMessage": string
}`;

export async function scanHomework(
  _prev: ScanHomeworkState,
  formData: FormData,
): Promise<ScanHomeworkState> {
  try {
    await requireRole("student");

    const parsed = scanHomeworkInputSchema.safeParse({
      problem: formData.get("problem"),
      studentWork: formData.get("studentWork") || undefined,
      imageText: formData.get("imageText") || undefined,
      hintLevel: Number(formData.get("hintLevel") ?? 0),
    });

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Enter a math problem to check.",
      };
    }

    const hintGuidance =
      parsed.data.hintLevel === 0
        ? "Give a gentle conceptual nudge."
        : parsed.data.hintLevel === 1
          ? "Give a stronger hint about the method."
          : parsed.data.hintLevel >= 2
            ? "Give a detailed scaffolded hint, still without the final answer."
            : "Give a gentle conceptual nudge.";

    let raw: string;
    try {
      raw = await generateWithPuter({
        messages: [
          { role: "system", content: TUTOR_SYSTEM },
          {
            role: "user",
            content: JSON.stringify({
              problem: parsed.data.problem,
              studentWork: parsed.data.studentWork ?? "",
              imageText: parsed.data.imageText ?? "",
              hintGuidance,
            }),
          },
        ],
        responseFormatJson: true,
        temperature: 0.25,
      });
    } catch {
      return {
        error:
          "Something went wrong while checking your work. Please try again.",
      };
    }

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return {
        error: "The tutor response was invalid. Please try again.",
      };
    }

    const validated = homeworkTutorResponseSchema.safeParse(json);
    if (!validated.success) {
      return {
        error: "The tutor response failed validation. Please try again.",
      };
    }

    return { result: validated.data };
  } catch {
    return { error: "You must be signed in as a student to use the tutor." };
  }
}
