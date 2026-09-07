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
const SYNCED_PROJECTS_URL = `${import.meta.env.BASE_URL}data/projects.json`;

let syncedProjectsPromise: Promise<Project[] | null> | null = null;

async function fetchFromPublicApi<T>(path: string): Promise<T | null> {
  if (!API_BASE_URL) return null;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Project request failed with status ${response.status}`);
  return response.json() as Promise<T>;
}

async function fetchSyncedProjects(): Promise<Project[] | null> {
  if (!syncedProjectsPromise) {
    syncedProjectsPromise = fetch(SYNCED_PROJECTS_URL, {
      headers: { Accept: "application/json" },
      cache: "no-cache",
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Synced project request failed with status ${response.status}`);
        return response.json() as Promise<Project[]>;
      })
      .then((projects) => (Array.isArray(projects) && projects.length > 0 ? projects : null))
      .catch(() => null);
  }

  return syncedProjectsPromise;
}

async function fetchAllProjects(): Promise<Project[] | null> {
  if (API_BASE_URL) {
    const remote = await fetchFromPublicApi<Project[]>("/projects");
    if (remote) return remote;
  }
  return fetchSyncedProjects();
}

export async function fetchProjects(): Promise<Project[]> {
  return (await fetchAllProjects()) ?? getPublishedProjects();
}

export async function fetchFeaturedProjects(): Promise<Project[]> {
  if (API_BASE_URL) {
    const remote = await fetchFromPublicApi<Project[]>("/projects?featured=true");
    if (remote) return remote;
  }
  const synced = await fetchSyncedProjects();
  return synced?.filter((project) => project.isFeatured) ?? getFeaturedProjects();
}

export async function fetchProjectBySlug(slug: string): Promise<Project | undefined> {
  if (API_BASE_URL) {
    const remote = await fetchFromPublicApi<Project>(`/projects/${encodeURIComponent(slug)}`);
    if (remote) return remote;
  }
  const synced = await fetchSyncedProjects();
  return synced?.find((project) => project.slug === slug) ?? getProjectBySlug(slug);
}

export async function fetchSimilarProjects(currentSlug: string, limit = 3): Promise<Project[]> {
  if (API_BASE_URL) {
    const remote = await fetchFromPublicApi<Project[]>(
      `/projects/${encodeURIComponent(currentSlug)}/similar?limit=${limit}`
    );
    if (remote) return remote;
  }

  const synced = await fetchSyncedProjects();
  const projects = synced ?? getPublishedProjects();
  const current = projects.find((project) => project.slug === currentSlug);
  const pool = projects.filter((p) => p.slug !== currentSlug);
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
