import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type ProgressCardProps = {
  title: string;
  value: number;
  max?: number;
  description?: string;
  className?: string;
};

export function ProgressCard({
  title,
  value,
  max = 100,
  description,
  className,
}: ProgressCardProps) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));

  return (
    <div
      className={cn(
        "bg-card ring-foreground/10 flex flex-col gap-3 rounded-xl p-4 ring-1",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-sm tabular-nums">{pct}%</p>
      </div>
      <Progress value={pct} aria-label={`${title}: ${pct}%`} />
      {description ? (
        <p className="text-muted-foreground text-xs">{description}</p>
      ) : null}
    </div>
  );
}
