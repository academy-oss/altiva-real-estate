/**
 * Browser-safe lead submission layer.
 *
 * The website only talks to our own public server endpoint. Zoho OAuth
 * credentials must stay on the server and must never be exposed through a
 * VITE_ variable or sent to the browser.
 */
import type { ConsultationLead, ContactMessage } from "../types/lead";

const API_BASE_URL = (import.meta.env.VITE_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
const MOCK_SUBMISSIONS = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_SUBMISSIONS === "true";

async function postLead(path: string, payload: ConsultationLead | ContactMessage): Promise<{ success: true }> {
  if (MOCK_SUBMISSIONS) return { success: true };

  if (!API_BASE_URL) {
    throw new Error("Lead submission endpoint is not configured");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Lead submission failed with status ${response.status}`);
  }

  return { success: true };
}

export async function submitConsultationLead(lead: ConsultationLead): Promise<{ success: true }> {
  return postLead("/leads/consultation", {
    ...lead,
    submittedAt: new Date().toISOString(),
    source: "website_consultation_form",
  });
}

export async function submitContactMessage(message: ContactMessage): Promise<{ success: true }> {
  return postLead("/leads/contact", {
    ...message,
    submittedAt: new Date().toISOString(),
  });
}
