import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SlidersHorizontal, X } from "lucide-react";
import type { Project } from "../types/project";
import { fetchProjects, getAvailableAreas, getAvailableDevelopers } from "../services/projectsService";
import { DEFAULT_FILTERS, filterProjects, hasActiveFilters, type ProjectFilterState } from "../lib/filterProjects";
import { Container } from "../components/ui/Container";
import { ProjectCard } from "../components/projects/ProjectCard";
import { ProjectFilters, ClearFiltersButton } from "../components/projects/ProjectFilters";

export default function Projects() {
  const { t } = useTranslation();
  const [allProjects, setAllProjects] = useState<Project[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [filters, setFilters] = useState<ProjectFilterState>(DEFAULT_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    fetchProjects().then(setAllProjects).catch(() => {
      setLoadError(true);
      setAllProjects([]);
    });
  }, []);

  const areas = useMemo(
    () => getAvailableAreas(allProjects ?? [], filters.emirate === "all" ? undefined : filters.emirate),
    [allProjects, filters.emirate]
  );
  const developers = useMemo(() => getAvailableDevelopers(allProjects ?? []), [allProjects]);

  const filtered = useMemo(() => (allProjects ? filterProjects(allProjects, filters) : []), [allProjects, filters]);

  return (
    <div className="bg-navy py-16 sm:py-20">
      <Container>
        <div className="mb-10 text-center">
          <h1 className="font-display-heading text-4xl font-bold text-cream sm:text-5xl">{t("projects.pageTitle")}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-cream/60">{t("projects.pageSubtitle")}</p>
        </div>

        {/* Mobile filter trigger */}
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-copper/50 px-5 py-2.5 text-sm font-semibold text-cream"
          >
            <SlidersHorizontal size={16} />
            {t("projects.filters.title")}
          </button>
          {hasActiveFilters(filters) && <ClearFiltersButton onClear={() => setFilters(DEFAULT_FILTERS)} />}
        </div>

        <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-3xl bg-cream p-6 thin-scrollbar">
              <ProjectFilters filters={filters} onChange={setFilters} areas={areas} developers={developers} />
              {hasActiveFilters(filters) && (
                <div className="mt-6 border-t border-cream-dark pt-5">
                  <ClearFiltersButton onClear={() => setFilters(DEFAULT_FILTERS)} />
                </div>
              )}
            </div>
          </aside>

          {/* Results */}
          <div>
            <p className="mb-6 text-sm text-cream/50">{t("common.showResults", { count: filtered.length })}</p>

            {loadError ? (
              <div role="alert" className="rounded-3xl border border-cream/10 bg-navy-light p-12 text-center text-cream/60">{t("common.loadError")}</div>
            ) : !allProjects ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-navy-light" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-3xl border border-cream/10 bg-navy-light p-12 text-center text-cream/60">{t("common.noResults")}</div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-deep/70" onClick={() => setMobileFiltersOpen(false)} />
          <div role="dialog" aria-modal="true" aria-label={t("projects.filters.title")} className="absolute bottom-0 start-0 end-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-cream p-6 thin-scrollbar">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display-heading text-lg font-bold text-navy-deep">{t("projects.filters.title")}</span>
              <button onClick={() => setMobileFiltersOpen(false)} className="text-navy-deep/60" aria-label={t("common.close")}>
                <X size={22} />
              </button>
            </div>
            <ProjectFilters filters={filters} onChange={setFilters} areas={areas} developers={developers} />
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-6 w-full rounded-full bg-gold-gradient py-3 text-sm font-bold text-navy-deep"
            >
              {t("common.showResults", { count: filtered.length })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
