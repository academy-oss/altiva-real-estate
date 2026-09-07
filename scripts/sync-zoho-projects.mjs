import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const accountsUrl = process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.com";
const apiDomain = process.env.ZOHO_API_DOMAIN || "https://www.zohoapis.com";
const moduleName = process.env.ZOHO_PROJECTS_MODULE || "Real_Estate_Projects";
const outputPath = resolve(process.env.ZOHO_PROJECTS_OUTPUT || "public/data/projects.json");
const publicBasePath = normalizeBasePath(process.env.ZOHO_PUBLIC_BASE_PATH || "/altiva-real-estate/");
const mediaRoot = resolve(process.env.ZOHO_MEDIA_OUTPUT || "public/data/zoho-media");

const fields = [
  "id", "Name", "Project_Name_Arabic", "Website_Slug", "Description_Arabic", "Description_English",
  "Short_Desc_Arabic", "Short_Desc_English", "Emirate", "Area_Arabic", "Area_English", "Developer",
  "Website_Property_Type", "Starting_Price", "Maximum_Price", "Price_Currency", "Price_Is_Estimated",
  "Bedrooms_Available", "Area_From_Sqft", "Area_To_Sqft", "Payment_Plan_Arabic", "Payment_Plan_English",
  "Expected_Handover_Date", "Handover_Label_Arabic", "Handover_Label_English", "Cover_Image_URL",
  "Gallery_Image_URLs", "Website_Images", "Brochure_Arabic_URL", "Brochure_English_URL", "Website_Brochures",
  "Project_Status", "Construction_Status",
  "Publish_on_Website", "Featured_on_Website", "Created_Time", "Modified_Time"
];

let accessToken = process.env.ZOHO_ACCESS_TOKEN;
if (!accessToken) {
  const requiredEnvironmentVariables = ["ZOHO_CLIENT_ID", "ZOHO_CLIENT_SECRET", "ZOHO_REFRESH_TOKEN"];
  for (const name of requiredEnvironmentVariables) {
    if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`);
  }

  const tokenResponse = await fetch(`${accountsUrl}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.ZOHO_CLIENT_ID,
      client_secret: process.env.ZOHO_CLIENT_SECRET,
      refresh_token: process.env.ZOHO_REFRESH_TOKEN,
    }),
  });

  if (!tokenResponse.ok) throw new Error(`Zoho token refresh failed: ${tokenResponse.status}`);
  const tokenPayload = await tokenResponse.json();
  if (!tokenPayload.access_token) throw new Error(`Zoho token refresh failed: ${JSON.stringify(tokenPayload)}`);
  accessToken = tokenPayload.access_token;
}

const records = [];
for (let page = 1; ; page += 1) {
  const url = new URL(`${apiDomain}/crm/v8/${moduleName}`);
  url.searchParams.set("fields", fields.join(","));
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", "200");
  url.searchParams.set("sort_by", "Modified_Time");
  url.searchParams.set("sort_order", "desc");

  const response = await fetch(url, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
  });
  if (response.status === 204) break;
  if (!response.ok) throw new Error(`Zoho project fetch failed: ${response.status}`);

  const payload = await response.json();
  records.push(...(payload.data || []));
  if (!payload.info?.more_records) break;
}

const projects = [];
for (const record of records.filter((item) => item.Publish_on_Website === true)) {
  const project = await mapZohoProject(record);
  if (project) projects.push(project);
}
projects.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.updatedAt.localeCompare(a.updatedAt));

if (projects.length === 0) throw new Error("Zoho returned no publishable projects; the existing website data was kept unchanged.");

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(projects, null, 2)}\n`, "utf8");
console.log(`Synced ${projects.length} published project(s) from Zoho CRM.`);

async function mapZohoProject(record) {
  const hasUploadedImages = Array.isArray(record.Website_Images) && record.Website_Images.length > 0;
  if (!record.id || !record.Name || !record.Project_Name_Arabic || !record.Website_Slug || !record.Starting_Price || (!record.Cover_Image_URL && !hasUploadedImages)) {
    console.warn(`Skipping incomplete Zoho project record ${record.id || "unknown"}.`);
    return null;
  }

  const title = { ar: record.Project_Name_Arabic, en: record.Name };
  const uploadedImages = await downloadFieldFiles(record, "Website_Images", "images");
  const uploadedBrochures = await downloadFieldFiles(record, "Website_Brochures", "brochures");
  const fallbackGalleryUrls = parseGalleryUrls(record.Gallery_Image_URLs);
  if (record.Cover_Image_URL && !fallbackGalleryUrls.includes(record.Cover_Image_URL)) fallbackGalleryUrls.unshift(record.Cover_Image_URL);
  const galleryUrls = uploadedImages.length > 0 ? uploadedImages.map((file) => file.url) : fallbackGalleryUrls;
  const coverImageUrl = galleryUrls[0] || record.Cover_Image_URL;
  const brochureAr = findBrochure(uploadedBrochures, "ar")?.url || record.Brochure_Arabic_URL;
  const brochureEn = findBrochure(uploadedBrochures, "en")?.url || record.Brochure_English_URL;

  return {
    id: record.id,
    zohoRecordId: record.id,
    slug: record.Website_Slug,
    title,
    description: { ar: record.Description_Arabic || "", en: record.Description_English || "" },
    shortDescription: { ar: record.Short_Desc_Arabic || "", en: record.Short_Desc_English || "" },
    emirate: mapEmirate(record.Emirate),
    area: { ar: record.Area_Arabic || "", en: record.Area_English || "" },
    developer: { ar: record.Developer?.name || "", en: record.Developer?.name || "" },
    propertyType: mapPropertyType(record.Website_Property_Type),
    priceFrom: Number(record.Starting_Price),
    ...(record.Maximum_Price ? { priceTo: Number(record.Maximum_Price) } : {}),
    currency: "AED",
    isPriceEstimated: Boolean(record.Price_Is_Estimated),
    bedrooms: (record.Bedrooms_Available || []).map((value) => value === "Studio" ? "studio" : value),
    ...(record.Area_From_Sqft ? { areaSqftFrom: Number(record.Area_From_Sqft) } : {}),
    ...(record.Area_To_Sqft ? { areaSqftTo: Number(record.Area_To_Sqft) } : {}),
    paymentPlan: { ar: record.Payment_Plan_Arabic || "", en: record.Payment_Plan_English || "" },
    ...(record.Expected_Handover_Date ? { handoverDate: record.Expected_Handover_Date } : {}),
    handoverLabel: { ar: record.Handover_Label_Arabic || "", en: record.Handover_Label_English || "" },
    coverImage: { id: `${record.id}-cover`, url: coverImageUrl, alt: title },
    gallery: galleryUrls.map((url, index) => ({ id: `${record.id}-g${index + 1}`, url, alt: title })),
    ...(brochureAr ? { brochureAr } : {}),
    ...(brochureEn ? { brochureEn } : {}),
    status: mapStatus(record.Project_Status, record.Construction_Status),
    publishOnWebsite: true,
    isFeatured: Boolean(record.Featured_on_Website),
    createdAt: toIsoDate(record.Created_Time),
    updatedAt: toIsoDate(record.Modified_Time),
  };
}

async function downloadFieldFiles(record, fieldName, folderName) {
  const items = Array.isArray(record[fieldName]) ? record[fieldName] : [];
  if (items.length === 0) return [];

  const slug = safeSegment(record.Website_Slug || record.id);
  const targetDir = resolve(mediaRoot, slug, folderName);
  await mkdir(targetDir, { recursive: true });
  const files = [];

  for (const [index, item] of items.entries()) {
    const attachmentId = item?.id || item?.File_Id__s;
    if (!attachmentId) continue;

    const url = new URL(`${apiDomain}/crm/v8/${moduleName}/${record.id}/actions/download_fields_attachment`);
    url.searchParams.set("fields_attachment_id", String(attachmentId));
    const response = await fetch(url, {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
    });
    if (!response.ok) {
      console.warn(`Could not download ${fieldName} attachment ${attachmentId} for ${record.id}: ${response.status}`);
      continue;
    }

    const originalName = item.File_Name__s || filenameFromDisposition(response.headers.get("content-disposition"));
    const filename = `${String(index + 1).padStart(2, "0")}-${safeFilename(originalName || `${folderName}-${index + 1}`)}`;
    await writeFile(resolve(targetDir, filename), Buffer.from(await response.arrayBuffer()));
    files.push({
      name: originalName || filename,
      url: `${publicBasePath}data/zoho-media/${slug}/${folderName}/${filename}`,
    });
  }

  return files;
}

function findBrochure(files, language) {
  const arPattern = /(^|[-_\s])(ar|arabic)([-_.\s]|$)|[\u0600-\u06ff]/i;
  const enPattern = /(^|[-_\s])(en|english)([-_.\s]|$)/i;
  if (language === "ar") return files.find((file) => arPattern.test(file.name));
  return files.find((file) => enPattern.test(file.name)) || (files.length === 1 && !arPattern.test(files[0].name) ? files[0] : undefined);
}

function normalizeBasePath(value) {
  return `/${String(value).replace(/^\/+|\/+$/g, "")}/`.replace(/^\/\/$/, "/");
}

function safeSegment(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "project";
}

function safeFilename(value) {
  return String(value).replace(/[/\\]/g, "-").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "file";
}

function filenameFromDisposition(value) {
  const match = String(value || "").match(/filename\*?=(?:UTF-8''|\")?([^\";]+)/i);
  return match ? decodeURIComponent(match[1].replace(/\"$/, "")) : "";
}

function parseGalleryUrls(value) {
  if (!value) return [];
  const trimmed = String(value).trim();
  if (trimmed.startsWith("[")) {
    try { return JSON.parse(trimmed).filter(Boolean); } catch { /* fall through */ }
  }
  return trimmed.split(/[\n,]+/).map((url) => url.trim()).filter(Boolean);
}

function mapEmirate(value) {
  return ({
    Dubai: "dubai", "Abu Dhabi": "abu_dhabi", Sharjah: "sharjah", Ajman: "ajman",
    "Umm Al Quwain": "umm_al_quwain", "Ras Al Khaimah": "ras_al_khaimah", Fujairah: "fujairah",
  })[value] || "dubai";
}

function mapPropertyType(value) {
  return ({
    Apartment: "apartment", Villa: "villa", Townhouse: "townhouse", Penthouse: "penthouse", Duplex: "duplex",
    "Hotel Apartment": "hotel_apartment", "Holiday Home": "holiday_home", "Residential Land": "residential_land",
    "Residential Building": "residential_building", Office: "office", Shop: "shop", Warehouse: "warehouse",
    "Commercial Building": "commercial_building", "Commercial Land": "commercial_land",
  })[value] || "apartment";
}

function mapStatus(projectStatus, constructionStatus) {
  if (projectStatus === "Upcoming") return "coming_soon";
  if (projectStatus === "Sold Out") return "sold_out";
  if (projectStatus === "Completed" || constructionStatus === "Completed") return "ready";
  return "off_plan";
}

function toIsoDate(value) {
  return value ? new Date(value).toISOString() : new Date(0).toISOString();
}
