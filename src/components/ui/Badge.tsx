import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type BadgeVariant = "gold-solid" | "gold-outline" | "neutral";

export function Badge({ children, variant = "gold-outline", className }: { children: ReactNode; variant?: BadgeVariant; className?: string }) {
  const styles: Record<BadgeVariant, string> = {
    "gold-solid": "bg-gold-gradient text-navy-deep font-bold",
    "gold-outline": "border border-copper/50 text-copper",
    neutral: "border border-cream/20 text-cream/70",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", styles[variant], className)}>
      {children}
    </span>
  );
}
