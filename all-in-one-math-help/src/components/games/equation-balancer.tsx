"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  applyBalanceOperation,
  describeOperation,
  generateEquationPuzzle,
  isSolved,
  type BalanceOperation,
  type EquationOpType,
  type EquationPuzzle,
} from "@/lib/games/equation-balancer";
import {
  GAME_DIFFICULTIES,
  accuracyPercent,
  createGameStats,
  formatAccuracy,
  recordAttempt,
  type GameDifficulty,
  type GameStats,
} from "@/lib/games/types";

type Phase = "ready" | "playing" | "solved";

const OP_TYPES: Array<{ value: EquationOpType; label: string }> = [
  { value: "add", label: "Add" },
  { value: "subtract", label: "Subtract" },
  { value: "multiply", label: "Multiply" },
  { value: "divide", label: "Divide" },
  { value: "simplify", label: "Simplify" },
];

function difficultyLabel(difficulty: GameDifficulty): string {
  return difficulty[0]?.toUpperCase() + difficulty.slice(1);
}

function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="min-w-0">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function EquationBalancer() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [difficulty, setDifficulty] = useState<GameDifficulty>("easy");
  const [puzzle, setPuzzle] = useState<EquationPuzzle | null>(null);
  const [stats, setStats] = useState<GameStats>(createGameStats);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [customType, setCustomType] = useState<EquationOpType>("subtract");
  const [customValue, setCustomValue] = useState("");

  useEffect(() => {
    if (phase !== "playing") return;
    const startedAt = Date.now();
    const id = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 250);
    return () => window.clearInterval(id);
  }, [phase, puzzle?.display]);

  const customNeedsValue = customType !== "simplify";

  function beginPuzzle() {
    const next = generateEquationPuzzle(difficulty);
    setPuzzle(next);
    setStats(createGameStats());
    setElapsedMs(0);
    setHistory([next.display]);
    setFeedback("Choose an operation that keeps both sides equal.");
    setCustomValue("");
    setPhase("playing");
  }

  function apply(operation: BalanceOperation) {
    if (!puzzle || phase !== "playing") return;

    const result = applyBalanceOperation(puzzle, operation);
    if (result.error) {
      setFeedback(result.error);
      setStats((current) => recordAttempt(current, false));
      return;
    }

    setPuzzle(result.puzzle);
    setHistory((current) => [
      ...current,
      `${describeOperation(operation)} → ${result.puzzle.display}`,
    ]);
    setStats((current) => recordAttempt(current, result.correct));

    if (isSolved(result.puzzle)) {
      setFeedback(`Solved. x = ${result.puzzle.solution}.`);
      setPhase("solved");
      return;
    }

    setFeedback(
      result.correct
        ? "Balanced and closer to isolating x."
        : "The sides stay equal, but that step does not move toward x.",
    );
  }

  function applyCustom() {
    if (customType === "simplify") {
      apply({ type: "simplify", label: "Simplify both sides" });
      return;
    }
    const parsed = Number(customValue.trim());
    apply({
      type: customType,
      value: parsed,
      label: "",
    });
  }

  if (phase === "ready") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Equation Balancer</CardTitle>
          <CardDescription>
            Keep both sides equal while isolating x. Start with equations such
            as 2x + 5 = 17.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="balancer-difficulty">Difficulty</Label>
            <select
              id="balancer-difficulty"
              className="border-input bg-background h-8 w-full max-w-xs rounded-lg border px-2.5 text-sm"
              value={difficulty}
              onChange={(event) => {
                const value = event.target.value;
                if (
                  value === "easy" ||
                  value === "medium" ||
                  value === "hard"
                ) {
                  setDifficulty(value);
                }
              }}
            >
              {GAME_DIFFICULTIES.map((level) => (
                <option key={level} value={level}>
                  {difficultyLabel(level)}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="button" size="lg" onClick={beginPuzzle}>
            New equation
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!puzzle) return null;

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Equation Balancer</CardTitle>
            <CardDescription>
              {difficultyLabel(difficulty)} · Operate on both sides
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Score {stats.score}</Badge>
            <Badge variant="secondary">Streak {stats.streak}</Badge>
            <Badge variant="outline">{accuracyPercent(stats)}% accuracy</Badge>
            <Badge variant="outline">{formatElapsed(elapsedMs)}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p
          className="font-mono text-2xl font-semibold tracking-tight sm:text-3xl"
          aria-live="polite"
        >
          {puzzle.display}
        </p>

        {phase === "solved" ? (
          <div className="space-y-3">
            <p role="status" className="text-sm">
              x = {puzzle.solution}. Completion time {formatElapsed(elapsedMs)}.
            </p>
            <div className="grid gap-3 sm:grid-cols-4">
              <Stat label="Score" value={stats.score} />
              <Stat label="Accuracy" value={formatAccuracy(stats)} />
              <Stat label="Best streak" value={stats.bestStreak} />
              <Stat label="Time" value={formatElapsed(elapsedMs)} />
            </div>
            {puzzle.steps.length > 0 ? (
              <ol className="text-muted-foreground list-decimal space-y-1 pl-5 text-sm">
                {puzzle.steps.map((step, index) => (
                  <li key={`${step.display}-${index}`}>
                    {step.operation.label}: {step.display}
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">
                Equality-preserving moves
              </legend>
              <div className="flex flex-wrap gap-2">
                {puzzle.choices.map((operation, index) => (
                  <Button
                    key={`${operation.type}-${operation.value ?? "none"}-${index}`}
                    type="button"
                    variant="outline"
                    onClick={() => apply(operation)}
                  >
                    {operation.label}
                  </Button>
                ))}
              </div>
            </fieldset>

            <form
              className="grid gap-3 sm:grid-cols-[minmax(0,10rem)_minmax(0,8rem)_auto] sm:items-end"
              onSubmit={(event) => {
                event.preventDefault();
                applyCustom();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="balancer-op">Custom operation</Label>
                <select
                  id="balancer-op"
                  className="border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm"
                  value={customType}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (
                      value === "add" ||
                      value === "subtract" ||
                      value === "multiply" ||
                      value === "divide" ||
                      value === "simplify"
                    ) {
                      setCustomType(value);
                    }
                  }}
                >
                  {OP_TYPES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="balancer-value">Value</Label>
                <Input
                  id="balancer-value"
                  inputMode="decimal"
                  autoComplete="off"
                  disabled={!customNeedsValue}
                  value={customValue}
                  onChange={(event) => setCustomValue(event.target.value)}
                  aria-required={customNeedsValue}
                />
              </div>
              <Button type="submit">Apply to both sides</Button>
            </form>
          </div>
        )}

        <p role="status" aria-live="polite" className="text-muted-foreground text-sm">
          {feedback}
        </p>

        {history.length > 1 ? (
          <ol className="text-muted-foreground list-decimal space-y-1 pl-5 text-sm">
            {history.map((line, index) => (
              <li key={`${line}-${index}`}>{line}</li>
            ))}
          </ol>
        ) : null}
      </CardContent>
      <CardFooter className="gap-2">
        <Button type="button" onClick={beginPuzzle}>
          {phase === "solved" ? "Next equation" : "Reset"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setPhase("ready")}
        >
          Change difficulty
        </Button>
      </CardFooter>
    </Card>
  );
}

export { EquationBalancer as EquationBalancerGame };
