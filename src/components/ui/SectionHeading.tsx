import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "start";
  tone?: "light" | "dark";
  className?: string;
}

export function SectionHeading({ eyebrow, title, subtitle, align = "center", tone = "light", className }: SectionHeadingProps) {
  const isCenter = align === "center";
  const titleColor = tone === "light" ? "text-cream" : "text-navy-deep";
  const subtitleColor = tone === "light" ? "text-cream/70" : "text-navy-deep/60";

  return (
    <div className={cn("mb-10 md:mb-14", isCenter && "text-center", className)}>
      {eyebrow && (
        <div className={cn("mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-copper", isCenter && "justify-center")}>
          <span className="h-px w-8 bg-gold-gradient" />
          {eyebrow}
        </div>
      )}
      <h2 className={cn("font-display-heading text-3xl font-bold sm:text-4xl md:text-5xl", titleColor)}>{title}</h2>
      {subtitle && <p className={cn("mx-auto mt-4 max-w-2xl text-base sm:text-lg", subtitleColor)}>{subtitle}</p>}
    </div>
  );
}
