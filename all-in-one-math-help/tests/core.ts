import { courses, skills } from '../lib/curriculum';
import { checkAnswer, generateQuestion } from '../lib/generators';
function assert(ok: unknown, message: string): asserts ok { if (!ok) throw new Error(message); }
const ids = new Set(skills.map(s => s.id));
assert(skills.length === 42, `expected 42 skills, got ${skills.length}`); assert(courses.length === 16, 'expected 16 courses');
const visiting = new Set<string>(), visited = new Set<string>();
function visit(id: string): void { assert(ids.has(id), `unknown skill ${id}`); if (visiting.has(id)) throw new Error(`cycle at ${id}`); if (visited.has(id)) return; visiting.add(id); for (const pre of skills.find(s => s.id === id)!.prerequisiteSkillIds) visit(pre); visiting.delete(id); visited.add(id); }
for (const skill of skills) visit(skill.id);
for (const [i, skill] of skills.entries()) { const q = generateQuestion(skill.id, (i % 10) + 1, i + 900); const again = generateQuestion(skill.id, (i % 10) + 1, i + 900); assert(JSON.stringify(q) === JSON.stringify(again), `${skill.id} not deterministic`); const answer = Array.isArray(q.correctAnswer) ? q.correctAnswer : String(q.correctAnswer); assert(checkAnswer(q, answer), `${skill.id} rejects answer`); if (q.type === 'numeric') assert(!checkAnswer(q, String(Number(q.correctAnswer) + 0.013579)), `${skill.id} accepts wrong numeric`); if (q.type === 'multiple-choice') assert(q.choices?.filter(x => x === q.correctAnswer).length === 1, `${skill.id} duplicate answer`); }
const probability = generateQuestion('probability', 3, 17); assert(checkAnswer({ ...probability, correctAnswer: 1 / 3 }, '1/3'), 'fraction parser failed');
const multi = generateQuestion('quadratics', 3, 17); if (multi.type === 'multi-select') { assert(!checkAnswer(multi, [...(multi.correctAnswer as string[]), 'not-an-answer']), 'multi-select cardinality bypass'); }
console.log(`core tests passed (${skills.length} skills, ${courses.length} courses)`);
