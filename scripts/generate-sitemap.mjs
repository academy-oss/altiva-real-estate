import { readFile, writeFile } from "node:fs/promises";

const SITE_URL = "https://altivaproperties.com";
const STATIC_PATHS = ["/", "/projects/", "/services/", "/about/", "/contact/", "/consultation/", "/privacy/", "/guide/dubai-investor-2026/"];

const projects = JSON.parse(await readFile(new URL("../public/data/projects.json", import.meta.url), "utf8"));
const urls = [
  ...STATIC_PATHS.map((path) => ({ path })),
  ...projects
    .filter((project) => project.publishOnWebsite && project.slug)
    .map((project) => ({ path: `/projects/${project.slug}/`, lastmod: project.updatedAt })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ path, lastmod }) => `  <url>
    <loc>${SITE_URL}${path}</loc>${lastmod ? `
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ""}
  </url>`
  )
  .join("\n")}
</urlset>
`;

await writeFile(new URL("../public/sitemap.xml", import.meta.url), xml);
console.log(`Generated sitemap with ${urls.length} URLs.`);
