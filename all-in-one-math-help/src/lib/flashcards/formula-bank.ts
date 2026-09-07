export const FORMULA_BANK = {
  Algebra: [
    {
      front: "Quadratic Formula",
      back: "x = [-b ± √(b² − 4ac)] / (2a)",
      explanation: "Solves ax² + bx + c = 0 when a ≠ 0.",
    },
    {
      front: "Slope Formula",
      back: "m = (y₂ − y₁) / (x₂ − x₁)",
      explanation: "Rate of change between two points.",
    },
    {
      front: "Point-Slope Form",
      back: "y − y₁ = m(x − x₁)",
      explanation: "Line through (x₁, y₁) with slope m.",
    },
  ],
  Geometry: [
    {
      front: "Pythagorean Theorem",
      back: "a² + b² = c²",
      explanation: "Right triangle with legs a, b and hypotenuse c.",
    },
    {
      front: "Area of a Circle",
      back: "A = πr²",
      explanation: "r is the radius.",
    },
    {
      front: "Circumference",
      back: "C = 2πr",
      explanation: "Distance around a circle.",
    },
  ],
  "Algebra 2": [
    {
      front: "Exponential Growth",
      back: "A = A₀(1 + r)^t",
      explanation: "Growth at rate r for t periods.",
    },
    {
      front: "Log Product Rule",
      back: "log(ab) = log a + log b",
      explanation: "Turns products into sums.",
    },
    {
      front: "Completing the Square",
      back: "x² + bx → (x + b/2)² − (b/2)²",
      explanation: "Rewrites quadratics into vertex form.",
    },
  ],
  Precalculus: [
    {
      front: "Unit Circle Cosine",
      back: "cos θ = x-coordinate on unit circle",
      explanation: "At angle θ from positive x-axis.",
    },
    {
      front: "Unit Circle Sine",
      back: "sin θ = y-coordinate on unit circle",
      explanation: "At angle θ from positive x-axis.",
    },
    {
      front: "Arithmetic Sequence",
      back: "aₙ = a₁ + (n − 1)d",
      explanation: "Common difference d.",
    },
  ],
  Calculus: [
    {
      front: "Power Rule",
      back: "d/dx [xⁿ] = n xⁿ⁻¹",
      explanation: "Differentiate polynomial terms.",
    },
    {
      front: "Product Rule",
      back: "(uv)' = u'v + uv'",
      explanation: "Derivative of a product.",
    },
    {
      front: "Fundamental Theorem",
      back: "∫ₐᵇ f'(x) dx = f(b) − f(a)",
      explanation: "Links differentiation and integration.",
    },
  ],
  "AP Precalculus": [
    {
      front: "Logarithm Definition",
      back: "log_b(a) = c ⟺ b^c = a",
      explanation: "Connects logs and exponentials.",
    },
    {
      front: "Sine of a Sum",
      back: "sin(A + B) = sin A cos B + cos A sin B",
      explanation: "Angle addition identity.",
    },
    {
      front: "Arithmetic Sequence",
      back: "aₙ = a₁ + (n − 1)d",
      explanation: "Model linear change over time.",
    },
  ],
  "AP Calculus AB": [
    {
      front: "Chain Rule",
      back: "d/dx f(g(x)) = f'(g(x)) · g'(x)",
      explanation: "Differentiate composite functions.",
    },
    {
      front: "Mean Value Theorem",
      back: "f'(c) = [f(b) − f(a)] / (b − a)",
      explanation: "Exists c in (a, b) under continuity/differentiability.",
    },
    {
      front: "Fundamental Theorem",
      back: "∫ₐᵇ f'(x) dx = f(b) − f(a)",
      explanation: "Evaluate definite integrals using antiderivatives.",
    },
  ],
  "AP Calculus BC": [
    {
      front: "Integration by Parts",
      back: "∫ u dv = uv − ∫ v du",
      explanation: "Integrate products of functions.",
    },
    {
      front: "Taylor Series",
      back: "f(x) = Σ f⁽ⁿ⁾(a)/n! · (x − a)ⁿ",
      explanation: "Represent functions as power series.",
    },
    {
      front: "Polar Area",
      back: "A = ½ ∫ r² dθ",
      explanation: "Area bounded by a polar curve.",
    },
  ],
  "AP Statistics": [
    {
      front: "Normal Distribution z",
      back: "z = (x − μ) / σ",
      explanation: "Standardize a score for inference.",
    },
    {
      front: "Sample Mean",
      back: "x̄ = Σx / n",
      explanation: "Average of a data set.",
    },
    {
      front: "Confidence Interval",
      back: "x̄ ± z* · (σ / √n)",
      explanation: "Estimate a population mean with margin of error.",
    },
  ],
  "IB Math: Analysis & Approaches SL": [
    {
      front: "Derivative Definition",
      back: "f'(x) = lim[h→0] (f(x+h) − f(x)) / h",
      explanation: "Instantaneous rate of change.",
    },
    {
      front: "Quadratic Formula",
      back: "x = [-b ± √(b² − 4ac)] / (2a)",
      explanation: "Solve quadratic equations algebraically.",
    },
    {
      front: "Sine Rule",
      back: "a/sin A = b/sin B = c/sin C",
      explanation: "Relates sides and angles in any triangle.",
    },
  ],
  "IB Math: Analysis & Approaches HL": [
    {
      front: "Integration by Parts",
      back: "∫ u dv = uv − ∫ v du",
      explanation: "Key technique for HL integration.",
    },
    {
      front: "Euler's Formula",
      back: "e^(iθ) = cos θ + i sin θ",
      explanation: "Links exponentials and trigonometry.",
    },
    {
      front: "Maclaurin Series",
      back: "f(x) = Σ f⁽ⁿ⁾(0)/n! · xⁿ",
      explanation: "Taylor series centered at zero.",
    },
  ],
  "IB Math: Applications & Interpretation SL": [
    {
      front: "Compound Interest",
      back: "A = P(1 + r/n)^(nt)",
      explanation: "Finance and growth modeling.",
    },
    {
      front: "Linear Regression",
      back: "y = mx + b",
      explanation: "Model linear trends in data.",
    },
    {
      front: "Normal Distribution z",
      back: "z = (x − μ) / σ",
      explanation: "Standardize data for probability.",
    },
  ],
  "IB Math: Applications & Interpretation HL": [
    {
      front: "Binomial Probability",
      back: "P(X=k) = C(n,k) pᵏ (1−p)ⁿ⁻ᵏ",
      explanation: "Probability with n independent trials.",
    },
    {
      front: "Markov Transition",
      back: "vₙ = v₀ · Tⁿ",
      explanation: "Long-run state in stochastic models.",
    },
    {
      front: "Spearman's Rank",
      back: "ρ = 1 − 6Σd² / (n(n² − 1))",
      explanation: "Measure monotonic association.",
    },
  ],
} as const;

export type FormulaSubject = keyof typeof FORMULA_BANK;
