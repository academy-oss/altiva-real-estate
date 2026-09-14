/**
 * Browser-safe lead submission layer.
 *
 * On static hosting, submissions use an official Zoho Web-to-Lead form. Its
 * public form keys are safe to embed, while Zoho OAuth credentials remain in
 * encrypted deployment secrets and are never sent to the browser.
 */
import type { AssistantLead, ConsultationLead, ContactMessage, GuideLead, ServiceRequestLead, ServiceRequestType } from "../types/lead";

const API_BASE_URL = (import.meta.env.VITE_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
const MOCK_SUBMISSIONS = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_SUBMISSIONS === "true";
const ZOHO_WEBFORM_URL = "https://crm.zoho.com/crm/WebToLeadForm";
const ZOHO_WEBFORM_KEYS = {
  xnQsjsdp: "0dde59618e2cf0833ee701be3ba9a888eaff96079ca0ca1b423042f465dda526",
  xmIwtLD: "b9d878ac89e39cbcbbf5e65c883ecb765f9571f1876ff3aa3244d75feceba0c424152d22eb743190b126cb49a72869c9",
  actionType: "TGVhZHM=",
};
const GUIDE_WEBFORM_KEYS = {
  xnQsjsdp: "d919fddb3997cfea295aaf6cd535acbf8a80ede0840a329fe64dafec9180c61b",
  xmIwtLD: "1a12f8061063c2dde17c5318ac8d64d3e8ccc92bda6c66fee7c84abb6ca59abf969cce984495a3e55b3c7021a7a35bbc",
  actionType: "TGVhZHM=",
};
const GUIDE_PDF_URL = "https://altivaproperties.com/downloads/altiva-investor-guide-dubai-2026-ar.pdf";

async function postLead(path: string, payload: ConsultationLead | ContactMessage | AssistantLead): Promise<{ success: true }> {
  if (MOCK_SUBMISSIONS) return { success: true };

  if (API_BASE_URL) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`Lead submission failed with status ${response.status}`);
    return { success: true };
  }

  return submitToZohoWebform(payload);
}

async function submitToZohoWebform(payload: ConsultationLead | ContactMessage | AssistantLead): Promise<{ success: true }> {
  const formData = "conversationSummary" in payload
    ? assistantFormData(payload)
    : "fullName" in payload
      ? consultationFormData(payload)
      : contactFormData(payload);
  addZohoFormKeys(formData);

  const response = await fetch(ZOHO_WEBFORM_URL, {
    method: "POST",
    body: formData,
    cache: "no-cache",
  });

  if (!response.ok) throw new Error(`Zoho webform submission failed with status ${response.status}`);
  const contentType = response.headers.get("Content-Type") ?? "";
  const result: unknown = contentType.includes("application/json") ? await response.json() : await response.text();
  if (typeof result === "object" && result !== null && "actionsubmit" in result) {
    const action = String((result as { actionsubmit?: unknown }).actionsubmit ?? "");
    if (["error_msg", "captcha_error"].includes(action)) throw new Error("Zoho rejected the webform submission");
  }

  return { success: true };
}

function addZohoFormKeys(formData: FormData) {
  formData.set("xnQsjsdp", ZOHO_WEBFORM_KEYS.xnQsjsdp);
  formData.set("xmIwtLD", ZOHO_WEBFORM_KEYS.xmIwtLD);
  formData.set("actionType", ZOHO_WEBFORM_KEYS.actionType);
  formData.set("returnURL", "null");
  formData.set("zc_gad", "");
  formData.set("aG9uZXlwb3Q", "");
  formData.set("Lead Source", "Website");
  formData.set("Lead Status", "New");
  formData.set("LEADCF12", "Real Estate Lead");
}

function guideFormData(lead: GuideLead): FormData {
  const form = baseFormData(lead.fullName, "", lead.phone);
  form.set("LEADCF16", mapPurpose(lead.purpose));
  if (lead.contactRequested) form.set("LEADCF17", "WhatsApp");
  form.set("LEADCF20", `Investor Guide 2026 | Follow-up: ${lead.contactRequested ? "Yes" : "No"} | ${lead.campaign || "direct"}`.slice(0, 255));
  form.set("LEADCF58", "on");
  form.set("LEADCF59", formatZohoDate(lead.submittedAt));
  form.set("Lead Source", campaignLeadSource(lead.campaign));
  return form;
}

function campaignLeadSource(campaign?: string) {
  const value = campaign?.toLowerCase() ?? "";
  if (value.includes("instagram")) return "Instagram";
  if (value.includes("whatsapp")) return "WhatsApp";
  return "Website";
}

function submitGuideToZoho(lead: GuideLead): Promise<{ success: true }> {
  if (!lead.consentAccepted) return Promise.reject(new Error("Guide consent is required"));

  const formData = guideFormData(lead);
  formData.set("xnQsjsdp", GUIDE_WEBFORM_KEYS.xnQsjsdp);
  formData.set("xmIwtLD", GUIDE_WEBFORM_KEYS.xmIwtLD);
  formData.set("actionType", GUIDE_WEBFORM_KEYS.actionType);
  formData.set("returnURL", GUIDE_PDF_URL);
  formData.set("zc_gad", "");
  formData.set("aG9uZXlwb3Q", "");
  formData.set("Lead Status", "New");

  return new Promise((resolve, reject) => {
    const frameName = `altiva-guide-${Date.now()}`;
    const frame = document.createElement("iframe");
    frame.name = frameName;
    frame.title = "ALTIVA guide request";
    frame.hidden = true;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = ZOHO_WEBFORM_URL;
    form.target = frameName;
    form.acceptCharset = "UTF-8";
    form.hidden = true;

    for (const [name, value] of formData.entries()) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = String(value);
      form.appendChild(input);
    }

    let settled = false;
    let frameLoaded = false;
    const finish = (result: "success" | "error", error?: unknown) => {
      if (settled) return;
      settled = true;
      window.setTimeout(() => {
        form.remove();
        frame.remove();
      }, 1000);
      if (result === "success") resolve({ success: true });
      else reject(error instanceof Error ? error : new Error("Guide submission failed"));
    };
    const fallback = window.setTimeout(() => finish("error", new Error("Guide submission timed out")), 8000);

    frame.addEventListener("load", () => {
      if (!frameLoaded) {
        frameLoaded = true;
        try {
          form.submit();
        } catch (error) {
          window.clearTimeout(fallback);
          finish("error", error);
        }
        return;
      }

      window.clearTimeout(fallback);
      finish("success");
    });

    document.body.append(frame, form);
    frame.src = "about:blank";
  });
}

function consultationFormData(lead: ConsultationLead): FormData {
  const form = baseFormData(lead.fullName, lead.email, lead.phone);
  form.set("LEADCF1", mapCountry(lead.countryOfResidence));
  form.set("LEADCF2", pageLanguage());
  form.set("LEADCF3", lead.projectSlug || mapEmirate(lead.emirateOfInterest));
  form.set("LEADCF6", mapBudget(lead.budget));
  form.set("LEADCF8", mapTimeline(lead.purchaseTimeline));
  form.set("LEADCF9", mapPropertyType(lead.propertyType));
  form.set("LEADCF14", mapEmirate(lead.emirateOfInterest));
  form.set("LEADCF15", lead.bedrooms === "studio" ? "Studio" : lead.bedrooms);
  form.set("LEADCF16", mapPurpose(lead.purpose));
  form.set("LEADCF17", mapContactMethod(lead.preferredContactMethod));
  form.set("LEADCF18", lead.projectSlug || "");
  form.set("LEADCF19", "Consultation");
  form.set("LEADCF58", "on");
  form.set("LEADCF59", formatZohoDate(lead.submittedAt));
  if (lead.message) form.set("Description", lead.message);
  return form;
}

function contactFormData(message: ContactMessage): FormData {
  const form = baseFormData(message.name, message.email, message.phone ?? "");
  form.set("LEADCF2", pageLanguage());
  form.set("LEADCF19", "Contact");
  form.set("LEADCF20", message.subject);
  form.set("LEADCF58", "on");
  form.set("LEADCF59", formatZohoDate(message.submittedAt));
  form.set("Description", `${message.subject}\n\n${message.message}`);
  return form;
}

function assistantFormData(lead: AssistantLead): FormData {
  const form = baseFormData(lead.fullName, lead.email ?? "", lead.phone);
  form.set("LEADCF2", lead.language === "ar" ? "Arabic" : "English");
  form.set("LEADCF17", "WhatsApp");
  form.set("LEADCF19", "Consultation");
  form.set("LEADCF20", "ALTIVA AI Assistant");
  form.set("LEADCF58", "on");
  form.set("LEADCF59", formatZohoDate(lead.submittedAt));
  if (lead.budget) form.set("LEADCF6", mapBudget(lead.budget));
  if (lead.emirateOfInterest) form.set("LEADCF14", mapEmirate(lead.emirateOfInterest));
  if (lead.propertyType) form.set("LEADCF9", mapPropertyType(lead.propertyType));
  if (lead.projectSlug) {
    form.set("LEADCF3", lead.projectSlug);
    form.set("LEADCF18", lead.projectSlug);
  }
  form.set("Description", `[ALTIVA AI Assistant]\n\n${lead.conversationSummary}`);
  return form;
}

function baseFormData(fullName: string, email: string, phone: string): FormData {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts.length > 1 ? parts.shift() ?? "" : "";
  const lastName = parts.join(" ") || fullName.trim();
  const form = new FormData();
  form.set("First Name", firstName);
  form.set("Last Name", lastName);
  form.set("Email", email);
  form.set("Mobile", phone);
  return form;
}

function pageLanguage() {
  return document.documentElement.lang === "ar" ? "Arabic" : "English";
}

function formatZohoDate(value?: string) {
  const date = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function mapCountry(value: string) {
  return ({
    kuwait: "Kuwait", uae: "Untied Arab Emirates", saudi_arabia: "Saudia Arabia", qatar: "Qatar",
    bahrain: "Bahrain", oman: "Oman", other: "Other",
  } as Record<string, string>)[value] ?? "Other";
}

function mapEmirate(value: string) {
  return ({
    dubai: "Dubai", abu_dhabi: "Abu Dhabi", sharjah: "Sharjah", ajman: "Ajman",
    umm_al_quwain: "Umm Al Quwain", ras_al_khaimah: "Ras Al Khaimah", fujairah: "Fujairah",
  } as Record<string, string>)[value] ?? "Any Emirate";
}

function mapPropertyType(value: string) {
  return ({
    apartment: "Apartment", villa: "Villa", townhouse: "Townhouse", hotel_apartment: "Hotel Apartment",
    holiday_home: "Hotel Apartment", residential_land: "Land", commercial_land: "Land",
    office: "Commercial", shop: "Commercial", warehouse: "Commercial", commercial_building: "Commercial",
  } as Record<string, string>)[value] ?? "Other";
}

function mapBudget(value: string) {
  return ({
    under_500k: "Under AED 1M", "500k_750k": "Under AED 1M", "750k_1m": "Under AED 1M",
    "1m_1_5m": "AED 1M-2M", "1_5m_2m": "AED 1M-2M", "2m_3m": "AED 2M-5M",
    "3m_5m": "AED 2M-5M", "5m_10m": "AED 5M-10M", over_10m: "AED 10M+",
  } as Record<string, string>)[value] ?? "Not Disclosed";
}

function mapPurpose(value: string) {
  return ({ investment: "Investment", residence: "Residence", holiday_home: "Holiday Home", golden_visa: "Golden Visa", undecided: "Undecided" } as Record<string, string>)[value] ?? "Undecided";
}

function mapTimeline(value: string) {
  return ({ immediate: "Immediate", "3_months": "1-3 Months", "6_months": "3-6 Months", exploring: "Exploring" } as Record<string, string>)[value] ?? "Exploring";
}

function mapContactMethod(value: string) {
  return ({ phone: "Phone", whatsapp: "WhatsApp", email: "Email" } as Record<string, string>)[value] ?? "WhatsApp";
}

function mapServiceRequest(value: ServiceRequestType) {
  return ({
    buy_property: "Buy a Property",
    sell_property: "Sell or Market a Property",
    property_management: "Property Management",
    property_valuation: "Property Valuation",
    construction_support: "Construction / Contractor or Consultant",
    other_service: "Other Real Estate Service",
  } as Record<ServiceRequestType, string>)[value];
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

export async function submitAssistantLead(lead: AssistantLead): Promise<{ success: true }> {
  return postLead("/leads/assistant", {
    ...lead,
    submittedAt: new Date().toISOString(),
    source: "ai_assistant",
  });
}

export async function submitGuideLead(lead: Omit<GuideLead, "submittedAt">): Promise<{ success: true }> {
  return submitGuideToZoho({
    ...lead,
    submittedAt: new Date().toISOString(),
  });
}

export async function submitServiceRequestLead(lead: ServiceRequestLead): Promise<{ success: true }> {
  if (MOCK_SUBMISSIONS) return { success: true };

  const form = baseFormData(lead.fullName, lead.email ?? "", lead.phone);
  addZohoFormKeys(form);
  form.set("LEADCF2", pageLanguage());
  form.set("LEADCF3", lead.propertyLocation || mapEmirate(lead.emirateOfInterest));
  form.set("LEADCF14", mapEmirate(lead.emirateOfInterest));
  form.set("LEADCF17", mapContactMethod(lead.preferredContactMethod));
  form.set("LEADCF19", "Consultation");
  form.set("LEADCF20", "ALTIVA Website - Services");
  form.set("LEADCF21", mapServiceRequest(lead.serviceType));
  form.set("LEADCF58", "on");
  form.set("LEADCF59", formatZohoDate(lead.submittedAt));
  if (lead.propertyType) form.set("LEADCF9", mapPropertyType(lead.propertyType));
  if (lead.budget) form.set("LEADCF6", mapBudget(lead.budget));

  const description = [
    "[ALTIVA Website - Services]",
    `Service: ${mapServiceRequest(lead.serviceType)}`,
    lead.propertyLocation ? `Property location: ${lead.propertyLocation}` : "",
    lead.message ? `Details: ${lead.message}` : "",
  ].filter(Boolean).join("\n");
  form.set("Description", description);
  lead.attachments?.forEach((file) => form.append("theFile", file));

  const response = await fetch(ZOHO_WEBFORM_URL, { method: "POST", body: form, cache: "no-cache" });
  if (!response.ok) throw new Error(`Zoho service request failed with status ${response.status}`);
  const contentType = response.headers.get("Content-Type") ?? "";
  const result: unknown = contentType.includes("application/json") ? await response.json() : await response.text();
  if (typeof result === "object" && result !== null && "actionsubmit" in result) {
    const action = String((result as { actionsubmit?: unknown }).actionsubmit ?? "");
    if (["error_msg", "captcha_error"].includes(action)) throw new Error("Zoho rejected the service request");
  }
  return { success: true };
}
