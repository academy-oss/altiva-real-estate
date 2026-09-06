import type { BedroomOption, LocalizedText } from "../types/project";

export function formatPrice(amount: number, lang: string): string {
  const locale = lang === "ar" ? "ar-AE" : "en-AE";
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(amount);
}

export function localized(text: LocalizedText | undefined, lang: string): string {
  if (!text) return "";
  return lang === "ar" ? text.ar : text.en;
}

export function formatBedrooms(bedrooms: BedroomOption[], lang: string, studioLabel: string, bedLabel: string): string {
  if (!bedrooms || bedrooms.length === 0) return "—";
  const sorted = [...bedrooms].sort((a, b) => {
    const rank = (v: BedroomOption) => (v === "studio" ? 0 : v === "5+" ? 6 : Number(v));
    return rank(a) - rank(b);
  });
  const labels = sorted.map((b) => (b === "studio" ? studioLabel : b));
  const joiner = lang === "ar" ? " - " : " - ";
  return `${labels.join(joiner)} ${bedLabel}`;
}

export function formatHandover(dateIso: string | undefined, label: LocalizedText | undefined, lang: string): string {
  if (label) return localized(label, lang);
  if (!dateIso) return "—";
  const date = new Date(dateIso);
  const locale = lang === "ar" ? "ar-AE" : "en-AE";
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" }).format(date);
}
