/**
 * Project data model
 * ----------------------------------------------------------------------
 * This shape is designed to be a 1:1 mirror of the fields that will
 * eventually live on the "Projects" module inside Zoho CRM. Keeping the
 * frontend type aligned with the future Zoho field list means that once
 * a real Zoho integration is wired up (see src/services/projectsService.ts),
 * no UI or component code needs to change — only the data-fetching layer.
 *
 * NOTE: No real Zoho connection, API keys, or credentials exist in this
 * project. This is purely the data contract + mock data so the rest of
 * the app can be built against a realistic shape.
 */

export type LocalizedText = {
  ar: string;
  en: string;
};

export const EMIRATES = [
  "dubai",
  "abu_dhabi",
  "sharjah",
  "ajman",
  "umm_al_quwain",
  "ras_al_khaimah",
  "fujairah",
] as const;
export type Emirate = (typeof EMIRATES)[number];

export const PROPERTY_TYPES = [
  "apartment",
  "villa",
  "townhouse",
  "penthouse",
  "duplex",
  "hotel_apartment",
  "holiday_home",
  "residential_land",
  "residential_building",
  "office",
  "shop",
  "warehouse",
  "commercial_building",
  "commercial_land",
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROJECT_STATUSES = [
  "coming_soon",
  "off_plan",
  "ready",
  "sold_out",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PRICE_RANGES = [
  { id: "under_500k", min: 0, max: 500_000 },
  { id: "500k_750k", min: 500_000, max: 750_000 },
  { id: "750k_1m", min: 750_000, max: 1_000_000 },
  { id: "1m_1_5m", min: 1_000_000, max: 1_500_000 },
  { id: "1_5m_2m", min: 1_500_000, max: 2_000_000 },
  { id: "2m_3m", min: 2_000_000, max: 3_000_000 },
  { id: "3m_5m", min: 3_000_000, max: 5_000_000 },
  { id: "5m_10m", min: 5_000_000, max: 10_000_000 },
  { id: "over_10m", min: 10_000_000, max: Number.POSITIVE_INFINITY },
] as const;
export type PriceRangeId = (typeof PRICE_RANGES)[number]["id"];

export const BEDROOM_OPTIONS = ["studio", "1", "2", "3", "4", "5+"] as const;
export type BedroomOption = (typeof BEDROOM_OPTIONS)[number];

/** A single uploaded media asset (image / brochure PDF). */
export interface MediaAsset {
  id: string;
  url: string;
  /** Optional alt text, localized. */
  alt?: LocalizedText;
}

/**
 * Core Project record.
 *
 * Field names are written to map cleanly onto Zoho CRM field API names
 * (see the `zoho*` prefixed fields, and the comment above each group).
 */
export interface Project {
  /** Local UUID used purely for React keys / routing before Zoho sync. */
  id: string;

  /** Zoho CRM record id — the CRM is the source of truth once connected. */
  zohoRecordId: string | null;

  /** URL-friendly identifier used for the project details route. */
  slug: string;

  /** Name / description — bilingual (Zoho fields: Name_AR, Name_EN, ...). */
  title: LocalizedText;
  description: LocalizedText;
  shortDescription?: LocalizedText;

  /** Location fields (Zoho: Emirate, Area, Developer). */
  emirate: Emirate;
  area: LocalizedText;
  developer: LocalizedText;

  /** Classification (Zoho: Property_Type). */
  propertyType: PropertyType;

  /** Pricing (Zoho: Price_From, Price_To, Currency, Is_Estimated). */
  priceFrom: number;
  priceTo?: number;
  currency: "AED";
  isPriceEstimated?: boolean;

  /** Unit details (Zoho: Bedrooms_From, Bedrooms_To, Area_From_Sqft, Area_To_Sqft). */
  bedrooms: BedroomOption[];
  areaSqftFrom?: number;
  areaSqftTo?: number;

  /** Payment plan & delivery (Zoho: Payment_Plan, Handover_Date). */
  paymentPlan?: LocalizedText;
  handoverDate?: string; // ISO date string, e.g. "2027-06-30"
  handoverLabel?: LocalizedText; // e.g. "Q2 2027" for display when exact date is unknown

  /** Media (Zoho: Cover_Image, Gallery, Brochure_AR, Brochure_EN). */
  coverImage: MediaAsset;
  gallery: MediaAsset[];
  brochureAr?: string;
  brochureEn?: string;

  /** Status + publishing controls (Zoho: Project_Status, Publish_On_Website). */
  status: ProjectStatus;
  publishOnWebsite: boolean;
  isFeatured?: boolean;

  /** Sync metadata. */
  createdAt: string;
  updatedAt: string;
}

/** Utility: does a project fall within a given price range id. */
export function projectMatchesPriceRange(project: Project, rangeId: PriceRangeId): boolean {
  const range = PRICE_RANGES.find((r) => r.id === rangeId);
  if (!range) return true;
  return project.priceFrom >= range.min && project.priceFrom < range.max;
}
