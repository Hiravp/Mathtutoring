export type GameDifficulty = "easy" | "medium" | "hard";

export const GAME_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type GameStats = {
  score: number;
  correct: number;
  incorrect: number;
  streak: number;
  bestStreak: number;
};

export function createGameStats(): GameStats {
  return {
    score: 0,
    correct: 0,
    incorrect: 0,
    streak: 0,
    bestStreak: 0,
  };
}

export function totalAttempts(stats: GameStats): number {
  return stats.correct + stats.incorrect;
}

export function accuracyPercent(stats: GameStats): number {
  const total = totalAttempts(stats);
  if (total === 0) return 0;
  return Math.round((stats.correct / total) * 100);
}

export function formatAccuracy(stats: GameStats): string {
  return `${accuracyPercent(stats)}%`;
}

export function recordAttempt(
  stats: GameStats,
  isCorrect: boolean,
  pointsPerCorrect = 1,
): GameStats {
  if (isCorrect) {
    const streak = stats.streak + 1;
    return {
      score: stats.score + pointsPerCorrect,
      correct: stats.correct + 1,
      incorrect: stats.incorrect,
      streak,
      bestStreak: Math.max(stats.bestStreak, streak),
    };
  }

  return {
    ...stats,
    incorrect: stats.incorrect + 1,
    streak: 0,
  };
}
