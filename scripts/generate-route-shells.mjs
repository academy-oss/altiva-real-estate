import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const STATIC_ROUTES = ["projects", "services", "about", "contact", "consultation", "privacy"];
const PROJECT_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const distDirectory = resolve("dist");
const rootHtml = await readFile(join(distDirectory, "index.html"), "utf8");
const projects = JSON.parse(await readFile(resolve("public/data/projects.json"), "utf8"));
const projectRoutes = projects
  .filter((project) => project.publishOnWebsite && PROJECT_SLUG.test(project.slug ?? ""))
  .map((project) => join("projects", project.slug));

for (const route of [...STATIC_ROUTES, ...projectRoutes]) {
  const routeDirectory = join(distDirectory, route);
  await mkdir(routeDirectory, { recursive: true });
  await writeFile(join(routeDirectory, "index.html"), rootHtml);
}

await writeFile(join(distDirectory, "404.html"), rootHtml);
console.log(`Generated ${STATIC_ROUTES.length + projectRoutes.length} indexable route shells.`);
