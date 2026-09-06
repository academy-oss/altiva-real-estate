import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-gold-gradient text-navy-deep shadow-gold-sm hover:shadow-gold-lg btn-shine",
  secondary: "border border-copper/60 text-cream hover:bg-copper/10",
  ghost: "text-cream hover:text-copper",
};

const sizes: Record<Size, string> = {
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Internal-navigation button (React Router). */
export function LinkButton({
  to,
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  ...rest
}: CommonProps & { to: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link to={to} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}

/** External-link button (e.g. WhatsApp, mailto:, tel:). */
export function AnchorButton({
  href,
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  ...rest
}: CommonProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <a href={href} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {icon}
      {children}
    </a>
  );
}

/** Plain <button> (form submits, toggles, etc.). */
export function Button({
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {icon}
      {children}
    </button>
  );
}
