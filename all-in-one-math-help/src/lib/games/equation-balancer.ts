import type { GameDifficulty } from "@/lib/games/types";

export type EquationOpType =
  | "add"
  | "subtract"
  | "multiply"
  | "divide"
  | "simplify";

export type BalanceOperation = {
  type: EquationOpType;
  value?: number;
  label: string;
};

export type LinearEquation = {
  leftCoeff: number;
  leftConst: number;
  right: number;
};

export type EquationStep = {
  operation: BalanceOperation;
  display: string;
};

export type EquationPuzzle = {
  display: string;
  leftCoeff: number;
  leftConst: number;
  right: number;
  solution: number;
  choices: BalanceOperation[];
  steps: EquationStep[];
};

const EPSILON = 1e-9;

function almostEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < EPSILON;
}

function normalize(n: number): number {
  if (almostEqual(n, 0)) return 0;
  if (almostEqual(n, Math.round(n))) return Math.round(n);
  return n;
}

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

export function integerGcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x || 1;
}

export function equationGcd(equation: LinearEquation): number {
  return integerGcd(
    integerGcd(equation.leftCoeff, equation.leftConst),
    equation.right,
  );
}

export function formatNumber(value: number): string {
  const n = normalize(value);
  if (n < 0) return `−${formatNumber(-n)}`;
  if (almostEqual(n, Math.round(n))) return String(Math.round(n));
  return String(Math.round(n * 1000) / 1000);
}

export function formatEquation(
  leftCoeff: number,
  leftConst: number,
  right: number,
): string {
  const coeffPart = almostEqual(leftCoeff, 0)
    ? ""
    : almostEqual(leftCoeff, 1)
      ? "x"
      : almostEqual(leftCoeff, -1)
        ? "−x"
        : `${formatNumber(leftCoeff)}x`;

  let left: string;
  if (coeffPart === "") {
    left = formatNumber(leftConst);
  } else if (almostEqual(leftConst, 0)) {
    left = coeffPart;
  } else if (leftConst > 0) {
    left = `${coeffPart} + ${formatNumber(leftConst)}`;
  } else {
    left = `${coeffPart} − ${formatNumber(-leftConst)}`;
  }

  return `${left} = ${formatNumber(right)}`;
}

export function describeOperation(operation: BalanceOperation): string {
  if (operation.label) return operation.label;
  if (operation.type === "simplify") return "Simplify both sides";
  const n = formatNumber(operation.value ?? 0);
  if (operation.type === "add") return `Add ${n} to both sides`;
  if (operation.type === "subtract") return `Subtract ${n} from both sides`;
  if (operation.type === "multiply") return `Multiply both sides by ${n}`;
  return `Divide both sides by ${n}`;
}

function withLabel(operation: Omit<BalanceOperation, "label"> & { label?: string }): BalanceOperation {
  const labeled: BalanceOperation = {
    type: operation.type,
    value: operation.value,
    label: operation.label ?? "",
  };
  labeled.label = describeOperation(labeled);
  return labeled;
}

export function operationsEqual(a: BalanceOperation, b: BalanceOperation): boolean {
  if (a.type !== b.type) return false;
  if (a.type === "simplify") return true;
  if (a.value === undefined || b.value === undefined) return false;
  return almostEqual(a.value, b.value);
}

export function validateOperation(operation: BalanceOperation): string | null {
  if (operation.type === "simplify") return null;
  const value = operation.value;
  if (value === undefined || !Number.isFinite(value)) {
    return "Enter a number for this operation.";
  }
  if (operation.type === "divide" && almostEqual(value, 0)) {
    return "Cannot divide both sides by zero.";
  }
  if (operation.type === "multiply" && almostEqual(value, 0)) {
    return "Multiplying by zero removes the unknown.";
  }
  return null;
}

export function applyOperation(
  equation: LinearEquation,
  operation: BalanceOperation,
): LinearEquation {
  const error = validateOperation(operation);
  if (error) {
    throw new Error(error);
  }

  if (operation.type === "add") {
    const value = operation.value ?? 0;
    return {
      leftCoeff: equation.leftCoeff,
      leftConst: normalize(equation.leftConst + value),
      right: normalize(equation.right + value),
    };
  }

  if (operation.type === "subtract") {
    const value = operation.value ?? 0;
    return {
      leftCoeff: equation.leftCoeff,
      leftConst: normalize(equation.leftConst - value),
      right: normalize(equation.right - value),
    };
  }

  if (operation.type === "multiply") {
    const value = operation.value ?? 1;
    return {
      leftCoeff: normalize(equation.leftCoeff * value),
      leftConst: normalize(equation.leftConst * value),
      right: normalize(equation.right * value),
    };
  }

  if (operation.type === "divide") {
    const value = operation.value ?? 1;
    return {
      leftCoeff: normalize(equation.leftCoeff / value),
      leftConst: normalize(equation.leftConst / value),
      right: normalize(equation.right / value),
    };
  }

  const divisor = equationGcd(equation);
  if (divisor <= 1) return { ...equation };
  return {
    leftCoeff: normalize(equation.leftCoeff / divisor),
    leftConst: normalize(equation.leftConst / divisor),
    right: normalize(equation.right / divisor),
  };
}

export function isSolved(puzzle: LinearEquation): boolean {
  return (
    almostEqual(puzzle.leftCoeff, 1) &&
    almostEqual(puzzle.leftConst, 0)
  );
}

export function equationComplexity(equation: LinearEquation): number {
  if (isSolved(equation)) return 0;
  const gcd = equationGcd(equation);
  let score = Math.abs(equation.leftConst);
  score += Math.abs(equation.leftCoeff - 1) * 8;
  if (equation.leftCoeff < 0) score += 6;
  if (gcd > 1) score += 4;
  return score;
}

export function getCanonicalNextOperation(
  equation: LinearEquation,
): BalanceOperation | null {
  if (isSolved(equation)) return null;

  const gcd = equationGcd(equation);
  if (gcd > 1) {
    return withLabel({ type: "simplify" });
  }

  if (!almostEqual(equation.leftConst, 0)) {
    if (equation.leftConst > 0) {
      return withLabel({
        type: "subtract",
        value: normalize(equation.leftConst),
      });
    }
    return withLabel({
      type: "add",
      value: normalize(-equation.leftConst),
    });
  }

  if (equation.leftCoeff < 0 && !almostEqual(equation.leftCoeff, 0)) {
    return withLabel({ type: "multiply", value: -1 });
  }

  if (!almostEqual(equation.leftCoeff, 1) && !almostEqual(equation.leftCoeff, 0)) {
    return withLabel({
      type: "divide",
      value: normalize(equation.leftCoeff),
    });
  }

  return null;
}

export function isCorrectNextOperation(
  equation: LinearEquation,
  operation: BalanceOperation,
): boolean {
  if (validateOperation(operation)) return false;
  const next = applyOperation(equation, operation);
  if (isSolved(next)) return true;
  return equationComplexity(next) < equationComplexity(equation) - EPSILON;
}

export function canonicalSolutionSteps(equation: LinearEquation): EquationStep[] {
  const steps: EquationStep[] = [];
  let current: LinearEquation = { ...equation };
  for (let i = 0; i < 12; i += 1) {
    const operation = getCanonicalNextOperation(current);
    if (!operation) break;
    current = applyOperation(current, operation);
    steps.push({
      operation,
      display: formatEquation(current.leftCoeff, current.leftConst, current.right),
    });
    if (isSolved(current)) break;
  }
  return steps;
}

function uniqueOperations(operations: BalanceOperation[]): BalanceOperation[] {
  const result: BalanceOperation[] = [];
  for (const operation of operations) {
    if (result.some((item) => operationsEqual(item, operation))) continue;
    result.push(operation);
  }
  return result;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    const current = copy[i];
    const swap = copy[j];
    if (current === undefined || swap === undefined) continue;
    copy[i] = swap;
    copy[j] = current;
  }
  return copy;
}

export function getSuggestedOperations(equation: LinearEquation): BalanceOperation[] {
  if (isSolved(equation)) return [];

  const canonical = getCanonicalNextOperation(equation);
  const candidates: BalanceOperation[] = [];
  if (canonical) candidates.push(canonical);
  if (equationGcd(equation) > 1) {
    candidates.push(withLabel({ type: "simplify" }));
  }

  const distractors: BalanceOperation[] = [
    withLabel({ type: "add", value: 1 }),
    withLabel({ type: "subtract", value: 2 }),
    withLabel({ type: "add", value: 3 }),
    withLabel({ type: "multiply", value: 2 }),
    withLabel({ type: "subtract", value: 1 }),
  ];

  if (!almostEqual(equation.leftCoeff, 0) && Math.abs(equation.leftCoeff) !== 2) {
    distractors.push(withLabel({ type: "divide", value: 2 }));
  }

  for (const distractor of distractors) {
    if (validateOperation(distractor)) continue;
    if (canonical && operationsEqual(distractor, canonical)) continue;
    if (!isCorrectNextOperation(equation, distractor)) {
      candidates.push(distractor);
    }
  }

  const unique = uniqueOperations(candidates);
  const preferred = unique.filter((op) =>
    canonical ? operationsEqual(op, canonical) : false,
  );
  const rest = shuffle(
    unique.filter((op) => !preferred.some((item) => operationsEqual(item, op))),
  );
  return [...preferred, ...rest].slice(0, 5);
}

function toPuzzle(equation: LinearEquation, solution: number): EquationPuzzle {
  return {
    display: formatEquation(equation.leftCoeff, equation.leftConst, equation.right),
    leftCoeff: equation.leftCoeff,
    leftConst: equation.leftConst,
    right: equation.right,
    solution,
    choices: getSuggestedOperations(equation),
    steps: canonicalSolutionSteps(equation),
  };
}

export function applyBalanceOperation(
  puzzle: EquationPuzzle,
  operation: BalanceOperation,
): { puzzle: EquationPuzzle; correct: boolean; error?: undefined } | {
  puzzle: EquationPuzzle;
  correct: false;
  error: string;
} {
  const error = validateOperation(operation);
  if (error) {
    return { puzzle, correct: false, error };
  }

  const current: LinearEquation = {
    leftCoeff: puzzle.leftCoeff,
    leftConst: puzzle.leftConst,
    right: puzzle.right,
  };
  const correct = isCorrectNextOperation(current, operation);
  const next = applyOperation(current, operation);
  return {
    puzzle: toPuzzle(next, puzzle.solution),
    correct,
  };
}

export function generateEquationPuzzle(
  difficulty: GameDifficulty = "easy",
): EquationPuzzle {
  if (difficulty === "easy") {
    const solution = randomInt(1, 10);
    const leftCoeff = randomInt(2, 5);
    const leftConst = randomInt(1, 12);
    return toPuzzle(
      {
        leftCoeff,
        leftConst,
        right: leftCoeff * solution + leftConst,
      },
      solution,
    );
  }

  if (difficulty === "medium") {
    const solution = randomInt(-6, 12) || 2;
    const leftCoeff = pick([2, 3, 4, 5, 6, 8]);
    const leftConst = pick([randomInt(2, 16), -randomInt(2, 12)]);
    return toPuzzle(
      {
        leftCoeff,
        leftConst,
        right: leftCoeff * solution + leftConst,
      },
      solution,
    );
  }

  const solution = randomInt(-10, 14) || 3;
  const useNegative = Math.random() < 0.35;
  const base = pick([2, 3, 4, 5, 6]);
  const multiple = pick([1, 2]);
  const leftCoeff = (useNegative ? -1 : 1) * base * multiple;
  const leftConst = base * randomInt(1, 5) * pick([1, -1]);
  return toPuzzle(
    {
      leftCoeff,
      leftConst,
      right: leftCoeff * solution + leftConst,
    },
    solution,
  );
}
