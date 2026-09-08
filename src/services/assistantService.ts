import type { Project } from "../types/project";
import type { AssistantAnswer, AssistantLanguage, AssistantMessage, AssistantRequest } from "../types/assistant";

const ASSISTANT_API_URL = (import.meta.env?.VITE_ASSISTANT_API_URL ?? "").trim();

export async function askAltivaAssistant(
  message: string,
  language: AssistantLanguage,
  history: AssistantMessage[],
  projects: Project[],
): Promise<AssistantAnswer> {
  if (ASSISTANT_API_URL) {
    try {
      const payload: AssistantRequest = { message, language, history: history.slice(-8) };
      const response = await fetch(ASSISTANT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Assistant request failed with status ${response.status}`);
      const data = (await response.json()) as { reply?: unknown };
      if (typeof data.reply !== "string" || !data.reply.trim()) throw new Error("Assistant returned an empty reply");
      return {
        reply: data.reply.trim(),
        projectSlugs: findMentionedProjectSlugs(data.reply, projects),
        source: "ai",
      };
    } catch {
      // The guided local answer keeps the assistant useful during a temporary API outage.
    }
  }

  return buildLocalAnswer(message, language, projects);
}

function buildLocalAnswer(message: string, language: AssistantLanguage, projects: Project[]): AssistantAnswer {
  const normalized = normalize(message);
  const directProject = projects.find((project) => matchesProjectName(normalized, project));

  if (directProject) {
    return {
      reply: projectDetails(directProject, language),
      projectSlugs: [directProject.slug],
      source: "local",
    };
  }

  if (hasAny(normalized, ["عائد", "ارباح", "ربح", "roi", "return", "yield"])) {
    return {
      reply: language === "ar"
        ? "العائد يختلف حسب المشروع والمنطقة وطريقة التأجير. أستطيع مساعدتك في مقارنة المشاريع المنشورة، لكن أي نسبة عائد هي تقديرية وليست ضمانًا أو نصيحة مالية ملزمة. اكتب ميزانيتك والإمارة أو نوع العقار الذي تفضله."
        : "Returns vary by project, area, and rental strategy. I can compare ALTIVA's published projects, but any return figure is an estimate—not a guarantee or binding financial advice. Tell me your budget and preferred emirate or property type.",
      projectSlugs: [],
      source: "local",
    };
  }

  if (hasAny(normalized, ["تواصل", "اتصل", "موظف", "مستشار", "call", "contact", "advisor", "agent"])) {
    return {
      reply: language === "ar"
        ? "بكل سرور. اضغط «طلب تواصل من مستشار» أسفل المحادثة، وبعد موافقتك ستصل بياناتك إلى فريق ALTIVA عبر Zoho."
        : "Of course. Select “Request an advisor call” below. After you consent, your details will be sent to the ALTIVA team through Zoho.",
      projectSlugs: [],
      source: "local",
    };
  }

  const emirate = detectEmirate(normalized);
  const propertyType = detectPropertyType(normalized);
  const budget = detectBudget(normalized);
  const asksForProjects = hasAny(normalized, [
    "مشروع", "مشاريع", "عقار", "عقارات", "شقه", "فيلا", "ميزاني", "درهم",
    "project", "projects", "property", "properties", "budget", "aed", "apartment", "villa",
  ]);

  if (asksForProjects || emirate || propertyType || budget) {
    const matches = rankProjects(projects, emirate, propertyType, budget).slice(0, 3);
    if (!matches.length) {
      return {
        reply: language === "ar"
          ? "لا أرى حاليًا مشروعًا منشورًا يطابق جميع هذه الشروط. اكتب لي أي شرط يمكن تغييره—الميزانية أو الإمارة أو نوع العقار—وسأبحث لك من جديد."
          : "I can't currently find a published project matching all those requirements. Tell me which condition can change—budget, emirate, or property type—and I'll search again.",
        projectSlugs: [],
        source: "local",
      };
    }
    return {
      reply: recommendationText(matches, language, Boolean(emirate || propertyType || budget)),
      projectSlugs: matches.map((project) => project.slug),
      source: "local",
    };
  }

  return {
    reply: language === "ar"
      ? "أهلاً بك. أستطيع مساعدتك في معرفة المشاريع والأسعار والمواقع، أو ترشيح فرص مناسبة حسب الميزانية والإمارة ونوع العقار. مثال: «أبحث عن شقة في دبي بميزانية مليون درهم»."
      : "Welcome. I can answer questions about projects, prices, and locations, or recommend options by budget, emirate, and property type. For example: “I'm looking for a Dubai apartment with a budget of AED 1 million.”",
    projectSlugs: [],
    source: "local",
  };
}

function projectDetails(project: Project, language: AssistantLanguage): string {
  const local = language === "ar";
  const title = project.title[language];
  const price = formatPrice(project.priceFrom, language);
  const location = `${project.area[language]}${local ? "،" : ","} ${emirateName(project.emirate, language)}`;
  const bedrooms = project.bedrooms.map((room) => room === "studio" ? (local ? "استوديو" : "Studio") : room).join(local ? "، " : ", ");
  const payment = project.paymentPlan?.[language];
  const handover = project.handoverLabel?.[language];
  if (local) {
    return [
      `${title}: ${project.shortDescription?.ar ?? project.description.ar}`,
      `الموقع: ${location}. يبدأ السعر من ${price} درهم.${bedrooms ? ` الوحدات: ${bedrooms}.` : ""}`,
      payment ? `خطة الدفع: ${payment}.` : "",
      handover ? `التسليم: ${handover}.` : "",
      "يمكنك فتح تفاصيل المشروع من الرابط أدناه. الأسعار والتوفر قابلة للتغيير ويؤكدها مستشار ALTIVA.",
    ].filter(Boolean).join("\n");
  }
  return [
    `${title}: ${project.shortDescription?.en ?? project.description.en}`,
    `Location: ${location}. Prices start from AED ${price}.${bedrooms ? ` Units: ${bedrooms}.` : ""}`,
    payment ? `Payment plan: ${payment}.` : "",
    handover ? `Handover: ${handover}.` : "",
    "Open the project details below. Prices and availability may change and should be confirmed by an ALTIVA advisor.",
  ].filter(Boolean).join("\n");
}

function recommendationText(projects: Project[], language: AssistantLanguage, filtered: boolean): string {
  const local = language === "ar";
  const lines = projects.map((project, index) => {
    const title = project.title[language];
    const area = project.area[language];
    const price = formatPrice(project.priceFrom, language);
    return local
      ? `${index + 1}. ${title} — ${area} — يبدأ من ${price} درهم`
      : `${index + 1}. ${title} — ${area} — from AED ${price}`;
  });
  const intro = local
    ? (filtered ? "هذه أقرب المشاريع المنشورة لطلبك:" : "هذه مجموعة من المشاريع المنشورة حاليًا:")
    : (filtered ? "These are the closest published projects to your request:" : "Here are some currently published projects:");
  const close = local
    ? "اضغط على أي مشروع أدناه للتفاصيل. الأسعار والتوفر قابلة للتغيير ويؤكدها مستشار ALTIVA."
    : "Select any project below for details. Prices and availability may change and should be confirmed by an ALTIVA advisor.";
  return [intro, ...lines, close].join("\n");
}

function rankProjects(projects: Project[], emirate?: string, propertyType?: string, budget?: number): Project[] {
  return projects
    .filter((project) => project.publishOnWebsite)
    .filter((project) => !emirate || project.emirate === emirate)
    .filter((project) => !propertyType || project.propertyType === propertyType)
    .filter((project) => !budget || project.priceFrom <= budget)
    .sort((a, b) => {
      const budgetDistance = budget ? Math.abs(a.priceFrom - budget) - Math.abs(b.priceFrom - budget) : 0;
      if (budgetDistance !== 0) return budgetDistance;
      return Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured));
    });
}

function detectBudget(value: string): number | undefined {
  if (!hasAny(value, ["ميزاني", "درهم", "مليون", "الف", "budget", "aed", "million", "thousand"])) return undefined;
  const digitized = value.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
  const match = digitized.match(/([\d,.]+)\s*(مليون|million|m|الف|thousand|k)?/i);
  if (!match) {
    if (digitized.includes("نصف مليون") || digitized.includes("half a million")) return 500_000;
    if (digitized.includes("مليون") || digitized.includes("million")) return 1_000_000;
    return undefined;
  }
  const number = Number(match[1].replace(/,/g, ""));
  if (!Number.isFinite(number)) return undefined;
  const unit = match[2]?.toLowerCase();
  if (["مليون", "million", "m"].includes(unit ?? "")) return number * 1_000_000;
  if (["الف", "thousand", "k"].includes(unit ?? "")) return number * 1_000;
  return number;
}

function detectEmirate(value: string): string | undefined {
  const choices: Record<string, string[]> = {
    dubai: ["دبي", "dubai"], abu_dhabi: ["ابوظبي", "abu dhabi"], sharjah: ["الشارقه", "sharjah"],
    ajman: ["عجمان", "ajman"], umm_al_quwain: ["ام القيوين", "umm al quwain"],
    ras_al_khaimah: ["راس الخيمه", "ras al khaimah", "rak"], fujairah: ["الفجيره", "fujairah"],
  };
  return Object.entries(choices).find(([, aliases]) => hasAny(value, aliases))?.[0];
}

function detectPropertyType(value: string): string | undefined {
  const choices: Record<string, string[]> = {
    apartment: ["شقه", "شقق", "apartment", "flat"], villa: ["فيلا", "فلل", "villa"],
    townhouse: ["تاون هاوس", "townhouse"], penthouse: ["بنتهاوس", "penthouse"], duplex: ["دوبلكس", "duplex"],
    hotel_apartment: ["شقه فندقيه", "hotel apartment"], residential_land: ["ارض سكنيه", "residential land"],
    office: ["مكتب", "office"], shop: ["محل", "shop"], warehouse: ["مستودع", "warehouse"],
    commercial_building: ["مبنى تجاري", "commercial building"], commercial_land: ["ارض تجاريه", "commercial land"],
  };
  return Object.entries(choices).find(([, aliases]) => hasAny(value, aliases))?.[0];
}

function emirateName(value: string, language: AssistantLanguage): string {
  const names: Record<string, { ar: string; en: string }> = {
    dubai: { ar: "دبي", en: "Dubai" }, abu_dhabi: { ar: "أبوظبي", en: "Abu Dhabi" },
    sharjah: { ar: "الشارقة", en: "Sharjah" }, ajman: { ar: "عجمان", en: "Ajman" },
    umm_al_quwain: { ar: "أم القيوين", en: "Umm Al Quwain" },
    ras_al_khaimah: { ar: "رأس الخيمة", en: "Ras Al Khaimah" }, fujairah: { ar: "الفجيرة", en: "Fujairah" },
  };
  return names[value]?.[language] ?? value;
}

function findMentionedProjectSlugs(reply: string, projects: Project[]): string[] {
  const normalized = normalize(reply);
  return projects.filter((project) =>
    normalized.includes(normalize(project.title.ar)) || normalized.includes(normalize(project.title.en)),
  ).map((project) => project.slug).slice(0, 3);
}

function matchesProjectName(message: string, project: Project): boolean {
  const fullNames = [project.title.ar, project.title.en, project.slug].map(normalize);
  if (fullNames.some((name) => message.includes(name))) return true;
  const stopWords = new Set(["برج", "مشروع", "ريزيدنس", "tower", "project", "residence", "residences"]);
  return fullNames
    .flatMap((name) => name.split(/[\s-]+/))
    .some((word) => word.length >= 3 && !stopWords.has(word) && message.includes(word));
}

function formatPrice(value: number, language: AssistantLanguage): string {
  return new Intl.NumberFormat(language === "ar" ? "ar-AE" : "en-AE", { maximumFractionDigits: 0 }).format(value);
}

function hasAny(value: string, needles: string[]): boolean {
  return needles.some((needle) => value.includes(normalize(needle)));
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/[ًٌٍَُِّْـ]/g, "").trim();
}
