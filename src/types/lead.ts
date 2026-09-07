/**
 * Lead data model
 * ----------------------------------------------------------------------
 * Represents a consultation / contact request submitted through the
 * website. Field names map onto ALTIVA's Zoho CRM Leads module through the
 * official Web-to-Lead form configured in src/services/leadsService.ts.
 */

export type PurchasePurpose = "investment" | "residence" | "holiday_home" | "golden_visa" | "undecided";
export type PurchaseTimeline = "immediate" | "3_months" | "6_months" | "exploring";
export type PreferredContactMethod = "phone" | "whatsapp" | "email";

export interface ConsultationLead {
  fullName: string;
  phone: string;
  email: string;
  countryOfResidence: string;
  emirateOfInterest: string;
  propertyType: string;
  budget: string;
  purpose: PurchasePurpose;
  purchaseTimeline: PurchaseTimeline;
  bedrooms: string;
  preferredContactMethod: PreferredContactMethod;
  message?: string;
  consentAccepted: boolean;
  /** Populated automatically at submission time. */
  submittedAt?: string;
  /** Where the lead originated, useful once synced to Zoho as Lead Source. */
  source?: string;
  /** Project slug used by the server to populate the Zoho Project lookup. */
  projectSlug?: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  consentAccepted: boolean;
  submittedAt?: string;
}
