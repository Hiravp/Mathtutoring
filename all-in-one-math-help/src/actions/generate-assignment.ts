"use server";

import { revalidatePath } from "next/cache";
import { generateWithPuter } from "@/lib/ai/puter";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  generateAssignmentInputSchema,
  generatedAssignmentSchema,
} from "@/lib/validations/assignment";

export type GenerateAssignmentState = {
  error?: string;
  assignmentId?: string;
  classId?: string;
};

function buildPrompt(input: {
  subject: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  format: string;
  calculatorAllowed: boolean;
  includeAnswerKey: boolean;
}) {
  return `You are an expert math teacher writing a classroom worksheet.

Return ONLY valid JSON matching this shape:
{
  "title": string,
  "subject": string,
  "topic": string,
  "difficulty": string,
  "instructions": string,
  "questions": [
    {
      "id": string,
      "type": "multiple_choice" | "free_response",
      "prompt": string,
      "choices": string[] (required for multiple_choice),
      "answer": string,
      "explanation": string,
      "points": number
    }
  ]
}

Requirements:
- Subject: ${input.subject}
- Topic: ${input.topic}
- Difficulty: ${input.difficulty}
- Format: ${input.format}
- Question count: ${input.questionCount}
- Calculator allowed: ${input.calculatorAllowed}
- Include answer key content in each question's answer/explanation: ${input.includeAnswerKey}
- For mixed/AP/IB style, use a thoughtful mix of multiple_choice and free_response.
- Make prompts mathematically correct and grade-appropriate.
- Each question id should be unique (q1, q2, ...).
`;
}

export async function generateAssignment(
  _prev: GenerateAssignmentState,
  formData: FormData,
): Promise<GenerateAssignmentState> {
  try {
    await requireRole("teacher");

    const parsed = generateAssignmentInputSchema.safeParse({
      classId: formData.get("classId"),
      subject: formData.get("subject"),
      topic: formData.get("topic"),
      difficulty: formData.get("difficulty"),
      questionCount: Number(formData.get("questionCount")),
      format: formData.get("format"),
      calculatorAllowed: formData.get("calculatorAllowed") === "on",
      includeAnswerKey: formData.get("includeAnswerKey") === "on",
    });

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Invalid assignment details.",
      };
    }

    const supabase = await createClient();
    const { data: ownedClass, error: classError } = await supabase
      .from("classes")
      .select("id")
      .eq("id", parsed.data.classId)
      .maybeSingle();

    if (classError || !ownedClass) {
      return { error: "You can only create assignments for your own classes." };
    }

    let raw: string;
    try {
      raw = await generateWithPuter({
        messages: [
          {
            role: "system",
            content: "You generate rigorous math worksheets as strict JSON.",
          },
          { role: "user", content: buildPrompt(parsed.data) },
        ],
        responseFormatJson: true,
        temperature: 0.35,
      });
    } catch {
      return {
        error:
          "Something went wrong while generating the worksheet. Please try again.",
      };
    }

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return {
        error:
          "The AI returned an invalid worksheet. Please try generating again.",
      };
    }

    const validated = generatedAssignmentSchema.safeParse(json);
    if (!validated.success) {
      return {
        error:
          "The AI worksheet failed validation. Please try generating again.",
      };
    }

    const { data: assignment, error: insertError } = await supabase
      .from("assignments")
      .insert({
        class_id: parsed.data.classId,
        topic: validated.data.topic,
        content: validated.data,
      })
      .select("id")
      .single();

    if (insertError || !assignment) {
      return {
        error: "Worksheet generated, but saving failed. Please try again.",
      };
    }

    revalidatePath(`/teacher/classes/${parsed.data.classId}`);
    revalidatePath("/teacher/dashboard");

    return { assignmentId: assignment.id, classId: parsed.data.classId };
  } catch {
    return { error: "You must be signed in as a teacher." };
  }
}
