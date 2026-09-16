'use client';

import { useMemo } from 'react';
import katex from 'katex';

function latex(source: string) {
  return source.replace(/−/g, '-').replace(/×/g, '\\times ').replace(/÷/g, '\\div ')
    .replace(/π/g, '\\pi ').replace(/θ/g, '\\theta ').replace(/∞/g, '\\infty ')
    .replace(/√/g, '\\sqrt{}').replace(/²/g, '^2').replace(/₀/g, '_0').replace(/₁/g, '_1').replace(/′/g, "'");
}
function render(source: string) { return katex.renderToString(latex(source), { displayMode: false, throwOnError: false, strict: 'ignore' }); }

/** Renders explicit $TeX$ plus generated numeric/formula fragments as KaTeX, leaving prose as text. */
export function MathText({ text, expression }: { text?: string; expression?: string }) {
  const html = useMemo(() => {
    const value = text ?? expression ?? '';
    const parts = value.split(/(\$[^$]+\$)/g);
    return parts.map((part, i) => {
      if (part.startsWith('$') && part.endsWith('$')) return `<span class="math-ribbon">${render(part.slice(1, -1))}</span>`;
      // Generated prompts predate explicit TeX. Render their mathematical runs rather than a decorative unrelated formula.
      return part.replace(/(?:[-−]?\d[\d\s,()./−+×÷=<>^²₀₁′πθ∞√]*|[A-Za-z]+\([^)]*\))/g, (chunk) =>
        /[\d=+−×÷^²πθ∞√]/.test(chunk) ? `<span class="math-ribbon">${render(chunk)}</span>` : chunk,
      );
    }).join('');
  }, [text, expression]);
  return <span className="math-text" data-math-source={text ?? expression ?? ''} dangerouslySetInnerHTML={{ __html: html }} />;
}
