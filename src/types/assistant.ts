import type { Project } from "./project";

export type AssistantLanguage = "ar" | "en";

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantAnswer {
  reply: string;
  projectSlugs: string[];
  source: "ai" | "local";
}

export interface AssistantRequest {
  message: string;
  language: AssistantLanguage;
  history: AssistantMessage[];
}

export interface AssistantContext {
  projects: Project[];
}
