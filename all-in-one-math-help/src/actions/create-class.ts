"use server";

import { revalidatePath } from "next/cache";
import { generateClassCode } from "@/lib/class-codes";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createClassWithSubjectSchema } from "@/lib/validations/subjects";

export type CreateClassState = {
  error?: string;
  classId?: string;
  classCode?: string;
};

export async function createClass(
  _prev: CreateClassState,
  formData: FormData,
): Promise<CreateClassState> {
  try {
    const profile = await requireRole("teacher");
    const parsed = createClassWithSubjectSchema.safeParse({
      name: formData.get("name"),
      subjectId: formData.get("subjectId"),
    });

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Invalid class details.",
      };
    }

    const supabase = await createClient();

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const classCode = generateClassCode();
      const { data, error } = await supabase
        .from("classes")
        .insert({
          teacher_id: profile.id,
          name: parsed.data.name,
          class_code: classCode,
          subject_id: parsed.data.subjectId,
        })
        .select("id, class_code")
        .single();

      if (!error && data) {
        revalidatePath("/teacher/dashboard");
        return { classId: data.id, classCode: data.class_code };
      }

      // Unique violation — regenerate code and retry.
      if (error?.code === "23505") {
        continue;
      }

      return {
        error: "Something went wrong while creating the class. Please try again.",
      };
    }

    return {
      error: "Could not generate a unique class code. Please try again.",
    };
  } catch {
    return { error: "You must be signed in as a teacher to create a class." };
  }
}
