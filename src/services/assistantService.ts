import type { Project } from "../types/project";
import type { AssistantAnswer, AssistantLanguage, AssistantMessage, AssistantRequest } from "../types/assistant";

const ASSISTANT_API_URL = (import.meta.env?.VITE_ASSISTANT_API_URL ?? "").trim();

export async function askAltivaAssistant(
  message: string,
  language: AssistantLanguage,
  history: AssistantMessage[],
  projects: Project[],
): Promise<AssistantAnswer> {
  const normalized = normalize(message);
  if (detectService(normalized) || asksForContact(normalized)) {
    return buildLocalAnswer(message, language, projects);
  }

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

  const service = detectService(normalized);
  if (service) {
    return {
      reply: serviceReply(service, language),
      projectSlugs: [],
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

  if (asksForContact(normalized)) {
    return {
      reply: language === "ar"
        ? "واتساب ALTIVA: +965 5777 5289، وهاتف المكتب: +965 2220035. البريد الإلكتروني: sales@altivaproperties.com أو info@altivaproperties.com. العنوان: مجمع الصالحية، بوابة 5، الطابق الثاني، الكويت. ويمكنك أيضًا الضغط على «طلب تواصل من مستشار» أسفل المحادثة."
        : "ALTIVA WhatsApp: +965 5777 5289. Office phone: +965 2220035. Email: sales@altivaproperties.com or info@altivaproperties.com. Address: Al Salhiya Complex, Gate 5, Second Floor, Kuwait. You can also select “Request an advisor call” below.",
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
      ? "أهلاً بك. أستطيع مساعدتك في مشاريع ALTIVA وخدماتها العقارية، ومنها الشراء والبيع وإدارة العقارات والتثمين وتوفير المقاولين والاستشاريين، كما أستطيع تزويدك ببيانات التواصل الرسمية. ما الذي تحتاجه؟"
      : "Welcome. I can help with ALTIVA's projects and real estate services, including buying, selling, property management, valuation, and contractor or consultant coordination. I can also provide ALTIVA's official contact details. How can I help?",
    projectSlugs: [],
    source: "local",
  };
}

type ServiceId = "all" | "buy" | "sell" | "management" | "valuation" | "contractors" | "other";

function detectService(value: string): ServiceId | undefined {
  if (hasAny(value, ["خدماتكم", "خدمات", "ماذا تقدمون", "شو تقدمون", "ما تقدمون", "what services", "services", "what do you offer"])) return "all";
  if (hasAny(value, ["شراء عقار", "اشتري عقار", "ابغي اشتري", "ابي اشتري", "buy property", "buying property", "purchase property"])) return "buy";
  if (hasAny(value, ["بيع عقار", "ابيع عقار", "تسويق عقار", "اعرض عقاري", "sell property", "selling property", "market my property"])) return "sell";
  if (hasAny(value, ["اداره عقار", "اداره العقارات", "تديرون العقار", "property management", "manage my property"])) return "management";
  if (hasAny(value, ["تثمين", "تقييم عقار", "قيمه عقار", "valuation", "property value", "value my property"])) return "valuation";
  if (hasAny(value, ["مقاول", "مقاولين", "استشاري", "استشاريين", "بناء", "contractor", "consultant", "construction"])) return "contractors";
  if (hasAny(value, ["خدمه عقاريه", "طلب عقاري", "real estate service"])) return "other";
  return undefined;
}

function asksForContact(value: string): boolean {
  return hasAny(value, [
    "تواصل", "اتصل", "موظف", "مستشار", "رقم", "هاتف", "واتساب", "ايميل", "بريد", "عنوان", "موقع المكتب", "وين مكتبكم",
    "call", "contact", "advisor", "agent", "phone", "number", "whatsapp", "email", "address", "office location",
  ]);
}

function serviceReply(service: ServiceId, language: AssistantLanguage): string {
  if (service === "all") {
    return language === "ar"
      ? "تقدم ALTIVA خدمات شراء العقارات وبيعها وتسويقها، وإدارة العقارات، وتثمين العقار، وتوفير خيارات مناسبة من المقاولين والاستشاريين للبناء والتطوير، إلى جانب تنسيق الاحتياجات العقارية الأخرى. يمكنك إرسال طلبك من صفحة «خدماتنا» أو الضغط على «طلب تواصل من مستشار»."
      : "ALTIVA offers property purchase support, property sales and marketing, property management, property valuation, suitable contractor and consultant options for construction or development, and coordination of other real estate needs. You can submit a request through the Services page or select “Request an advisor call.”";
  }
  const replies: Record<Exclude<ServiceId, "all">, { ar: string; en: string }> = {
    buy: {
      ar: "نساعدك على تحديد العقار الأنسب لهدفك وميزانيتك في مختلف إمارات الدولة، مع مقارنة الفرص والتفاوض على أفضل سعر متاح ومتابعة خطوات الشراء. التفاصيل والأسعار النهائية يؤكدها مستشار ALTIVA.",
      en: "We help identify suitable UAE properties for your goals and budget, compare opportunities, negotiate the best available price, and follow the purchase process. Final details and pricing are confirmed by an ALTIVA advisor.",
    },
    sell: {
      ar: "نتولى دراسة عقارك والسوق، وإعداد خطة تسويقه، والوصول إلى المشترين المناسبين، والتنسيق حتى إتمام البيع. أرسل تفاصيل الطلب من صفحة «خدماتنا» ليتواصل معك الفريق.",
      en: "We review your property and the market, prepare a marketing plan, reach suitable buyers, and coordinate through completion of the sale. Submit the details through the Services page and our team will contact you.",
    },
    management: {
      ar: "ننسق إدارة العقار ومتابعة احتياجات المالك بما يحافظ على جودة الأصل العقاري، مع متابعة دورية وتقارير واضحة. النطاق التفصيلي والرسوم يؤكدهما مستشار ALTIVA بعد مراجعة العقار.",
      en: "We coordinate property management and owner requirements to help maintain the asset's quality, with regular follow-up and clear reporting. Detailed scope and fees are confirmed by an ALTIVA advisor after reviewing the property.",
    },
    valuation: {
      ar: "نساعدك في الوصول إلى تقدير مهني لقيمة العقار عبر مراجعة بياناته ومقارنات السوق، لدعم قرار البيع أو الشراء أو الاستثمار. يحدد مستشار ALTIVA نطاق التثمين المطلوب بعد مراجعة التفاصيل.",
      en: "We help you obtain a professional property value estimate through property-data review and market comparisons to support a sale, purchase, or investment decision. An ALTIVA advisor will confirm the required valuation scope after reviewing the details.",
    },
    contractors: {
      ar: "نوفر خيارات مناسبة من المقاولين والاستشاريين عند التخطيط للبناء أو التطوير، بعد فهم نطاق المشروع، ثم ننسق التواصل والعروض. الاختيار النهائي والنطاق والتكلفة تخضع لمراجعة العميل والجهة المقدمة للخدمة.",
      en: "We provide suitable contractor and consultant options for construction or development after understanding the project scope, then coordinate introductions and proposals. Final selection, scope, and cost remain subject to review by the client and service provider.",
    },
    other: {
      ar: "ندرس احتياجك العقاري وننسق الطلب ونوجهك إلى الخدمة أو الجهة المناسبة مع متابعة مخصصة. اذكر نوع احتياجك أو أرسل الطلب من صفحة «خدماتنا» ليتواصل معك الفريق.",
      en: "We review your real estate requirement, coordinate the request, and direct you to a suitable service or party with dedicated follow-up. Describe what you need or submit it through the Services page for our team to contact you.",
    },
  };
  return replies[service][language];
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
