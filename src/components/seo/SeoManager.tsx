import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import type { Project } from "../../types/project";
import { fetchProjectBySlug } from "../../services/projectsService";
import { localized } from "../../lib/format";

const SITE = "https://altivaproperties.com";
const DEFAULT_IMAGE = `${SITE}/projects/ventana-residences/cover.jpg`;
type Copy = { title: string; description: string };

const PAGES: Record<string, { ar: Copy; en: Copy }> = {
  "/": {
    ar: { title: "ألتيفا العقارية | فرص وخدمات عقارية في الإمارات", description: "فرص عقارية مختارة وخدمات شراء وبيع وإدارة وتثمين العقارات في الإمارات للمستثمرين من الكويت ودول الخليج." },
    en: { title: "ALTIVA Real Estate | UAE Property Opportunities & Services", description: "Selected UAE property opportunities and end-to-end buying, selling, management and valuation services for investors from Kuwait and the GCC." },
  },
  "/projects": {
    ar: { title: "المشاريع العقارية في الإمارات | ألتيفا العقارية", description: "استكشف مشاريع عقارية مختارة في دبي وأبوظبي والشارقة وعجمان ورأس الخيمة وبقية إمارات الدولة." },
    en: { title: "UAE Real Estate Projects | ALTIVA Real Estate", description: "Explore selected real estate projects across Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah and the other UAE emirates." },
  },
  "/services": {
    ar: { title: "خدمات عقارية متكاملة في الإمارات | ألتيفا", description: "شراء وبيع وإدارة وتثمين العقارات، مع توفير المقاولين والاستشاريين وخدمات عقارية متكاملة في الإمارات." },
    en: { title: "Integrated UAE Real Estate Services | ALTIVA", description: "Property buying, selling, management and valuation, plus access to suitable contractors, consultants and tailored UAE real estate support." },
  },
  "/about": {
    ar: { title: "من نحن | ألتيفا العقارية", description: "تعرّف على ألتيفا العقارية وفريقها وخبرتها في ربط المستثمرين من الكويت ودول الخليج بالفرص العقارية في الإمارات." },
    en: { title: "About ALTIVA Real Estate", description: "Meet ALTIVA Real Estate and the team connecting investors from Kuwait and the GCC with selected property opportunities across the UAE." },
  },
  "/contact": {
    ar: { title: "تواصل معنا | ألتيفا العقارية", description: "تواصل مع فريق ألتيفا العقارية في الكويت للاستفسار عن الفرص والخدمات العقارية في الإمارات." },
    en: { title: "Contact Us | ALTIVA Real Estate", description: "Contact the ALTIVA Real Estate team in Kuwait about UAE property opportunities and real estate services." },
  },
  "/consultation": {
    ar: { title: "اطلب استشارة عقارية | ألتيفا العقارية", description: "أرسل طلب استشارتك وسيتواصل معك فريق ألتيفا لمساعدتك في اختيار الفرصة العقارية المناسبة في الإمارات." },
    en: { title: "Request a Real Estate Consultation | ALTIVA", description: "Request a consultation and let the ALTIVA team help you find a suitable UAE property opportunity." },
  },
  "/privacy": {
    ar: { title: "سياسة الخصوصية | ألتيفا العقارية", description: "سياسة الخصوصية الخاصة بموقع ألتيفا العقارية وطلبات التواصل والخدمات." },
    en: { title: "Privacy Policy | ALTIVA Real Estate", description: "ALTIVA Real Estate privacy policy for website visitors, enquiries and service requests." },
  },
};

function setMeta(selector: string, attrs: Record<string, string>) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
    document.head.appendChild(tag);
  }
  Object.entries(attrs).forEach(([key, value]) => tag!.setAttribute(key, value));
}

function setCanonical(href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement("link");
    tag.rel = "canonical";
    document.head.appendChild(tag);
  }
  tag.href = href;
}

function absoluteUrl(value?: string) {
  try {
    return value ? new URL(value, SITE).href : DEFAULT_IMAGE;
  } catch {
    return DEFAULT_IMAGE;
  }
}

function structuredData(url: string, seo: Copy, lang: "ar" | "en", project: Project | null, image: string) {
  const organization = {
    "@context": "https://schema.org",
    "@type": ["Organization", "RealEstateAgent"],
    "@id": `${SITE}/#organization`,
    name: "ALTIVA Real Estate",
    alternateName: "ألتيفا العقارية",
    url: `${SITE}/`,
    logo: `${SITE}/favicon.png`,
    image: DEFAULT_IMAGE,
    telephone: ["+965 5777 5289", "+965 2220035"],
    email: ["info@altivaproperties.com", "sales@altivaproperties.com"],
    address: { "@type": "PostalAddress", streetAddress: "Al Salhiya Complex, Gate 5, Second Floor", addressLocality: "Kuwait City", addressCountry: "KW" },
    areaServed: ["United Arab Emirates", "Kuwait"],
    sameAs: ["https://www.facebook.com/profile.php?id=61590010035394", "https://www.instagram.com/altiva_properties"],
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE}/#website`,
    url: `${SITE}/`,
    name: "ALTIVA Real Estate",
    alternateName: "ألتيفا العقارية",
    inLanguage: ["ar", "en"],
    publisher: { "@id": `${SITE}/#organization` },
  };
  const webpage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: seo.title,
    description: seo.description,
    inLanguage: lang,
    isPartOf: { "@id": `${SITE}/#website` },
    ...(project ? { primaryImageOfPage: image, dateModified: project.updatedAt } : {}),
  };
  return [organization, website, webpage];
}

export function SeoManager() {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "ar";
  const slug = pathname.match(/^\/projects\/([^/]+)\/?$/)?.[1];
  const [loaded, setLoaded] = useState<{ slug: string; project: Project | null } | null>(null);
  const project = slug && loaded?.slug === slug ? loaded.project : null;

  useEffect(() => {
    let active = true;
    if (slug) fetchProjectBySlug(decodeURIComponent(slug)).then((value) => {
      if (active) setLoaded({ slug, project: value ?? null });
    }).catch(() => {
      if (active) setLoaded({ slug, project: null });
    });
    return () => { active = false; };
  }, [slug]);

  const result = useMemo(() => {
    if (project) {
      const name = localized(project.title, lang);
      const area = localized(project.area, lang);
      return {
        copy: {
          title: lang === "ar" ? `${name} في ${area} | ألتيفا العقارية` : `${name} in ${area} | ALTIVA Real Estate`,
          description: localized(project.shortDescription ?? project.description, lang),
        },
        image: absoluteUrl(project.coverImage.url),
        noIndex: false,
      };
    }
    const page = PAGES[pathname.replace(/\/$/, "") || "/"];
    return {
      copy: page?.[lang] ?? (lang === "ar" ? { title: "الصفحة غير موجودة | ألتيفا", description: "الصفحة المطلوبة غير موجودة." } : { title: "Page Not Found | ALTIVA", description: "The requested page could not be found." }),
      image: DEFAULT_IMAGE,
      noIndex: !page,
    };
  }, [lang, pathname, project]);

  useEffect(() => {
    const path = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
    const canonical = `${SITE}${path}`;
    const { title, description } = result.copy;
    document.title = title;
    setMeta('meta[name="description"]', { name: "description", content: description });
    setMeta('meta[name="robots"]', { name: "robots", content: result.noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large" });
    setMeta('meta[property="og:title"]', { property: "og:title", content: title });
    setMeta('meta[property="og:description"]', { property: "og:description", content: description });
    setMeta('meta[property="og:type"]', { property: "og:type", content: project ? "article" : "website" });
    setMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    setMeta('meta[property="og:image"]', { property: "og:image", content: result.image });
    setMeta('meta[property="og:site_name"]', { property: "og:site_name", content: "ALTIVA Real Estate" });
    setMeta('meta[property="og:locale"]', { property: "og:locale", content: lang === "ar" ? "ar_KW" : "en_US" });
    setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: result.image });
    setCanonical(canonical);

    document.head.querySelectorAll("script[data-altiva-seo]").forEach((tag) => tag.remove());
    structuredData(canonical, result.copy, lang, project, result.image).forEach((data) => {
      const tag = document.createElement("script");
      tag.type = "application/ld+json";
      tag.dataset.altivaSeo = "true";
      tag.text = JSON.stringify(data);
      document.head.appendChild(tag);
    });
  }, [lang, pathname, project, result]);

  return null;
}
