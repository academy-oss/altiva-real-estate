import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const fieldBase =
  "w-full rounded-xl border border-cream-dark bg-white px-4 py-3 text-sm text-navy-deep placeholder:text-navy/35 transition-colors focus:border-copper focus:outline-none";

interface WrapperProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FieldWrapper({ label, htmlFor, error, required, children, className }: WrapperProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-navy-deep/90">
        {label}
        {required && <span className="text-copper"> *</span>}
      </label>
      {children}
      {error && <span id={`${htmlFor}-error`} className="text-xs font-medium text-red-600">{error}</span>}
    </div>
  );
}

type TextFieldProps = Omit<WrapperProps, "children"> & InputHTMLAttributes<HTMLInputElement>;

export function TextField({ label, htmlFor, error, required, className, ...rest }: TextFieldProps) {
  const errorId = `${htmlFor}-error`;
  return (
    <FieldWrapper label={label} htmlFor={htmlFor} error={error} required={required}>
      <input id={htmlFor} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={cn(fieldBase, error && "border-red-400", className)} {...rest} />
    </FieldWrapper>
  );
}

type SelectFieldProps = Omit<WrapperProps, "children"> & SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[]; placeholder?: string };

export function SelectField({ label, htmlFor, error, required, options, placeholder, className, ...rest }: SelectFieldProps) {
  const errorId = `${htmlFor}-error`;
  return (
    <FieldWrapper label={label} htmlFor={htmlFor} error={error} required={required}>
      <select id={htmlFor} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={cn(fieldBase, "cursor-pointer", error && "border-red-400", className)} {...rest}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

type TextareaFieldProps = Omit<WrapperProps, "children"> & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextareaField({ label, htmlFor, error, required, className, ...rest }: TextareaFieldProps) {
  const errorId = `${htmlFor}-error`;
  return (
    <FieldWrapper label={label} htmlFor={htmlFor} error={error} required={required}>
      <textarea id={htmlFor} rows={4} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={cn(fieldBase, "resize-none", error && "border-red-400", className)} {...rest} />
    </FieldWrapper>
  );
}

export function CheckboxField({
  id,
  checked,
  onChange,
  label,
  error,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-navy-deep/80">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#c9a15a]"
        />
        <span>{label}</span>
      </label>
      {error && <span id={`${id}-error`} className="text-xs font-medium text-red-600">{error}</span>}
    </div>
  );
}

export function RadioGroupField({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-label={label} aria-required={required} data-field={name}>
      <span className="text-sm font-semibold text-navy-deep/90">
        {label}
        {required && <span className="text-copper"> *</span>}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => onChange(opt.value)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active ? "border-copper bg-copper/10 text-navy-deep" : "border-cream-dark text-navy-deep/60 hover:border-copper/50"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </div>
  );
}
