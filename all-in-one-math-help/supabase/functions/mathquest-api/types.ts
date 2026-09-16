export type Track = 'Georgia Core' | 'AP' | 'IB' | 'Georgia Tech';
export type Strand = 'foundations' | 'algebra' | 'geometry' | 'functions' | 'calculus' | 'statistics' | 'linear-algebra' | 'discrete-math';
export interface Skill { id: string; title: string; strand: Strand; gradeBand: string; prerequisiteSkillIds: string[]; standardsCodes: string[]; difficultyRange: [number, number]; generatorId: string; description: string; }
export interface Course { id: string; title: string; shortTitle: string; track: Track; realm: string; description: string; skillIds: string[]; }
export interface Question { id: string; skillId: string; type: 'multiple-choice' | 'numeric' | 'multi-select'; difficulty: number; prompt: string; choices?: string[]; correctAnswer: string | number | string[]; explanationSteps: string[]; hints: string[]; generatorSeed: number; generatorVersion: number; }
export interface SkillProgress { rating: number; attempts: number; correct: number; streak: number; interval: number; ease: number; due: string; }
export interface Attempt { id: string; skillId: string; correct: boolean; answer: string | string[]; seed: number; difficulty: number; generatorVersion: number; hintCount: number; seconds: number; at: string; }
export interface Player { xp: number; coins: number; victories: number; streak: number; lastPractice: string; equipped: string; owned: string[]; courseId: string; skillId: string; }
export interface Settings { largeText: boolean; readableFont: boolean; reducedMotion: boolean; }
export interface SaveData { version: 1; player: Player; progress: Record<string, SkillProgress>; attempts: Attempt[]; settings: Settings; }
export type Screen = 'world' | 'practice' | 'courses' | 'journal' | 'companions' | 'settings';
