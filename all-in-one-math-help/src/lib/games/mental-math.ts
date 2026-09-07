import type { GameDifficulty } from "@/lib/games/types";

export type MentalMathQuestion = {
  prompt: string;
  answer: number;
};

type Operation = "+" | "-" | "*" | "/";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(items: readonly T[]): T {
  const item = items[randomInt(0, items.length - 1)];
  if (item === undefined) {
    throw new Error("Cannot pick from an empty list.");
  }
  return item;
}

function formatPrompt(left: number, operation: Operation, right: number): string {
  const symbol =
    operation === "*" ? "×" : operation === "/" ? "÷" : operation === "-" ? "−" : "+";
  return `${left} ${symbol} ${right}`;
}

function easyQuestion(): MentalMathQuestion {
  const operation = pick<Operation>(["+", "-", "*", "/"]);

  if (operation === "+") {
    const left = randomInt(1, 20);
    const right = randomInt(1, 20);
    return { prompt: formatPrompt(left, "+", right), answer: left + right };
  }

  if (operation === "-") {
    const left = randomInt(2, 20);
    const right = randomInt(1, left);
    return { prompt: formatPrompt(left, "-", right), answer: left - right };
  }

  if (operation === "*") {
    const left = randomInt(1, 10);
    const right = randomInt(1, 10);
    return { prompt: formatPrompt(left, "*", right), answer: left * right };
  }

  const divisor = randomInt(2, 10);
  const quotient = randomInt(1, 10);
  return {
    prompt: formatPrompt(divisor * quotient, "/", divisor),
    answer: quotient,
  };
}

function mediumQuestion(): MentalMathQuestion {
  const operation = pick<Operation>(["+", "-", "*", "/"]);

  if (operation === "+") {
    const left = randomInt(12, 80);
    const right = randomInt(10, 60);
    return { prompt: formatPrompt(left, "+", right), answer: left + right };
  }

  if (operation === "-") {
    const left = randomInt(20, 99);
    const right = randomInt(8, Math.min(70, left));
    return { prompt: formatPrompt(left, "-", right), answer: left - right };
  }

  if (operation === "*") {
    const left = randomInt(3, 12);
    const right = randomInt(3, 12);
    return { prompt: formatPrompt(left, "*", right), answer: left * right };
  }

  const divisor = randomInt(3, 12);
  const quotient = randomInt(3, 12);
  return {
    prompt: formatPrompt(divisor * quotient, "/", divisor),
    answer: quotient,
  };
}

function hardQuestion(): MentalMathQuestion {
  const operation = pick<Operation>(["+", "-", "*", "/"]);

  if (operation === "+") {
    const left = randomInt(40, 180);
    const right = randomInt(25, 160);
    return { prompt: formatPrompt(left, "+", right), answer: left + right };
  }

  if (operation === "-") {
    const left = randomInt(-20, 90);
    const right = randomInt(10, 80);
    return { prompt: formatPrompt(left, "-", right), answer: left - right };
  }

  if (operation === "*") {
    const left = randomInt(11, 19);
    const right = randomInt(3, 12);
    return { prompt: formatPrompt(left, "*", right), answer: left * right };
  }

  const divisor = randomInt(4, 15);
  const quotient = randomInt(6, 18);
  return {
    prompt: formatPrompt(divisor * quotient, "/", divisor),
    answer: quotient,
  };
}

export function generateMentalMathQuestion(
  difficulty: GameDifficulty,
): MentalMathQuestion {
  if (difficulty === "easy") return easyQuestion();
  if (difficulty === "medium") return mediumQuestion();
  return hardQuestion();
}

export function parseNumericAnswer(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
}

export function answersMatch(given: string, expected: number): boolean {
  const parsed = parseNumericAnswer(given);
  return parsed !== null && Math.abs(parsed - expected) < 1e-9;
}
