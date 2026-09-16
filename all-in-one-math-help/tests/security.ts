import { checkAnswer } from '../lib/generators';
import type { Question } from '../lib/types';
function assert(ok: unknown, message: string): asserts ok { if (!ok) throw new Error(message); }
const q: Question = { id: 'q', skillId: 'x', type: 'numeric', difficulty: 1, prompt: 'x', correctAnswer: 4, explanationSteps: [], hints: [], generatorSeed: 1, generatorVersion: 1 };
for (const exploit of ['4; alert(1)', '4 OR 1=1', 'Infinity', 'NaN', '4/0', '{"answer":4}']) assert(!checkAnswer(q, exploit), `unsafe answer accepted: ${exploit}`);
assert(checkAnswer(q, '4.0000001'), 'numeric tolerance too strict');
const mc: Question = { ...q, type: 'multiple-choice', correctAnswer: 'yes' };
assert(!checkAnswer(mc, ['yes']), 'array bypassed multiple choice');
console.log('security tests passed (no eval, strict answer shapes)');
