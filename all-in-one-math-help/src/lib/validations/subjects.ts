import { z } from "zod";
import { SUBJECT_IDS } from "@/lib/subjects";

export const saveStudentSubjectsSchema = z.object({
  subjectIds: z
    .array(z.enum(SUBJECT_IDS))
    .min(1, "Select at least one subject"),
});

export const createClassWithSubjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Class name must be at least 2 characters")
    .max(80, "Class name is too long"),
  subjectId: z.enum(SUBJECT_IDS, {
    error: "Select a subject for this class",
  }),
});
