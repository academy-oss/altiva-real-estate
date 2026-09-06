import type { BedroomOption, Emirate, PriceRangeId, Project, ProjectStatus, PropertyType } from "../types/project";
import { projectMatchesPriceRange } from "../types/project";

export type HandoverFilter = "all" | "ready" | "2026" | "2027" | "2028_plus";

export interface ProjectFilterState {
  search: string;
  emirate: Emirate | "all";
  area: string | "all"; // area.en used as key
  propertyTypes: PropertyType[];
  priceRanges: PriceRangeId[];
  bedrooms: BedroomOption[];
  developer: string | "all"; // developer.en used as key
  status: ProjectStatus | "all";
  handover: HandoverFilter;
}

export const DEFAULT_FILTERS: ProjectFilterState = {
  search: "",
  emirate: "all",
  area: "all",
  propertyTypes: [],
  priceRanges: [],
  bedrooms: [],
  developer: "all",
  status: "all",
  handover: "all",
};

export function hasActiveFilters(filters: ProjectFilterState): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.emirate !== "all" ||
    filters.area !== "all" ||
    filters.propertyTypes.length > 0 ||
    filters.priceRanges.length > 0 ||
    filters.bedrooms.length > 0 ||
    filters.developer !== "all" ||
    filters.status !== "all" ||
    filters.handover !== "all"
  );
}

function matchesHandover(project: Project, handover: HandoverFilter): boolean {
  if (handover === "all") return true;
  if (handover === "ready") return project.status === "ready";
  if (!project.handoverDate) return false;
  const year = new Date(project.handoverDate).getFullYear();
  if (handover === "2026") return year === 2026;
  if (handover === "2027") return year === 2027;
  if (handover === "2028_plus") return year >= 2028;
  return true;
}

export function filterProjects(projects: Project[], filters: ProjectFilterState): Project[] {
  const search = filters.search.trim().toLowerCase();

  return projects.filter((p) => {
    if (filters.emirate !== "all" && p.emirate !== filters.emirate) return false;
    if (filters.area !== "all" && p.area.en !== filters.area) return false;
    if (filters.developer !== "all" && p.developer.en !== filters.developer) return false;
    if (filters.status !== "all" && p.status !== filters.status) return false;
    if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(p.propertyType)) return false;
    if (filters.priceRanges.length > 0 && !filters.priceRanges.some((r) => projectMatchesPriceRange(p, r))) return false;
    if (filters.bedrooms.length > 0 && !p.bedrooms.some((b) => filters.bedrooms.includes(b))) return false;
    if (!matchesHandover(p, filters.handover)) return false;

    if (search) {
      const haystack = [p.title.ar, p.title.en, p.area.ar, p.area.en, p.developer.ar, p.developer.en].join(" ").toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}
