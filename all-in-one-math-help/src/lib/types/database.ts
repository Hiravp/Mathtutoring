import type { GeneratedAssignment } from "@/lib/validations/assignment";

export type DbUser = {
  id: string;
  role: "teacher" | "student";
  full_name: string | null;
  email: string | null;
};

export type DbClass = {
  id: string;
  teacher_id: string;
  name: string;
  class_code: string;
  subject_id: string | null;
  created_at: string;
};

export type DbStudentSubject = {
  student_id: string;
  subject_id: string;
  created_at: string;
};

export type DbEnrollment = {
  class_id: string;
  student_id: string;
  created_at: string;
};

export type DbAssignment = {
  id: string;
  class_id: string;
  topic: string;
  content: GeneratedAssignment;
  created_at: string;
};

export type DbSubmission = {
  id: string;
  assignment_id: string;
  student_id: string;
  answers: Record<string, string>;
  ai_feedback: string | null;
  created_at: string;
  updated_at: string;
};
