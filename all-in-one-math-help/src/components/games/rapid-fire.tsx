"use client";

import { useEffect, useRef, useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import {
  answersMatch,
  generateMentalMathQuestion,
  type MentalMathQuestion,
} from "@/lib/games/mental-math";
import {
  GAME_DIFFICULTIES,
  accuracyPercent,
  createGameStats,
  formatAccuracy,
  recordAttempt,
  totalAttempts,
  type GameDifficulty,
  type GameStats,
} from "@/lib/games/types";

const ROUND_SECONDS = 60;

type Phase = "ready" | "playing" | "results";

function difficultyLabel(difficulty: GameDifficulty): string {
  return difficulty[0]?.toUpperCase() + difficulty.slice(1);
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

export function RapidFire() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [difficulty, setDifficulty] = useState<GameDifficulty>("easy");
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [stats, setStats] = useState<GameStats>(createGameStats);
  const [question, setQuestion] = useState<MentalMathQuestion | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase !== "playing" || secondsLeft <= 0) return;
    const id = window.setTimeout(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [phase, secondsLeft]);

  useEffect(() => {
    if (phase === "playing") {
      inputRef.current?.focus();
    }
  }, [phase, question]);

  function startRound() {
    setStats(createGameStats());
    setSecondsLeft(ROUND_SECONDS);
    setAnswer("");
    setFeedback(null);
    setQuestion(generateMentalMathQuestion(difficulty));
    setPhase("playing");
  }

  function submitAnswer() {
    if (phase !== "playing" || !question) return;
    if (answer.trim() === "") {
      setFeedback("Enter a number, then press Enter.");
      return;
    }

    const correct = answersMatch(answer, question.answer);
    setStats((current) => recordAttempt(current, correct));
    setFeedback(
      correct
        ? "Correct."
        : `Incorrect — ${question.prompt} = ${question.answer}`,
    );
    setQuestion(generateMentalMathQuestion(difficulty));
    setAnswer("");
  }

  const timeProgress = (secondsLeft / ROUND_SECONDS) * 100;
  const showResults = phase === "results" || (phase === "playing" && secondsLeft === 0);

  if (showResults) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Round complete</CardTitle>
          <CardDescription>
            {difficultyLabel(difficulty)} · {ROUND_SECONDS}-second drill
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <Stat label="Score" value={stats.score} />
          <Stat label="Streak" value={stats.bestStreak} />
          <Stat label="Accuracy" value={formatAccuracy(stats)} />
          <Stat label="Answered" value={totalAttempts(stats)} />
        </CardContent>
        <CardFooter className="gap-2">
          <Button type="button" onClick={startRound}>
            Play again
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

  if (phase === "ready") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rapid Fire</CardTitle>
          <CardDescription>
            Sixty seconds of addition, subtraction, multiplication, and exact
            division.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rapid-fire-difficulty">Difficulty</Label>
            <select
              id="rapid-fire-difficulty"
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
          <Button type="button" size="lg" onClick={startRound}>
            Start 60-second round
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Rapid Fire</CardTitle>
            <CardDescription>
              {difficultyLabel(difficulty)} · Enter to submit
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Score {stats.score}</Badge>
            <Badge variant="secondary">Streak {stats.streak}</Badge>
            <Badge variant="outline">{accuracyPercent(stats)}% accuracy</Badge>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Time remaining
            </p>
            <p
              className="text-sm font-medium tabular-nums"
              aria-live="polite"
              aria-atomic="true"
            >
              {secondsLeft}s
            </p>
          </div>
          <Progress
            value={timeProgress}
            aria-label={`Time remaining: ${secondsLeft} seconds`}
          />
        </div>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            submitAnswer();
          }}
        >
          <p className="font-mono text-3xl font-semibold tracking-tight sm:text-4xl">
            {question?.prompt ?? "…"}
          </p>
          <div className="space-y-2">
            <Label htmlFor="rapid-fire-answer">Answer</Label>
            <Input
              ref={inputRef}
              id="rapid-fire-answer"
              name="answer"
              inputMode="decimal"
              autoComplete="off"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              aria-describedby={feedback ? "rapid-fire-feedback" : undefined}
            />
          </div>
          <p
            id="rapid-fire-feedback"
            role="status"
            aria-live="polite"
            className="text-muted-foreground min-h-5 text-sm"
          >
            {feedback}
          </p>
          <Button type="submit">Check</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export { RapidFire as RapidFireGame };
