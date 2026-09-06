import type { PropertyType } from "../types/project";
import { publicAsset } from "../lib/utils";

/**
 * Maps each property type to an on-brand placeholder illustration.
 * These are simple line-art SVGs (navy background, gold stroke) drawn to
 * match the ALTIVA visual identity, used only until real project photography
 * is supplied by Zoho CRM (see src/services/projectsService.ts).
 */
const PLACEHOLDER_BY_TYPE: Record<PropertyType, string> = {
  apartment: "/projects/placeholders/tower.svg",
  penthouse: "/projects/placeholders/tower.svg",
  duplex: "/projects/placeholders/tower.svg",
  hotel_apartment: "/projects/placeholders/tower.svg",
  villa: "/projects/placeholders/villa.svg",
  townhouse: "/projects/placeholders/villa.svg",
  holiday_home: "/projects/placeholders/villa.svg",
  residential_land: "/projects/placeholders/land.svg",
  residential_building: "/projects/placeholders/tower.svg",
  commercial_building: "/projects/placeholders/tower.svg",
  commercial_land: "/projects/placeholders/land.svg",
  office: "/projects/placeholders/office.svg",
  shop: "/projects/placeholders/shop.svg",
  warehouse: "/projects/placeholders/warehouse.svg",
};

export function getPlaceholderImage(propertyType: PropertyType): string {
  return publicAsset(PLACEHOLDER_BY_TYPE[propertyType] ?? "/projects/placeholders/tower.svg");
}
