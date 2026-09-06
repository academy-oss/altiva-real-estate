/**
 * Project data-access layer.
 *
 * The UI reads project data only through this file. When the public API is
 * configured, that server securely reads published projects from Zoho and
 * returns the normalized Project shape. Without it, the reviewed local
 * project set is used for design and content approval.
 */
import type { Project } from "../types/project";
import { getPublishedProjects, getFeaturedProjects, getProjectBySlug } from "../data/mockProjects";

const API_BASE_URL = (import.meta.env.VITE_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

async function fetchFromPublicApi<T>(path: string): Promise<T | null> {
  if (!API_BASE_URL) return null;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Project request failed with status ${response.status}`);
  return response.json() as Promise<T>;
}

export async function fetchProjects(): Promise<Project[]> {
  return (await fetchFromPublicApi<Project[]>("/projects")) ?? getPublishedProjects();
}

export async function fetchFeaturedProjects(): Promise<Project[]> {
  return (await fetchFromPublicApi<Project[]>("/projects?featured=true")) ?? getFeaturedProjects();
}

export async function fetchProjectBySlug(slug: string): Promise<Project | undefined> {
  const remote = await fetchFromPublicApi<Project>(`/projects/${encodeURIComponent(slug)}`);
  return remote ?? getProjectBySlug(slug);
}

export async function fetchSimilarProjects(currentSlug: string, limit = 3): Promise<Project[]> {
  if (API_BASE_URL) {
    const remote = await fetchFromPublicApi<Project[]>(
      `/projects/${encodeURIComponent(currentSlug)}/similar?limit=${limit}`
    );
    if (remote) return remote;
  }

  const current = getProjectBySlug(currentSlug);
  const pool = getPublishedProjects().filter((p) => p.slug !== currentSlug);
  const sameType = pool.filter((p) => p.propertyType === current?.propertyType);
  const rest = pool.filter((p) => p.propertyType !== current?.propertyType);
  return [...sameType, ...rest].slice(0, limit);
}

export function getAvailableAreas(projects: Project[], emirate?: string): { ar: string; en: string }[] {
  const source = emirate ? projects.filter((p) => p.emirate === emirate) : projects;
  const seen = new Map<string, { ar: string; en: string }>();
  for (const p of source) seen.set(p.area.en, p.area);
  return Array.from(seen.values());
}

export function getAvailableDevelopers(projects: Project[]): { ar: string; en: string }[] {
  const seen = new Map<string, { ar: string; en: string }>();
  for (const p of projects) seen.set(p.developer.en, p.developer);
  return Array.from(seen.values());
}
