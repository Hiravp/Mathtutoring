import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  className?: string;
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-card ring-foreground/10 flex flex-col gap-2 rounded-xl p-4 ring-1",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
        {Icon ? (
          <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden />
        ) : null}
      </div>
      <p className="text-3xl font-semibold tracking-tight">{value}</p>
      {description ? (
        <p className="text-muted-foreground text-xs">{description}</p>
      ) : null}
    </div>
  );
}
