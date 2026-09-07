import { HomeworkScanner } from "@/components/student/homework-scanner";

export default function ScannerPage() {
  return (
    <main className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          AI homework tutor
        </h2>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          Type a problem, paste your work, or upload an image. The tutor checks
          reasoning step-by-step and coaches without spoiling the answer.
        </p>
      </div>
      <HomeworkScanner />
    </main>
  );
}
