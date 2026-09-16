import type { Course, Skill, Strand } from './types.ts';

/**
 * MathQuest is a sampler, not a whole curriculum and is not an official
 * standards alignment. Empty standardsCodes are intentional unless a code is
 * known with confidence.
 */
const s = (
  id: string, title: string, strand: Strand, gradeBand: string,
  description: string, prerequisiteSkillIds: string[] = [], difficultyRange: [number, number] = [1, 10],
): Skill => ({ id, title, strand, gradeBand, prerequisiteSkillIds, standardsCodes: [], difficultyRange, generatorId: id, description: `${description} This is a sampler, not a whole curriculum or official standards alignment.` });

export const skills: Skill[] = [
  s('place-value', 'Place Value and Number Sense', 'foundations', '6-8', 'Compare, round, and calculate with signed rational numbers.'),
  s('fractions-ratios', 'Fractions, Ratios, and Proportions', 'foundations', '6-8', 'Reason about equivalent fractions, rates, and proportional relationships.', ['place-value']),
  s('integer-exponents', 'Integer Exponents', 'foundations', '8-10', 'Use exponent laws and evaluate powers.'),
  s('scientific-notation', 'Scientific Notation', 'foundations', '8-10', 'Multiply and compare quantities written in scientific notation.', ['integer-exponents']),
  s('linear-equations', 'One-Variable Linear Equations', 'algebra', '8-10', 'Solve and interpret equations with one unknown.', ['fractions-ratios']),
  s('systems-linear', 'Systems of Linear Equations', 'algebra', '9-11', 'Solve two-equation systems by elimination or substitution.', ['linear-equations']),
  s('inequalities', 'Linear Inequalities', 'algebra', '8-10', 'Solve and represent one-variable inequalities.', ['linear-equations']),
  s('polynomials', 'Polynomial Operations', 'algebra', '9-11', 'Expand, factor, and evaluate polynomial expressions.', ['integer-exponents']),
  s('quadratics', 'Quadratic Equations', 'algebra', '9-11', 'Solve factored quadratics and identify roots and vertices.', ['polynomials', 'linear-equations']),
  s('rational-expressions', 'Rational Expressions', 'algebra', '10-12', 'Simplify rational expressions while respecting excluded values.', ['polynomials']),
  s('function-notation', 'Function Notation and Domain', 'functions', '9-11', 'Evaluate functions and reason about domain restrictions.', ['linear-equations']),
  s('linear-functions', 'Linear Functions and Modeling', 'functions', '8-11', 'Connect slope, intercept, tables, and linear models.', ['function-notation']),
  s('exponentials-logarithms', 'Exponential and Logarithmic Models', 'functions', '10-12', 'Solve exact exponential and logarithmic relationships.', ['integer-exponents', 'function-notation']),
  s('transformations', 'Function Transformations', 'functions', '9-12', 'Recognize translations, stretches, and reflections of functions.', ['function-notation']),
  s('sequences', 'Sequences and Series', 'functions', '9-12', 'Work with arithmetic and geometric sequences and finite sums.', ['linear-functions', 'exponentials-logarithms']),
  s('infinite-series', 'Infinite Geometric Series', 'calculus', '12-College', 'Find exact sums of convergent geometric series.', ['sequences']),
  s('angles-triangles', 'Angles and Triangle Geometry', 'geometry', '6-10', 'Use angle relationships and triangle-sum facts.', ['linear-equations']),
  s('coordinate-geometry', 'Coordinate Geometry', 'geometry', '8-11', 'Calculate distance, midpoint, and slope on a coordinate plane.', ['linear-functions']),
  s('similarity', 'Similarity and Scale', 'geometry', '8-11', 'Use scale factors and proportional corresponding sides.', ['fractions-ratios', 'angles-triangles']),
  s('circles', 'Circles', 'geometry', '9-12', 'Calculate circumference, area, and arc-related quantities with exact pi factors.', ['coordinate-geometry']),
  s('area-volume', 'Area and Volume', 'geometry', '6-10', 'Model area and volume of common two- and three-dimensional figures.', ['fractions-ratios']),
  s('trig-right-triangles', 'Right-Triangle Trigonometry', 'geometry', '9-12', 'Use exact sine, cosine, and tangent ratios in special triangles.', ['angles-triangles', 'similarity']),
  s('unit-circle', 'Unit Circle Values', 'functions', '10-12', 'Recall exact coordinates and trigonometric values at common angles.', ['trig-right-triangles']),
  s('trig-identities', 'Trigonometric Identities', 'functions', '10-12', 'Apply Pythagorean and reciprocal identities.', ['unit-circle']),
  s('limits-continuity', 'Limits and Continuity', 'calculus', '11-12', 'Evaluate approachable limits and identify removable discontinuities.', ['function-notation', 'quadratics']),
  s('derivatives', 'Derivative Rules', 'calculus', '11-College', 'Differentiate polynomial, product, and simple composite expressions.', ['limits-continuity']),
  s('partial-derivatives', 'Partial Derivatives', 'calculus', 'College', 'Differentiate polynomial functions of two variables with respect to one variable at a time.', ['derivatives']),
  s('applications-derivatives', 'Applications of Derivatives', 'calculus', '11-College', 'Use derivatives for tangent slopes and optimization.', ['derivatives']),
  s('integrals', 'Antiderivatives and Definite Integrals', 'calculus', '11-College', 'Evaluate power-rule antiderivatives and simple definite integrals.', ['derivatives']),
  s('double-integrals', 'Double Integrals', 'calculus', 'College', 'Evaluate polynomial functions over rectangular regions by iterated integration.', ['integrals']),
  s('applications-integrals', 'Applications of Integrals', 'calculus', '11-College', 'Use accumulation and average-value ideas with polynomial functions.', ['integrals']),
  s('descriptive-stats', 'Descriptive Statistics', 'statistics', '9-12', 'Calculate mean, median, range, and interpret small data sets.', ['place-value']),
  s('probability', 'Probability Rules', 'statistics', '9-12', 'Use complements, unions, and independent-event multiplication.', ['fractions-ratios']),
  s('inference', 'Sampling and Confidence Ideas', 'statistics', '11-College', 'Reason about standard errors and interval estimates in simplified settings.', ['descriptive-stats', 'probability']),
  s('regression', 'Linear Regression Concepts', 'statistics', '10-College', 'Interpret slope, intercept, and residuals for small exact data sets.', ['linear-functions', 'descriptive-stats']),
  s('vectors-matrices', 'Vectors and Matrix Operations', 'linear-algebra', 'College', 'Add vectors and multiply small matrices.', ['systems-linear']),
  s('linear-systems', 'Linear Algebraic Systems', 'linear-algebra', 'College', 'Use determinants and elimination on 2-by-2 systems.', ['vectors-matrices']),
  s('eigenvalues', 'Eigenvalues of 2-by-2 Matrices', 'linear-algebra', 'College', 'Find eigenvalues of structured 2-by-2 matrices.', ['linear-systems']),
  s('counting-combinatorics', 'Counting and Combinatorics', 'discrete-math', '10-College', 'Count permutations, combinations, and constrained arrangements.', ['fractions-ratios']),
  s('discrete-probability', 'Discrete Probability Models', 'discrete-math', '10-College', 'Compute expected values for finite uniform and binomial models.', ['counting-combinatorics', 'probability']),
  s('first-order-odes', 'First-Order Differential Equations', 'calculus', 'College', 'Solve separable and simple growth differential equations.', ['integrals', 'exponentials-logarithms']),
  s('second-order-odes', 'Second-Order Differential Equations', 'calculus', 'College', 'Solve constant-coefficient homogeneous equations with distinct integer roots.', ['first-order-odes', 'quadratics']),
];

const by = (ids: string[]) => ids;
export const courses: Course[] = [
  { id: 'ga-algebra', title: 'Algebra: Concepts and Connections', shortTitle: 'GA Algebra', track: 'Georgia Core', realm: 'The Equation Foundry', description: 'A sampler of core algebraic reasoning, not a whole curriculum or official standards alignment.', skillIds: by(['place-value','fractions-ratios','linear-equations','inequalities','polynomials','quadratics','function-notation']) },
  { id: 'ga-geometry', title: 'Geometry: Concepts and Connections', shortTitle: 'GA Geometry', track: 'Georgia Core', realm: 'The Compass Citadel', description: 'A sampler of geometric reasoning, not a whole curriculum or official standards alignment.', skillIds: by(['angles-triangles','coordinate-geometry','similarity','circles','area-volume','trig-right-triangles']) },
  { id: 'ga-advanced-algebra', title: 'Advanced Algebra: Concepts and Connections', shortTitle: 'GA Advanced Algebra', track: 'Georgia Core', realm: 'The Parabola Peaks', description: 'A sampler of advanced algebra and functions, not a whole curriculum or official standards alignment.', skillIds: by(['integer-exponents','quadratics','rational-expressions','linear-functions','exponentials-logarithms','transformations','sequences']) },
  { id: 'ga-precalculus', title: 'Precalculus', shortTitle: 'Precalculus', track: 'Georgia Core', realm: 'The Function Frontier', description: 'A sampler of precalculus topics, not a whole curriculum or official standards alignment.', skillIds: by(['function-notation','exponentials-logarithms','sequences','unit-circle','trig-identities','limits-continuity']) },
  { id: 'ap-precalculus', title: 'AP Precalculus', shortTitle: 'AP Precalculus', track: 'AP', realm: 'The Modeling Observatory', description: 'A sampler of AP-style precalculus modeling, not a whole curriculum or official standards alignment.', skillIds: by(['linear-functions','exponentials-logarithms','transformations','trig-identities','sequences']) },
  { id: 'ap-calculus-ab', title: 'AP Calculus AB', shortTitle: 'AP Calculus AB', track: 'AP', realm: 'The Limit Gardens', description: 'A sampler of introductory calculus, not a whole curriculum or official standards alignment.', skillIds: by(['limits-continuity','derivatives','applications-derivatives','integrals','applications-integrals']) },
  { id: 'ap-calculus-bc', title: 'AP Calculus BC', shortTitle: 'AP Calculus BC', track: 'AP', realm: 'The Infinite Staircase', description: 'A sampler of broader calculus, not a whole curriculum or official standards alignment.', skillIds: by(['limits-continuity','derivatives','integrals','applications-integrals','sequences','infinite-series']) },
  { id: 'ap-statistics', title: 'AP Statistics', shortTitle: 'AP Statistics', track: 'AP', realm: 'The Data Commons', description: 'A sampler of statistical reasoning, not a whole curriculum or official standards alignment.', skillIds: by(['descriptive-stats','probability','inference','regression']) },
  { id: 'ib-aa-sl', title: 'IB Mathematics: Analysis and Approaches SL', shortTitle: 'IB AA SL', track: 'IB', realm: 'The Analysis Atelier', description: 'A sampler of analysis and approaches, not a whole curriculum or official standards alignment.', skillIds: by(['function-notation','linear-functions','quadratics','derivatives','integrals']) },
  { id: 'ib-aa-hl', title: 'IB Mathematics: Analysis and Approaches HL', shortTitle: 'IB AA HL', track: 'IB', realm: 'The Proofwright Archives', description: 'A sampler of higher-level analysis, not a whole curriculum or official standards alignment.', skillIds: by(['quadratics','trig-identities','derivatives','integrals','first-order-odes','infinite-series']) },
  { id: 'ib-ai-sl', title: 'IB Mathematics: Applications and Interpretation SL', shortTitle: 'IB AI SL', track: 'IB', realm: 'The Applied Atlas', description: 'A sampler of mathematical applications and interpretation, not a whole curriculum or official standards alignment.', skillIds: by(['scientific-notation','linear-functions','descriptive-stats','probability','regression','area-volume']) },
  { id: 'ib-ai-hl', title: 'IB Mathematics: Applications and Interpretation HL', shortTitle: 'IB AI HL', track: 'IB', realm: 'The Simulation Harbor', description: 'A sampler of higher-level applications, not a whole curriculum or official standards alignment.', skillIds: by(['exponentials-logarithms','regression','inference','integrals','discrete-probability']) },
  { id: 'gt-1554', title: 'MATH 1554 Linear Algebra', shortTitle: 'MATH 1554', track: 'Georgia Tech', realm: 'The Matrix Forge', description: 'A sampler of linear algebra, not a whole curriculum or official standards alignment.', skillIds: by(['vectors-matrices','linear-systems','eigenvalues','systems-linear']) },
  { id: 'gt-2551', title: 'MATH 2551 Multivariable Calculus', shortTitle: 'MATH 2551', track: 'Georgia Tech', realm: 'The Gradient Range', description: 'A sampler of multivariable calculus topics, not a whole curriculum or official standards alignment.', skillIds: by(['vectors-matrices','partial-derivatives','double-integrals']) },
  { id: 'gt-3012', title: 'MATH 3012 Applied Combinatorics', shortTitle: 'MATH 3012', track: 'Georgia Tech', realm: 'The Counting Carnival', description: 'A sampler of applied combinatorics, not a whole curriculum or official standards alignment.', skillIds: by(['counting-combinatorics','discrete-probability','probability','sequences']) },
  { id: 'gt-2552', title: 'MATH 2552 Differential Equations', shortTitle: 'MATH 2552', track: 'Georgia Tech', realm: 'The Phase Portraits', description: 'A sampler of differential equations, not a whole curriculum or official standards alignment.', skillIds: by(['first-order-odes','second-order-odes','exponentials-logarithms','integrals']) },
];

// Keep this assertion local and harmless at runtime; it catches accidental broken references during development.
const skillIds = new Set(skills.map(x => x.id));
for (const skill of skills) for (const pre of skill.prerequisiteSkillIds) if (!skillIds.has(pre)) throw new Error(`Unknown prerequisite ${pre}`);
for (const course of courses) if (course.skillIds.length < 3 || course.skillIds.some(id => !skillIds.has(id))) throw new Error(`Invalid course ${course.id}`);
