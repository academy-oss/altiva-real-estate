import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const STATIC_ROUTES = ["projects", "services", "about", "contact", "consultation", "privacy", "guide/dubai-investor-2026"];
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
  const routeHtml = route === "guide/dubai-investor-2026"
    ? rootHtml
        .replace("ALTIVA Real Estate | ألتيفا العقارية", "دليل المستثمر العقاري في دبي 2026 | ALTIVA")
        .replace("ALTIVA Real Estate — استثمر في دبي من الكويت بكل سهولة. فرص عقارية مختارة في جميع إمارات الإمارات العربية المتحدة.", "دليل عربي مجاني من ALTIVA يساعد المستثمر الخليجي على مقارنة الفرص وفهم العائد والرسوم قبل شراء عقار في دبي.")
        .replaceAll("https://altivaproperties.com/\"", "https://altivaproperties.com/guide/dubai-investor-2026/\"")
        .replace("ألتيفا العقارية | فرص وخدمات عقارية في الإمارات", "دليل المستثمر العقاري في دبي 2026 | ALTIVA")
        .replace("فرص عقارية مختارة وخدمات شراء وبيع وإدارة وتثمين العقارات في الإمارات للمستثمرين من الكويت ودول الخليج.", "دليل عملي مجاني لاختيار الهدف، مقارنة الجاهز وتحت الإنشاء، تقدير العائد الصافي وتقييم المطور قبل الشراء.")
        .replaceAll("https://altivaproperties.com/projects/ventana-residences/cover.jpg", "https://altivaproperties.com/altiva-investor-guide-cover.png")
        .replace("ألتيفا العقارية | فرص وخدمات عقارية في الإمارات", "دليل المستثمر العقاري في دبي 2026 | ALTIVA")
        .replace("فرص عقارية مختارة وخدمات عقارية متكاملة في الإمارات للمستثمرين من الكويت ودول الخليج.", "دليل عربي مجاني من ALTIVA يساعدك على طرح الأسئلة الصحيحة وفهم أرقام الاستثمار العقاري في دبي.")
    : rootHtml;
  await writeFile(join(routeDirectory, "index.html"), routeHtml);
}

await writeFile(join(distDirectory, "404.html"), rootHtml);
console.log(`Generated ${STATIC_ROUTES.length + projectRoutes.length} indexable route shells.`);
