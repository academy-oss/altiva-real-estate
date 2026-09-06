import { useTranslation } from "react-i18next";
import { Search, X } from "lucide-react";
import {
  EMIRATES,
  PROPERTY_TYPES,
  PRICE_RANGES,
  BEDROOM_OPTIONS,
  PROJECT_STATUSES,
} from "../../types/project";
import type { ProjectFilterState, HandoverFilter } from "../../lib/filterProjects";
import { cn } from "../../lib/utils";

interface ProjectFiltersProps {
  filters: ProjectFilterState;
  onChange: (next: ProjectFilterState) => void;
  areas: { ar: string; en: string }[];
  developers: { ar: string; en: string }[];
}

function toggleInArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

const HANDOVER_OPTIONS: HandoverFilter[] = ["all", "ready", "2026", "2027", "2028_plus"];

export function ProjectFilters({ filters, onChange, areas, developers }: ProjectFiltersProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const set = <K extends keyof ProjectFilterState>(key: K, value: ProjectFilterState[K]) => onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <h3 className="font-display-heading text-xl font-bold text-navy-deep">{t("projects.filters.title")}</h3>
      </div>

      {/* Search */}
      <div className="relative">
        <label htmlFor="project-search" className="sr-only">{t("projects.filters.search")}</label>
        <Search size={17} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-navy/40" />
        <input
          id="project-search"
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          placeholder={t("projects.filters.search")}
          className="w-full rounded-xl border border-cream-dark bg-white py-3 ps-10 pe-4 text-sm text-navy-deep placeholder:text-navy/40 focus:border-copper focus:outline-none"
        />
      </div>

      {/* Emirate */}
      <FilterSection title={t("projects.filters.emirate")}>
        <select
          aria-label={t("projects.filters.emirate")}
          value={filters.emirate}
          onChange={(e) => onChange({ ...filters, emirate: e.target.value as ProjectFilterState["emirate"], area: "all" })}
          className="w-full rounded-xl border border-cream-dark bg-white px-3 py-2.5 text-sm text-navy-deep focus:border-copper focus:outline-none"
        >
          <option value="all">{t("common.all")}</option>
          {EMIRATES.map((e) => (
            <option key={e} value={e}>
              {t(`emirates.${e}`)}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* Area */}
      <FilterSection title={t("projects.filters.area")}>
        <select
          aria-label={t("projects.filters.area")}
          value={filters.area}
          onChange={(e) => set("area", e.target.value)}
          className="w-full rounded-xl border border-cream-dark bg-white px-3 py-2.5 text-sm text-navy-deep focus:border-copper focus:outline-none"
        >
          <option value="all">{t("common.all")}</option>
          {areas.map((a) => (
            <option key={a.en} value={a.en}>
              {lang === "ar" ? a.ar : a.en}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* Property type — multi select chips */}
      <FilterSection title={t("projects.filters.propertyType")}>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((pt) => {
            const active = filters.propertyTypes.includes(pt);
            return (
              <Chip key={pt} active={active} onClick={() => set("propertyTypes", toggleInArray(filters.propertyTypes, pt))}>
                {t(`propertyTypes.${pt}`)}
              </Chip>
            );
          })}
        </div>
      </FilterSection>

      {/* Price ranges — multi select chips */}
      <FilterSection title={t("projects.filters.priceRange")}>
        <div className="flex flex-wrap gap-2">
          {PRICE_RANGES.map((range) => {
            const active = filters.priceRanges.includes(range.id);
            return (
              <Chip key={range.id} active={active} onClick={() => set("priceRanges", toggleInArray(filters.priceRanges, range.id))}>
                {t(`priceRanges.${range.id}`)}
              </Chip>
            );
          })}
        </div>
      </FilterSection>

      {/* Bedrooms */}
      <FilterSection title={t("projects.filters.bedrooms")}>
        <div className="flex flex-wrap gap-2">
          {BEDROOM_OPTIONS.map((b) => {
            const active = filters.bedrooms.includes(b);
            return (
              <Chip key={b} active={active} onClick={() => set("bedrooms", toggleInArray(filters.bedrooms, b))}>
                {b === "studio" ? t("common.studio") : b}
              </Chip>
            );
          })}
        </div>
      </FilterSection>

      {/* Developer */}
      <FilterSection title={t("projects.filters.developer")}>
        <select
          aria-label={t("projects.filters.developer")}
          value={filters.developer}
          onChange={(e) => set("developer", e.target.value)}
          className="w-full rounded-xl border border-cream-dark bg-white px-3 py-2.5 text-sm text-navy-deep focus:border-copper focus:outline-none"
        >
          <option value="all">{t("common.all")}</option>
          {developers.map((d) => (
            <option key={d.en} value={d.en}>
              {lang === "ar" ? d.ar : d.en}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* Status */}
      <FilterSection title={t("projects.filters.status")}>
        <div className="flex flex-wrap gap-2">
          <Chip active={filters.status === "all"} onClick={() => set("status", "all")}>
            {t("common.all")}
          </Chip>
          {PROJECT_STATUSES.map((s) => (
            <Chip key={s} active={filters.status === s} onClick={() => set("status", s)}>
              {t(`projectStatus.${s}`)}
            </Chip>
          ))}
        </div>
      </FilterSection>

      {/* Handover */}
      <FilterSection title={t("projects.filters.handover")}>
        <div className="flex flex-wrap gap-2">
          {HANDOVER_OPTIONS.map((h) => (
            <Chip key={h} active={filters.handover === h} onClick={() => set("handover", h)}>
              {h === "all" ? t("common.all") : h === "ready" ? t("projectStatus.ready") : h === "2028_plus" ? "2028+" : h}
            </Chip>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 border-t border-cream-dark/70 pt-5 first:border-t-0 first:pt-0">
      <span className="text-xs font-bold uppercase tracking-wide text-navy-deep/50">{title}</span>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
        active ? "border-copper bg-copper/15 text-navy-deep" : "border-cream-dark text-navy-deep/55 hover:border-copper/50"
      )}
    >
      {children}
    </button>
  );
}

export function ClearFiltersButton({ onClear }: { onClear: () => void }) {
  const { t } = useTranslation();
  return (
    <button onClick={onClear} className="inline-flex items-center gap-1.5 text-sm font-semibold text-copper hover:underline">
      <X size={14} />
      {t("projects.filters.clear")}
    </button>
  );
}
