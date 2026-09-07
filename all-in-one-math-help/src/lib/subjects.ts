export const SUBJECT_CATEGORIES = [
  { id: "standard", label: "Standard Math" },
  { id: "ap", label: "AP" },
  { id: "ib", label: "IB" },
] as const;

export type SubjectCategoryId = (typeof SUBJECT_CATEGORIES)[number]["id"];

export const SUBJECTS = [
  {
    id: "algebra",
    name: "Algebra",
    category: "standard",
    description: "Equations, expressions, and linear relationships",
  },
  {
    id: "geometry",
    name: "Geometry",
    description: "Shapes, proofs, area, and volume",
    category: "standard",
  },
  {
    id: "algebra-2",
    name: "Algebra 2",
    category: "standard",
    description: "Quadratics, exponentials, and advanced functions",
  },
  {
    id: "precalculus",
    name: "Precalculus",
    category: "standard",
    description: "Trigonometry, sequences, and analytic prep",
  },
  {
    id: "calculus",
    name: "Calculus",
    category: "standard",
    description: "Limits, derivatives, and integrals",
  },
  {
    id: "ap-precalculus",
    name: "AP Precalculus",
    category: "ap",
    description: "Polynomial, exponential, and trigonometric modeling",
  },
  {
    id: "ap-calculus-ab",
    name: "AP Calculus AB",
    category: "ap",
    description: "Limits, derivatives, integrals, and the FTC",
  },
  {
    id: "ap-calculus-bc",
    name: "AP Calculus BC",
    category: "ap",
    description: "Series, parametric equations, and polar functions",
  },
  {
    id: "ap-statistics",
    name: "AP Statistics",
    category: "ap",
    description: "Data analysis, inference, and probability",
  },
  {
    id: "ib-math-aa-sl",
    name: "IB Math: Analysis & Approaches SL",
    category: "ib",
    description: "Algebra, functions, calculus, and proofs at SL depth",
  },
  {
    id: "ib-math-aa-hl",
    name: "IB Math: Analysis & Approaches HL",
    category: "ib",
    description: "Advanced calculus, series, and proof-heavy topics",
  },
  {
    id: "ib-math-ai-sl",
    name: "IB Math: Applications & Interpretation SL",
    category: "ib",
    description: "Modeling, statistics, and technology at SL depth",
  },
  {
    id: "ib-math-ai-hl",
    name: "IB Math: Applications & Interpretation HL",
    category: "ib",
    description: "Advanced modeling, statistics, and graphing at HL depth",
  },
] as const;

export type SubjectId = (typeof SUBJECTS)[number]["id"];
export type SubjectName = (typeof SUBJECTS)[number]["name"];

export const SUBJECT_IDS = SUBJECTS.map((subject) => subject.id) as [
  SubjectId,
  ...SubjectId[],
];

export function isSubjectId(value: string): value is SubjectId {
  return SUBJECT_IDS.includes(value as SubjectId);
}

export function getSubjectById(id: string) {
  return SUBJECTS.find((subject) => subject.id === id);
}

export function getSubjectByName(name: string) {
  return SUBJECTS.find(
    (subject) => subject.name.toLowerCase() === name.toLowerCase(),
  );
}

export function getSubjectsByCategory(category: SubjectCategoryId) {
  return SUBJECTS.filter((subject) => subject.category === category);
}

export function getCategoryLabel(category: SubjectCategoryId) {
  return SUBJECT_CATEGORIES.find((item) => item.id === category)?.label ?? category;
}
