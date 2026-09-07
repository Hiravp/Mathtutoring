import { GenerateAssignmentForm } from "@/components/teacher/generate-assignment-form";
import { getCurrentUserProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function NewAssignmentPage() {
  const profile = await getCurrentUserProfile();
  const supabase = await createClient();
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name")
    .eq("teacher_id", profile!.id)
    .order("created_at", { ascending: false });

  return (
    <main className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          AI worksheet generator
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Puter.js AI drafts a validated worksheet for one of your classes. Answer
          keys stay teacher-side.
        </p>
      </div>
      <GenerateAssignmentForm classes={classes ?? []} />
    </main>
  );
}
