"use client";

import { useActionState, useState, useTransition } from "react";
import { scanHomework, type ScanHomeworkState } from "@/actions/scan-homework";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { extractTextFromImage, OCR_DEMO_NOTICE } from "@/lib/ocr";

const initial: ScanHomeworkState = {};

export function HomeworkScanner() {
  const [state, action, pending] = useActionState(scanHomework, initial);
  const [imageText, setImageText] = useState("");
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [ocrPending, startOcr] = useTransition();

  function onFileChange(file: File | null) {
    setOcrError(null);
    if (!file) {
      setImageText("");
      return;
    }
    startOcr(async () => {
      try {
        const text = await extractTextFromImage(file);
        setImageText(text);
      } catch (error) {
        setImageText("");
        setOcrError(
          error instanceof Error
            ? error.message
            : "Could not process that image.",
        );
      }
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <form action={action} className="space-y-4">
        <input type="hidden" name="imageText" value={imageText} />
        <input type="hidden" name="hintLevel" value={hintLevel} />

        <div className="space-y-2">
          <Label htmlFor="problem">Math problem</Label>
          <Textarea
            id="problem"
            name="problem"
            required
            rows={3}
            placeholder="e.g. Solve 2x + 5 = 17"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="studentWork">Your work (optional)</Label>
          <Textarea
            id="studentWork"
            name="studentWork"
            rows={5}
            placeholder="Paste your steps here…"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Upload work image (optional)</Label>
          <Input
            id="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          />
          <p className="text-muted-foreground text-xs">{OCR_DEMO_NOTICE}</p>
          {ocrPending ? (
            <p className="text-muted-foreground text-xs">Running OCR…</p>
          ) : null}
          {ocrError ? (
            <p role="alert" className="text-destructive text-sm">
              {ocrError}
            </p>
          ) : null}
          {imageText ? (
            <pre className="bg-muted max-h-40 overflow-auto rounded-lg p-3 text-xs whitespace-pre-wrap">
              {imageText}
            </pre>
          ) : null}
        </div>

        {state.error ? (
          <p role="alert" className="text-destructive text-sm">
            {state.error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending || ocrPending}>
            {pending ? "Checking…" : "Check my work"}
          </Button>
          <Button
            type="submit"
            variant="outline"
            disabled={pending || !state.result}
            onClick={() => setHintLevel((value) => Math.min(5, value + 1))}
          >
            Stronger hint
          </Button>
        </div>
      </form>

      <section className="bg-card ring-foreground/10 space-y-4 rounded-xl p-4 ring-1">
        <h3 className="font-medium">Tutor feedback</h3>
        {!state.result ? (
          <p className="text-muted-foreground text-sm">
            Submit a problem to get step-by-step coaching. The tutor will not
            dump the final answer.
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm">{state.result.assessment}</p>
            <ul className="space-y-3">
              {state.result.steps.map((step, index) => (
                <li
                  key={`${step.studentStep}-${index}`}
                  className="border-border space-y-1 border-b pb-3 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        step.status === "correct"
                          ? "secondary"
                          : step.status === "incorrect"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {step.status}
                    </Badge>
                    <span className="text-sm font-medium">{step.studentStep}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{step.feedback}</p>
                  {step.hint ? (
                    <p className="text-sm">Hint: {step.hint}</p>
                  ) : null}
                </li>
              ))}
            </ul>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Next hint:</span>{" "}
                {state.result.nextHint}
              </p>
              <p className="text-emerald-700 dark:text-emerald-400">
                {state.result.encouragingMessage}
              </p>
              <p className="text-muted-foreground text-xs">
                Hint strength level: {hintLevel}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
