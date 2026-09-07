import { cn } from "@/lib/utils";

type AccuracyChartProps = {
  items: Array<{ label: string; accuracy: number }>;
  className?: string;
};

export function AccuracyChart({ items, className }: AccuracyChartProps) {
  return (
    <div
      className={cn(
        "bg-card ring-foreground/10 space-y-3 rounded-xl p-4 ring-1",
        className,
      )}
    >
      <p className="text-sm font-medium">Accuracy by topic</p>
      <ul className="space-y-3" aria-label="Accuracy chart">
        {items.length === 0 ? (
          <li className="text-muted-foreground text-sm">No data yet.</li>
        ) : (
          items.map((item) => (
            <li key={item.label} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span>{item.label}</span>
                <span className="text-muted-foreground tabular-nums">
                  {Math.round(item.accuracy)}%
                </span>
              </div>
              <div
                className="bg-muted h-2 overflow-hidden rounded-full"
                role="presentation"
              >
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, item.accuracy))}%` }}
                />
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
