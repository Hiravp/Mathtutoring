import type { Question } from './types';
import { getSupabase } from './supabase';

export type PublicQuestion = Omit<Question, 'correctAnswer' | 'explanationSteps' | 'hints' | 'generatorSeed' | 'generatorVersion'> & { hasHints: true };
export type ProgressRow = { skillId: string; attempts: number; correct: number; rating: number; intervalDays: number; dueAt: string };
export type MeResult = { profile: { xp: number; coins: number; streak: number; courseId: string }; totals: { attempts: number; corrects: number }; progress: ProgressRow[]; owned: string[] };
export type AnswerResult = { correct: boolean; alreadyGraded: boolean; xpAwarded: number; coinsAwarded: number; explanationSteps?: string[]; streak: number };

async function call<T>(action: string, body: Record<string, unknown> = {}): Promise<T> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Cloud sign-in is not configured on this build. Demo progress stays in memory.');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Please sign in again to continue.');
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/mathquest-api`, { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...body }) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? 'The cloud service could not complete that action.');
  return payload as T;
}

export const api = {
  me: () => call<MeResult>('me'),
  issue: (skillId: string) => call<{ question: PublicQuestion }>('issue', { skillId }),
  hint: (questionId: string, tier: number) => call<{ hint: string; tier: number }>('hint', { questionId, tier }),
  answer: (questionId: string, answer: string | string[], seconds: number) => call<AnswerResult>('answer', { questionId, answer, seconds }),
  saveCourse: (courseId: string) => call<{ courseId: string }>('course', { courseId }),
  exportData: () => call<{ profile: unknown; progress: unknown[]; attempts: unknown[]; cosmetics: unknown[]; exportLimit?: number }>('export'),
  deleteAccount: (confirmation: string) => call<{ deleted: boolean }>('delete-account', { confirmation }),
  purchase: (cosmeticId: string) => call<{ coins: number; owned: string[] }>('purchase', { cosmeticId }),
};
