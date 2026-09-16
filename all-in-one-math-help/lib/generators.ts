import type { Question } from './types';
import { skills } from './curriculum';

export const GENERATOR_VERSION = 1;

/** A tiny deterministic PRNG: no question is a fixed bank item. */
class PRNG {
  private state: number;
  constructor(seed: number) { this.state = (seed | 0) || 0x6d2b79f5; }
  next(): number { let t = this.state += 0x6d2b79f5; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  int(min: number, max: number): number { return Math.floor(this.next() * (max - min + 1)) + min; }
  pick<T>(a: T[]): T { return a[this.int(0, a.length - 1)]; }
  shuffle<T>(a: T[]): T[] { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = this.int(0, i); [b[i], b[j]] = [b[j], b[i]]; } return b; }
}
const hash = (x: string) => { let h = 2166136261; for (let i = 0; i < x.length; i++) h = Math.imul(h ^ x.charCodeAt(i), 16777619); return h | 0; };
const nice = (n: number) => Number.isInteger(n) ? String(n) : String(Number(n.toFixed(8)));
const dlevel = (d: number) => Math.max(1, Math.min(10, Math.round(Number.isFinite(d) ? d : 1)));
const baseHints = (topic: string) => [`Identify the ${topic} relationship before calculating.`, 'Write one small algebraic step at a time and check units or signs.', 'Substitute your result back into the original information to verify it.'];
const make = (skillId: string, difficulty: number, seed: number, type: Question['type'], prompt: string, correct: string | number | string[], explanationSteps: string[], hints: string[], choices?: string[]): Question => ({
  id: `${skillId}-v${GENERATOR_VERSION}-d${dlevel(difficulty)}-s${seed}`,
  skillId, type, difficulty: dlevel(difficulty), prompt, choices, correctAnswer: correct, explanationSteps, hints: hints.length === 3 ? hints : baseHints(skillId), generatorSeed: seed, generatorVersion: GENERATOR_VERSION,
});
const mc = (skill: string, d: number, seed: number, prompt: string, right: string, wrong: string[], steps: string[], topic: string, r: PRNG) => {
  const choices = r.shuffle([right, ...wrong.filter((x, i, a) => x !== right && a.indexOf(x) === i)]);
  return make(skill, d, seed, 'multiple-choice', prompt, right, steps, baseHints(topic), choices);
};
const num = (skill: string, d: number, seed: number, prompt: string, right: number, steps: string[], topic: string) => make(skill, d, seed, 'numeric', `${prompt} Give a decimal or fraction as appropriate.`, right, steps, baseHints(topic));
const multi = (skill: string, d: number, seed: number, prompt: string, right: string[], options: string[], steps: string[], topic: string, r: PRNG) => {
  const unique = options.filter((x, i, a) => a.indexOf(x) === i);
  return make(skill, d, seed, 'multi-select', `${prompt} Select all that apply.`, right, steps, baseHints(topic), r.shuffle(unique));
};
const abs = (x: number) => Math.abs(x);
const fact = (n: number): number => n <= 1 ? 1 : n * fact(n - 1);
const choose = (n: number, k: number) => fact(n) / (fact(k) * fact(n - k));

export function generateQuestion(skillId: string, difficulty: number, seed: number): Question {
  if (!skills.some(s => s.id === skillId)) throw new Error(`Unknown skill: ${skillId}`);
  const d = dlevel(difficulty), r = new PRNG((seed | 0) ^ hash(skillId) ^ Math.imul(d, 0x9e3779b9));
  const a = r.int(2, Math.min(9, 4 + d)), b = r.int(2, Math.min(9, 5 + d)), c = r.int(1, Math.min(9, 3 + Math.floor(d / 2)));
  switch (skillId) {
    case 'place-value': { const n = a * 1000 + b * 100 + c * 10 + r.int(1, 9); const digit = a, place = 1000; return num(skillId,d,seed,`In ${n}, what is the value of the leading digit ${digit}?`,digit * place,[`The leading digit ${digit} is in the thousands place.`,`Multiply ${digit} by ${place}.`,`Thus the place value is ${digit * place}.`],'place value'); }
    case 'fractions-ratios': { const x = r.int(2, 8), y = r.int(2, 7), scale = r.int(2, 5); return num(skillId,d,seed,`A recipe uses ${x}/${y} cup per batch. How many cups are needed for ${scale} batches?`,x * scale / y,[`Multiply the unit amount by the number of batches: (${x}/${y})(${scale}).`,`The numerator becomes ${x * scale}.`,`The result is ${nice(x * scale / y)} cups.`],'proportion'); }
    case 'integer-exponents': { const baseN = r.int(2, 5), power = r.int(2, Math.min(5, 2 + Math.floor(d / 2))), right = nice(baseN ** power); return mc(skillId,d,seed,`Evaluate ${baseN}^${power}.`,right,[nice(baseN ** (power - 1)),nice(baseN * power),nice((baseN + 1) ** power)], [`An exponent counts repeated multiplication.`,`Multiply ${baseN} by itself ${power} times.`,`The value is ${right}.`],'exponents',r); }
    case 'scientific-notation': { const coeff = r.int(2, 9), p = r.int(2, 5), multiplier = 10 ** p; return num(skillId,d,seed,`Compute (${coeff} × 10^${p}) ÷ 10^${p - 1}.`,coeff * 10,[`Subtract exponents when dividing like powers: 10^${p} / 10^${p - 1} = 10.`,`Keep the coefficient ${coeff}.`,`The product is ${coeff * 10}.`],'scientific notation'); }
    case 'linear-equations': { const x = r.int(-5, 9), m = r.int(2, 6), k = r.int(1, 8); return num(skillId,d,seed,`Solve ${m}x + ${k} = ${m * x + k}.`,x,[`Subtract ${k} from both sides.`,`Divide by ${m}.`,`x = ${x}.`],'linear equation'); }
    case 'systems-linear': { const x = r.int(1, 7), y = r.int(-3, 6), p = r.int(2, 5), q = r.int(1, 3); return num(skillId,d,seed,`For the system ${p}x + ${q}y = ${p*x+q*y} and x − y = ${x-y}, find x.`,x,[`The second equation gives x = y + ${x-y}.`,`Substitute into the first equation and simplify.`,`The solution has x = ${x}.`],'linear system'); }
    case 'inequalities': { const x = r.int(2, 8), m = r.int(2, 6), k = r.int(1, 7), threshold = m*x+k; return mc(skillId,d,seed,`Which statement solves ${m}x + ${k} > ${threshold}?`,`x > ${x}`,[`x < ${x}`,`x ≥ ${x}`,`x ≤ ${x}`],[`Isolate the variable by subtracting ${k}.`,`Divide by the positive coefficient ${m}; the inequality direction stays.`,`The boundary is ${x}, with values greater than it.`],'inequality',r); }
    case 'polynomials': { const x = r.int(-4, 5), m = r.int(2, 6), q = r.int(1, 6); const value = m*x*x + q*x + 1; return num(skillId,d,seed,`Evaluate ${m}x² + ${q}x + 1 at x = ${x}.`,value,[`Substitute x = ${x}.`,`Compute x² = ${x*x}, then ${m}(${x*x}) + ${q}(${x}) + 1.`,`The value is ${value}.`],'polynomial evaluation'); }
    case 'quadratics': { const x1 = r.int(-6, 2), x2 = r.int(x1 + 1, 7), right = [`x = ${x1}`, `x = ${x2}`]; return multi(skillId,d,seed,`Select the solutions of (x − ${x1})(x − ${x2}) = 0.`,right,[...right,`x = ${x1 + x2}`,`x = ${x1 * x2}`],[`A product is zero when at least one factor is zero.`,`Set x − ${x1} = 0 and x − ${x2} = 0 separately.`,`The two roots are ${x1} and ${x2}.`],'quadratic roots',r); }
    case 'rational-expressions': { const x = r.int(2, 8), k = r.int(2, 5); return mc(skillId,d,seed,`For x ≠ 0, simplify ( ${k}x² ) / ( ${k}x ).`, 'x',[`${k}x`,`x²`,`${k}`],[`Cancel the common factor ${k}x, but retain x ≠ 0.`,`One x remains in the numerator.`,`The simplified expression is x.`],'rational simplification',r); }
    case 'function-notation': { const x = r.int(-4, 5), m = r.int(2, 6), q = r.int(-4, 5), value = m*x+q; return num(skillId,d,seed,`If f(t) = ${m}t + (${q}), find f(${x}).`,value,[`Replace t with ${x}.`,`Multiply ${m}(${x}) and add ${q}.`,`f(${x}) = ${value}.`],'function evaluation'); }
    case 'linear-functions': { const slope = r.int(-5, 5) || 2, intercept = r.int(-6, 6), x1 = r.int(1, 5), x2 = x1 + r.int(2, 5), y1 = slope*x1+intercept, y2 = slope*x2+intercept; return num(skillId,d,seed,`A line passes through (${x1}, ${y1}) and (${x2}, ${y2}). What is its slope?`,slope,[`Use (y₂ − y₁)/(x₂ − x₁).`,`The numerator is ${y2-y1} and denominator is ${x2-x1}.`,`The slope is ${slope}.`],'slope'); }
    case 'exponentials-logarithms': { const baseN = r.pick([2,3,5]), power = r.int(2,4), value = baseN ** power; return mc(skillId,d,seed,`Solve ${baseN}^x = ${value}.`,String(power),[` ${power+1}`,String(power-1),String(value)],[`Ask which exponent on ${baseN} produces ${value}.`,`Compute ${baseN}^${power} = ${value}.`,`Therefore x = ${power}.`],'exponential equation',r); }
    case 'transformations': { const shift = r.int(2, 6), right = [`f(x) + ${shift} shifts the graph up ${shift}`,`f(x − ${shift}) shifts the graph right ${shift}`]; return multi(skillId,d,seed,`For a base function f, select the true transformation statements.`,right,[...right,`f(x) + ${shift} shifts the graph down ${shift}`,`f(x + ${shift}) shifts the graph right ${shift}`],[`Outside changes affect vertical position; inside changes act oppositely horizontally.`,`Compare each expression with the base f(x).`,`Only the first two statements match these rules.`],'transformations',r); }
    case 'sequences': { const first = r.int(1, 8), ratio = r.int(2, 4), n = r.int(3, 5), value = first * ratio ** (n-1); return num(skillId,d,seed,`A geometric sequence starts at ${first} with common ratio ${ratio}. Find term ${n}.`,value,[`Use a_n = a₁r^(n−1).`,`Substitute: ${first}(${ratio})^${n-1}.`,`The term is ${value}.`],'geometric sequence'); }
    case 'infinite-series': {
      const coefficient = r.int(1, 5 + Math.floor(d / 2)), denominator = r.int(3, 9), numerator = r.int(1, denominator - 1);
      const right = coefficient * denominator / (denominator - numerator);
      const exact = `${coefficient * denominator}/${denominator - numerator}`;
      return num(skillId, d, seed, `Find the exact sum Σ_(n=0)^∞ ${coefficient}(${numerator}/${denominator})^n.`, right, [`This is geometric with first term ${coefficient} and ratio ${numerator}/${denominator}; since the ratio is less than 1, it converges.`,`Use S = a/(1 − r) = ${coefficient}/(1 − ${numerator}/${denominator}).`,`The sum is ${exact} = ${nice(right)}.`], 'infinite geometric series');
    }
    case 'angles-triangles': { const x = r.int(20, 80), y = r.int(20, 80), missing = 180-x-y > 10 ? 180-x-y : 40; return num(skillId,d,seed,`A triangle has angles ${x}° and ${y}°. Find the third angle.`,missing,[`Triangle angles total 180°.`,`Subtract the known angles: 180 − ${x} − ${y}.`,`The missing angle is ${missing}°.`],'triangle angle sum'); }
    case 'coordinate-geometry': { const dx = r.int(2, 8), dy = r.int(2, 8); return num(skillId,d,seed,`Find the squared distance between (0, 0) and (${dx}, ${dy}).`,dx*dx+dy*dy,[`Use d² = (Δx)² + (Δy)².`,`Substitute: ${dx}² + ${dy}².`,`The squared distance is ${dx*dx+dy*dy}.`],'distance formula'); }
    case 'similarity': { const scale = r.int(2, 5), small = r.int(2, 8); return num(skillId,d,seed,`Similar figures have scale factor ${scale} from small to large. If a small side is ${small}, find the corresponding large side.`,scale*small,[`Corresponding lengths multiply by the scale factor.`,`Compute ${scale} × ${small}.`,`The large side is ${scale*small}.`],'similarity ratio'); }
    case 'circles': { const radius = r.int(2, 9); return num(skillId,d,seed,`A circle has radius ${radius}. What is its area divided by π?`,radius*radius,[`The area formula is A = πr².`,`Divide by π to leave r².`,`Thus A/π = ${radius*radius}.`],'circle area'); }
    case 'area-volume': { const length = r.int(2, 8), width = r.int(2, 7), height = r.int(2, 5); return num(skillId,d,seed,`Find the volume of a rectangular prism ${length} by ${width} by ${height}.`,length*width*height,[`Use V = length × width × height.`,`Multiply ${length} × ${width} × ${height}.`,`The volume is ${length*width*height} cubic units.`],'volume'); }
    case 'trig-right-triangles': { const triples = [[3,4,'3/5'],[5,12,'5/13'],[8,15,'8/17']] as [number,number,string][]; const [opp,hyp,right] = r.pick(triples); return mc(skillId,d,seed,`In a right triangle, the opposite side is ${opp} and hypotenuse is ${hyp}. What is sin(θ)?`,right,[`4/5`,`12/13`,`1/2`],[`Sine is opposite divided by hypotenuse.`,`Form the ratio ${opp}/${hyp}.`,`So sin(θ) = ${right}.`],'sine ratio',r); }
    case 'unit-circle': { const entries = [['0°','1'],['60°','1/2'],['90°','0'],['180°','−1']]; const [angle,right] = r.pick(entries); return mc(skillId,d,seed,`What is cos(${angle})?`,right,['0','1','−1/2','1/2'].filter(x => x !== right),[`Read the x-coordinate of the unit-circle point at ${angle}.`,`Cosine is the x-coordinate.`,`The value is ${right}.`],'unit circle',r); }
    case 'trig-identities': { const z = r.int(2, 7); return num(skillId,d,seed,`If sin(θ) = ${z}/${z+1} and cos²(θ) = 1 − sin²(θ), find (${z+1})² cos²(θ).`,(z+1)**2-z**2,[`Use sin²θ + cos²θ = 1.`,`Multiply the identity by (${z+1})².`,`The result is (${z+1})² − ${z}² = ${(z+1)**2-z**2}.`],'identity'); }
    case 'limits-continuity': { const x = r.int(-4, 5), m = r.int(2, 6), q = r.int(-5, 5), value = m*x+q; return num(skillId,d,seed,`Evaluate lim(t→${x}) [${m}t + (${q})].`,value,[`A polynomial is continuous, so substitute t = ${x}.`,`Compute ${m}(${x}) + (${q}).`,`The limit is ${value}.`],'limit'); }
    case 'derivatives': { const power = r.int(2, 5), coef = r.int(2, 6), right = `${coef*power}x^${power-1}`; return mc(skillId,d,seed,`What is d/dx (${coef}x^${power})?`,right,[`${coef}x^${power-1}`,`${coef*power}x^${power}`,`${power}x^${power}`],[`Apply d(x^n)/dx = nx^(n−1).`,`Multiply the coefficient by the exponent ${power}.`,`The derivative is ${right}.`],'power rule',r); }
    case 'partial-derivatives': {
      const ax = r.int(1, 4 + Math.floor(d / 3)), b = r.int(1, 5 + Math.floor(d / 3)), cy = r.int(1, 4 + Math.floor(d / 3));
      const dx = r.int(1, 6), ey = r.int(1, 6), x0 = r.int(-3, 4), y0 = r.int(-3, 4);
      const wrt = r.next() < 0.5 ? 'x' : 'y';
      const right = wrt === 'x' ? 2 * ax * x0 + b * y0 + dx : b * x0 + 2 * cy * y0 + ey;
      const derivative = wrt === 'x' ? `${2 * ax}x + ${b}y + ${dx}` : `${b}x + ${2 * cy}y + ${ey}`;
      return num(skillId, d, seed, `For f(x,y) = ${ax}x² + ${b}xy + ${cy}y² + ${dx}x + ${ey}y, find ∂f/∂${wrt} at (${x0}, ${y0}).`, right, [`Differentiate with respect to ${wrt}, treating the other variable as constant.`,`The partial derivative is ${derivative}.`,`Substitute (${x0}, ${y0}) to obtain ${right}.`], 'partial derivative');
    }
    case 'applications-derivatives': { const slope = r.int(2, 9), x0 = r.int(1, 6); return num(skillId,d,seed,`A curve has derivative f′(x) = ${slope}x. Find its tangent slope at x = ${x0}.`,slope*x0,[`The tangent slope is the derivative value.`,`Substitute x = ${x0} into ${slope}x.`,`The slope is ${slope*x0}.`],'tangent slope'); }
    case 'integrals': { const power = r.int(1, 4), coef = r.int(2, 6), upper = r.int(2, 6); const value = coef * upper ** (power+1) / (power+1); return num(skillId,d,seed,`Evaluate ∫₀^${upper} ${coef}x^${power} dx.`,value,[`An antiderivative is ${coef}/${power+1} x^${power+1}.`,`Evaluate at ${upper} and subtract the value at 0.`,`The definite integral is ${nice(value)}.`],'definite integral'); }
    case 'double-integrals': {
      const ax = r.int(1, 5), by = r.int(1, 5), constant = r.int(1, 6);
      const x0 = r.int(0, 2), x1 = x0 + r.int(1, 4), y0 = r.int(0, 2), y1 = y0 + r.int(1, 4);
      const width = x1 - x0, height = y1 - y0;
      const xMoment = (x1 * x1 - x0 * x0) / 2, yMoment = (y1 * y1 - y0 * y0) / 2;
      const value = ax * xMoment * height + by * width * yMoment + constant * width * height;
      return num(skillId, d, seed, `Evaluate ∬_R (${ax}x + ${by}y + ${constant}) dA, where R = [${x0}, ${x1}] × [${y0}, ${y1}].`, value, [`Integrate each term over the rectangle: the x and y moments are ${nice(xMoment)} and ${nice(yMoment)}.`,`The contributions are ${nice(ax * xMoment * height)}, ${nice(by * width * yMoment)}, and ${nice(constant * width * height)}.`,`Adding them gives the double integral ${nice(value)}.`], 'double integral');
    }
    case 'applications-integrals': { const rate = r.int(2, 8), time = r.int(2, 6); return num(skillId,d,seed,`A quantity accumulates at constant rate ${rate} units per hour for ${time} hours. How much accumulates?`,rate*time,[`Accumulation is the integral of the rate.`,`For a constant rate, multiply rate by time.`,`The total is ${rate*time} units.`],'accumulation'); }
    case 'descriptive-stats': { const center = r.int(2, 9), spread = r.int(1, 5), data = [center-spread,center,center+spread]; return num(skillId,d,seed,`Find the mean of the data set ${data.join(', ')}.`,center,[`Add the three values: ${data.reduce((u,v)=>u+v,0)}.`,`Divide by 3.`,`The mean is ${center}.`],'mean'); }
    case 'probability': { const total = r.int(5, 12), favorable = r.int(1, total-1); return num(skillId,d,seed,`A fair selection has ${total} equally likely outcomes, ${favorable} favorable. What is the probability?`,favorable/total,[`Probability = favorable outcomes / total outcomes.`,`Form ${favorable}/${total}.`,`That fraction is ${nice(favorable/total)}.`],'probability'); }
    case 'inference': { const sd = r.int(2, 8), n = r.int(4, 9); return num(skillId,d,seed,`Using the simplified formula SE = s/√n, find SE when s = ${sd} and n = ${n}. Give a decimal rounded to 6 places.`,sd/Math.sqrt(n),[`Substitute into SE = s/√n.`,`Compute ${sd}/√${n}.`,`Rounded to 6 places, the value is ${ (sd/Math.sqrt(n)).toFixed(6)}.`],'standard error'); }
    case 'regression': { const slope = r.int(-4, 5) || 3, x1 = 1, x2 = r.int(3, 7), y1 = r.int(-3, 4), y2 = y1 + slope*(x2-x1); return num(skillId,d,seed,`For the two points (${x1}, ${y1}) and (${x2}, ${y2}), what is the least-squares line's slope?`,slope,[`With two points, the fitted line passes through both points.`,`Slope = (${y2} − ${y1})/(${x2} − ${x1}).`,`The slope is ${slope}.`],'regression slope'); }
    case 'vectors-matrices': { const x = r.int(1, 8), y = r.int(1, 8), u = r.int(1, 5), v = r.int(1, 5); return num(skillId,d,seed,`What is the first component of ${u}(${x}, ${y}) + ${v}(${y}, ${x})?`,u*x+v*y,[`Scale the first vector's first component: ${u}·${x}.`,`Scale and add the second contribution: ${v}·${y}.`,`The first component is ${u*x+v*y}.`],'vector operation'); }
    case 'linear-systems': { const p = r.int(2, 7), q = r.int(2, 7), s2 = r.int(1, 5); let t = r.int(1, 5); if (p*t === q*s2) t = (t % 5) + 1; return num(skillId,d,seed,`Find the determinant of [[${p}, ${q}], [${s2}, ${t}]].`,p*t-q*s2,[`For [[a,b],[c,d]], det = ad − bc.`,`Compute ${p}·${t} − ${q}·${s2}.`,`The determinant is ${p*t-q*s2}.`],'determinant'); }
    case 'eigenvalues': { const lambda1 = r.int(1, 5), lambda2 = r.int(6, 10); return mc(skillId,d,seed,`A diagonal matrix has diagonal entries ${lambda1} and ${lambda2}. Which list contains its eigenvalues?`,`${lambda1}, ${lambda2}`,[`${lambda1+1}, ${lambda2}`,`${lambda1}, ${lambda2+1}`,`${lambda1*lambda2}`],[`For a diagonal matrix, each diagonal entry is an eigenvalue.`,`Read the two diagonal entries.`,`The eigenvalues are ${lambda1} and ${lambda2}.`],'eigenvalues',r); }
    case 'counting-combinatorics': { const n = r.int(4, 7), k = r.int(2, Math.min(4,n)); return num(skillId,d,seed,`How many ordered arrangements of ${k} distinct objects chosen from ${n} are possible?`,fact(n)/fact(n-k),[`This is a permutation: P(${n},${k}).`,`Multiply ${n}·${n-1}·… for ${k} factors.`,`The count is ${fact(n)/fact(n-k)}.`],'permutations'); }
    case 'discrete-probability': { const trials = r.int(2, 5), success = r.int(1, trials-1); return num(skillId,d,seed,`A fair game pays 1 point for each success in ${trials} independent trials. What is the expected score?`,trials/2,[`Each trial contributes expected value 1·(1/2).`,`Expected values add across independent trials.`,`The expected score is ${trials}/2 = ${nice(trials/2)}.`],'expected value'); }
    case 'first-order-odes': { const rate = r.int(2, 6), initial = r.int(2, 8); return mc(skillId,d,seed,`For y′ = ${rate}y with y(0) = ${initial}, which expression is y(t)?`,`${initial}e^(${rate}t)`,[`${rate}e^(${initial}t)`,`${initial}+${rate}t`,`${initial}e^(-${rate}t)`],[`The equation y′ = ky has exponential solutions.`,`The initial condition supplies the coefficient y(0) = ${initial}.`,`Thus y(t) = ${initial}e^(${rate}t).`],'growth differential equation',r); }
    case 'second-order-odes': { const root1 = r.int(1, 4), root2 = r.int(5, 8); return mc(skillId,d,seed,`For y″ − ${root1+root2}y′ + ${root1*root2}y = 0, which are the characteristic roots?`,`${root1}, ${root2}`,[`${-root1}, ${-root2}`,`${root1+root2}, ${root1*root2}`,`${root1*root2}, ${root1+root2}`],[`Set the characteristic polynomial r² − ${root1+root2}r + ${root1*root2}.`,`Factor it as (r − ${root1})(r − ${root2}).`,`The roots are ${root1} and ${root2}.`],'characteristic roots',r); }
    default: throw new Error(`No generator for ${skillId}`);
  }
}

const parseNumber = (raw: string): number | null => {
  const text = String(raw).trim().replace(/−/g, '-').replace(/,/g, '');
  if (/^[+-]?\d+(?:\.\d+)?\s*\/\s*[+-]?\d+(?:\.\d+)?$/.test(text)) { const [a,b] = text.split('/').map(Number); return b === 0 ? null : a / b; }
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(text)) return null;
  const n = Number(text); return Number.isFinite(n) ? n : null;
};
const norm = (x: string) => x.trim().replace(/−/g, '-').replace(/\s+/g, ' ').toLowerCase();

/** Check without eval: fractions and decimal answers are parsed, not executed. */
export function checkAnswer(question: Question, answer: string | string[]): boolean {
  if (question.type === 'numeric') {
    const raw = Array.isArray(answer) ? answer.join(',') : answer;
    const got = parseNumber(raw); const expected = Number(question.correctAnswer);
    if (got === null || !Number.isFinite(expected)) return false;
    return Math.abs(got - expected) <= Math.max(1e-6, Math.abs(expected) * 1e-6);
  }
  if (question.type === 'multiple-choice') {
    if (Array.isArray(answer) || typeof question.correctAnswer !== 'string') return false;
    return norm(answer) === norm(question.correctAnswer);
  }
  const got = Array.isArray(answer) ? answer : answer.split(',');
  if (!Array.isArray(question.correctAnswer) || got.length !== question.correctAnswer.length) return false;
  const expected = new Set(question.correctAnswer.map(norm));
  const actual = got.map(norm);
  return new Set(actual).size === actual.length && actual.every(x => expected.has(x));
}
