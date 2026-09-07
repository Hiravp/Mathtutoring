"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const joinClassSchema = z.object({
  classCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/,
      "Enter a valid 6-character class code",
    ),
});

export type JoinClassState = {
  error?: string;
  classId?: string;
  message?: string;
};

export async function joinClass(
  _prev: JoinClassState,
  formData: FormData,
): Promise<JoinClassState> {
  try {
    const profile = await requireRole("student");

    const parsed = joinClassSchema.safeParse({
      classCode: formData.get("classCode"),
    });

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Invalid class code.",
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("join_class_by_code", {
      p_code: parsed.data.classCode,
    });

    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes("invalid class code")) {
        return { error: "That class code was not found. Check with your teacher." };
      }
      if (message.includes("only students")) {
        return { error: "Only students can join classes." };
      }
      return { error: "Something went wrong while joining the class. Please try again." };
    }

    const classId = typeof data === "string" ? data : String(data);

    const { data: classRow } = await supabase
      .from("classes")
      .select("subject_id")
      .eq("id", classId)
      .maybeSingle();

    if (classRow?.subject_id) {
      await supabase.from("student_subjects").upsert(
        {
          student_id: profile.id,
          subject_id: classRow.subject_id,
        },
        { onConflict: "student_id,subject_id" },
      );
    }

    revalidatePath("/student/dashboard");
    revalidatePath(`/student/classes/${classId}`);

    return {
      classId,
      message: "You joined the class successfully.",
    };
  } catch {
    return { error: "You must be signed in as a student to join a class." };
  }
}
