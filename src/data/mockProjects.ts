/**
 * TEMPORARY SAMPLE DATA
 * ----------------------------------------------------------------------
 * This file is the ONLY place that should need to change when the real
 * Zoho CRM "Projects" module is connected. Everything here conforms to
 * the `Project` type (src/types/project.ts), which mirrors the fields
 * planned for that Zoho module.
 *
 * To swap this for live data later:
 *   1. Implement the Zoho fetch inside src/services/projectsService.ts
 *      (there is a clearly marked TODO + example there).
 *   2. Leave this file in place for local development / storybook / tests,
 *      or delete it once Zoho is the only data source.
 *
 * The four projects inherited from the reference site use their original
 * photography. Unverified sample records stay hidden from public views.
 */
import type { Project } from "../types/project";
import { getPlaceholderImage } from "./placeholderImages";
import { publicAsset } from "../lib/utils";

let counter = 0;
const VERIFIED_PROJECT_SLUGS = new Set([
  "jais-retreats",
  "ventana-residences",
  "empire-downtown-jebel-ali",
  "ayami-residence",
]);

function nextId(): string {
  counter += 1;
  return `local-${counter}`;
}

function project(p: Omit<Project, "id" | "coverImage" | "gallery" | "createdAt" | "updatedAt" | "currency" | "zohoRecordId"> & {
  zohoRecordId?: string | null;
  media?: string[];
}): Project {
  const id = nextId();
  const { media, zohoRecordId, ...fields } = p;
  const images = media?.length ? media.map(publicAsset) : [getPlaceholderImage(fields.propertyType)];
  const isVerified = VERIFIED_PROJECT_SLUGS.has(fields.slug);
  return {
    id,
    zohoRecordId: zohoRecordId ?? null,
    currency: "AED",
    coverImage: { id: `${id}-cover`, url: images[0], alt: fields.title },
    gallery: images.map((url, index) => ({ id: `${id}-g${index + 1}`, url, alt: fields.title })),
    createdAt: "2026-01-15T09:00:00.000Z",
    updatedAt: "2026-08-20T09:00:00.000Z",
    ...fields,
    publishOnWebsite: isVerified && fields.publishOnWebsite,
    isFeatured: isVerified,
  };
}

export const MOCK_PROJECTS: Project[] = [
  project({
    slug: "altiva-luxury-villas-dubai-hills",
    title: { ar: "فلل فاخرة", en: "Luxury Villas" },
    description: {
      ar: "مجموعة فلل فاخرة في قلب دبي هيلز، تجمع بين التصميم المعماري الراقي والمساحات الخضراء الواسعة، وتوفر خصوصية تامة مع إطلالات بانورامية على الملعب.",
      en: "A collection of luxury villas in the heart of Dubai Hills, blending refined architecture with expansive green spaces and complete privacy, with panoramic golf course views.",
    },
    shortDescription: { ar: "فلل راقية بإطلالات خضراء في دبي هيلز", en: "Refined villas with green views in Dubai Hills" },
    emirate: "dubai",
    area: { ar: "دبي هيلز", en: "Dubai Hills" },
    developer: { ar: "إعمار العقارية", en: "Emaar Properties" },
    propertyType: "villa",
    priceFrom: 3_500_000,
    isPriceEstimated: true,
    bedrooms: ["4", "5+"],
    areaSqftFrom: 4200,
    areaSqftTo: 6800,
    paymentPlan: { ar: "10% عند الحجز، 70% أثناء الإنشاء، 20% عند التسليم", en: "10% on booking, 70% during construction, 20% on handover" },
    handoverDate: "2027-06-30",
    handoverLabel: { ar: "الربع الثاني 2027", en: "Q2 2027" },
    status: "off_plan",
    publishOnWebsite: true,
    isFeatured: true,
  }),
  project({
    slug: "marina-heights-residential-tower",
    title: { ar: "برج سكني فاخر", en: "Luxury Residential Tower" },
    description: {
      ar: "برج سكني شاهق في دبي مارينا يضم شققًا استوديو وغرفة وغرفتين بتشطيبات فندقية ومرافق متكاملة تشمل مسبح لا نهائي وصالة رياضية مطلة على المارينا.",
      en: "A high-rise residential tower in Dubai Marina featuring studio, one, and two-bedroom apartments with hotel-style finishes and full amenities including an infinity pool and marina-view gym.",
    },
    shortDescription: { ar: "شقق فندقية بإطلالة على المارينا", en: "Hotel-style apartments overlooking the marina" },
    emirate: "dubai",
    area: { ar: "دبي مارينا", en: "Dubai Marina" },
    developer: { ar: "داماك العقارية", en: "DAMAC Properties" },
    propertyType: "apartment",
    priceFrom: 950_000,
    isPriceEstimated: true,
    bedrooms: ["studio", "1", "2"],
    areaSqftFrom: 420,
    areaSqftTo: 1350,
    paymentPlan: { ar: "20% عند الحجز، 50% أثناء الإنشاء، 30% عند التسليم", en: "20% on booking, 50% during construction, 30% on handover" },
    handoverDate: "2026-12-31",
    handoverLabel: { ar: "الربع الرابع 2026", en: "Q4 2026" },
    status: "off_plan",
    publishOnWebsite: true,
    isFeatured: true,
  }),
  project({
    slug: "jais-retreats",
    title: { ar: "جيس ريتريتس", en: "Jais Retreats" },
    description: {
      ar: "منتجع سكني هادئ عند سفح أعلى قمة جبلية في الإمارات، يوفر بيوت عطلات وشاليهات مطلة على الجبال، مثالية للاستثمار في قطاع الضيافة الجبلية الناشئ.",
      en: "A tranquil residential retreat at the foot of the UAE's highest peak, offering mountain-view holiday homes and chalets — ideal for investing in the emerging mountain hospitality sector.",
    },
    shortDescription: { ar: "بيوت عطلات جبلية في رأس الخيمة", en: "Mountain holiday homes in Ras Al Khaimah" },
    emirate: "ras_al_khaimah",
    area: { ar: "جبل جيس", en: "Jebel Jais" },
    developer: { ar: "شركة رأس الخيمة العقارية", en: "RAK Properties" },
    propertyType: "holiday_home",
    priceFrom: 1_750_000,
    bedrooms: ["2", "3"],
    areaSqftFrom: 1100,
    areaSqftTo: 2200,
    paymentPlan: { ar: "30% عند الحجز، 70% عند التسليم", en: "30% on booking, 70% on handover" },
    handoverDate: "2026-03-31",
    handoverLabel: { ar: "الربع الأول 2026", en: "Q1 2026" },
    status: "ready",
    publishOnWebsite: true,
    isFeatured: true,
    media: [
      "/projects/jais-retreats/cover.jpg",
      "/projects/jais-retreats/bedroom.jpg",
      "/projects/jais-retreats/kitchen.jpg",
    ],
  }),
  project({
    slug: "ventana-residences",
    title: { ar: "فنتانا ريزيدنس", en: "Ventana Residences" },
    description: {
      ar: "مشروع سكني عصري في وارسان 4 يوفر شققًا استوديو وغرفة نوم واحدة بأسعار تنافسية، مناسب للمستثمرين الباحثين عن عوائد إيجارية مرتفعة.",
      en: "A modern residential project in Warsan 4 offering studio and one-bedroom apartments at competitive prices, ideal for investors seeking high rental yields.",
    },
    shortDescription: { ar: "شقق بعوائد إيجارية مرتفعة في وارسان", en: "High-yield apartments in Warsan" },
    emirate: "dubai",
    area: { ar: "وارسان 4", en: "Warsan 4" },
    developer: { ar: "أوبجكت 1 للتطوير", en: "Object 1 Development" },
    propertyType: "apartment",
    priceFrom: 550_000,
    bedrooms: ["studio", "1"],
    areaSqftFrom: 380,
    areaSqftTo: 750,
    paymentPlan: { ar: "15% عند الحجز، 55% أثناء الإنشاء، 30% عند التسليم", en: "15% on booking, 55% during construction, 30% on handover" },
    handoverDate: "2026-09-30",
    handoverLabel: { ar: "الربع الثالث 2026", en: "Q3 2026" },
    status: "off_plan",
    publishOnWebsite: true,
    media: [
      "/projects/ventana-residences/cover.jpg",
      "/projects/ventana-residences/pool.jpg",
      "/projects/ventana-residences/lobby.jpg",
    ],
  }),
  project({
    slug: "empire-downtown-jebel-ali",
    title: { ar: "امباير داون تاون جبل علي", en: "Empire Downtown Jebel Ali" },
    description: {
      ar: "مشروع سكني متكامل في قلب جبل علي يوفر شققًا جاهزة للتسليم بتصميم عصري وقربًا من المناطق الصناعية والحرة الرئيسية في دبي.",
      en: "A fully integrated residential project in the heart of Jebel Ali offering ready-to-move apartments with modern design, close to Dubai's major industrial and free zones.",
    },
    shortDescription: { ar: "شقق جاهزة للتسليم في جبل علي", en: "Ready-to-move apartments in Jebel Ali" },
    emirate: "dubai",
    area: { ar: "جبل علي", en: "Jebel Ali" },
    developer: { ar: "إمباير للتطوير العقاري", en: "Empire Development" },
    propertyType: "apartment",
    priceFrom: 799_777,
    bedrooms: ["1", "2"],
    areaSqftFrom: 650,
    areaSqftTo: 1150,
    paymentPlan: { ar: "دفعة واحدة أو خطة تقسيط بعد التسليم", en: "Full payment or post-handover installment plan" },
    handoverDate: "2025-12-01",
    handoverLabel: { ar: "جاهز", en: "Ready" },
    status: "ready",
    publishOnWebsite: true,
    media: [
      "/projects/empire-downtown-jebel-ali/cover.jpg",
      "/projects/empire-downtown-jebel-ali/view-2.jpg",
      "/projects/empire-downtown-jebel-ali/view-3.jpg",
    ],
  }),
  project({
    slug: "ayami-residence",
    title: { ar: "أيامي ريزيدنس", en: "Ayami Residence" },
    description: {
      ar: "مجمع سكني في ورسان الأولى يضم شققًا بمساحات مدروسة ومرافق مشتركة عصرية، ضمن منطقة تشهد نموًا سكانيًا وتطويريًا متسارعًا.",
      en: "A residential complex in Warsan 1 with thoughtfully sized apartments and modern shared amenities, in an area experiencing rapid population and development growth.",
    },
    shortDescription: { ar: "شقق عصرية في ورسان الأولى", en: "Modern apartments in Warsan 1" },
    emirate: "dubai",
    area: { ar: "ورسان الأولى", en: "Warsan 1" },
    developer: { ar: "مجموعة تايجر", en: "Tiger Group" },
    propertyType: "apartment",
    priceFrom: 864_000,
    bedrooms: ["1", "2", "3"],
    areaSqftFrom: 700,
    areaSqftTo: 1450,
    paymentPlan: { ar: "20% عند الحجز والباقي على دفعات مرنة", en: "20% on booking, balance on flexible installments" },
    handoverDate: "2027-03-31",
    handoverLabel: { ar: "الربع الأول 2027", en: "Q1 2027" },
    status: "off_plan",
    publishOnWebsite: true,
    media: [
      "/projects/ayami-residence/cover.jpg",
      "/projects/ayami-residence/exterior.jpg",
      "/projects/ayami-residence/pool.jpg",
      "/projects/ayami-residence/lobby.jpg",
    ],
  }),
  project({
    slug: "tilal-city-townhouses",
    title: { ar: "تاون هاوس تلال سيتي", en: "Tilal City Townhouses" },
    description: {
      ar: "مجتمع سكني عائلي متكامل في الشارقة يوفر تاون هاوس بحدائق خاصة ومساحات مجتمعية واسعة، بأسعار تنافسية مقارنة بدبي.",
      en: "An integrated family residential community in Sharjah offering townhouses with private gardens and expansive community spaces, at prices competitive with Dubai.",
    },
    shortDescription: { ar: "تاون هاوس عائلي بحدائق خاصة", en: "Family townhouses with private gardens" },
    emirate: "sharjah",
    area: { ar: "تلال سيتي", en: "Tilal City" },
    developer: { ar: "شركة عارضة للتطوير العقاري", en: "Arada" },
    propertyType: "townhouse",
    priceFrom: 1_450_000,
    bedrooms: ["3", "4"],
    areaSqftFrom: 2100,
    areaSqftTo: 2900,
    paymentPlan: { ar: "5% عند الحجز، 65% أثناء الإنشاء، 30% عند التسليم", en: "5% on booking, 65% during construction, 30% on handover" },
    handoverDate: "2027-01-31",
    handoverLabel: { ar: "الربع الأول 2027", en: "Q1 2027" },
    status: "off_plan",
    publishOnWebsite: true,
  }),
  project({
    slug: "yas-bay-penthouses",
    title: { ar: "بنتهاوس ياس باي", en: "Yas Bay Penthouses" },
    description: {
      ar: "بنتهاوسات حصرية على واجهة ياس باي المائية في أبوظبي، بمساحات واسعة وتشطيبات فاخرة وإطلالات مباشرة على المارينا والمدينة الترفيهية.",
      en: "Exclusive penthouses on the Yas Bay waterfront in Abu Dhabi, with expansive layouts, luxury finishes, and direct views over the marina and entertainment district.",
    },
    shortDescription: { ar: "بنتهاوسات فاخرة على واجهة ياس باي", en: "Luxury penthouses on the Yas Bay waterfront" },
    emirate: "abu_dhabi",
    area: { ar: "ياس آيلاند", en: "Yas Island" },
    developer: { ar: "الدار العقارية", en: "Aldar Properties" },
    propertyType: "penthouse",
    priceFrom: 4_200_000,
    bedrooms: ["4", "5+"],
    areaSqftFrom: 3800,
    areaSqftTo: 5200,
    paymentPlan: { ar: "دفعة واحدة عند التسليم", en: "Full payment on handover" },
    handoverDate: "2025-10-01",
    handoverLabel: { ar: "جاهز", en: "Ready" },
    status: "ready",
    publishOnWebsite: true,
  }),
  project({
    slug: "al-zorah-duplex-villas",
    title: { ar: "فلل دوبلكس الزوراء", en: "Al Zorah Duplex Villas" },
    description: {
      ar: "فلل دوبلكس مطلة على أشجار المانجروف الطبيعية في الزوراء بعجمان، تجمع بين الهدوء الطبيعي والقرب من ملعب الغولف ونادي اليخوت.",
      en: "Duplex villas overlooking natural mangroves in Al Zorah, Ajman, combining natural tranquility with proximity to the golf course and yacht club.",
    },
    shortDescription: { ar: "دوبلكس مطل على المانجروف بعجمان", en: "Mangrove-view duplexes in Ajman" },
    emirate: "ajman",
    area: { ar: "الزوراء", en: "Al Zorah" },
    developer: { ar: "شركة تطوير الزوراء", en: "Al Zorah Development" },
    propertyType: "duplex",
    priceFrom: 2_300_000,
    isPriceEstimated: true,
    bedrooms: ["3", "4"],
    areaSqftFrom: 2600,
    areaSqftTo: 3400,
    paymentPlan: { ar: "10% عند الحجز، 60% أثناء الإنشاء، 30% عند التسليم", en: "10% on booking, 60% during construction, 30% on handover" },
    handoverDate: "2027-09-30",
    handoverLabel: { ar: "الربع الثالث 2027", en: "Q3 2027" },
    status: "off_plan",
    publishOnWebsite: true,
  }),
  project({
    slug: "uaq-marina-townhomes",
    title: { ar: "تاون هومز مارينا أم القيوين", en: "UAQ Marina Townhomes" },
    description: {
      ar: "مشروع جديد قادم على واجهة مارينا أم القيوين، يقدم فرصة استثمارية مبكرة في سوق ناشئ بأسعار دخول تنافسية.",
      en: "An upcoming project on the Umm Al Quwain marina waterfront, offering an early-stage investment opportunity in an emerging market with competitive entry prices.",
    },
    shortDescription: { ar: "فرصة مبكرة على واجهة مارينا أم القيوين", en: "Early opportunity on the UAQ marina waterfront" },
    emirate: "umm_al_quwain",
    area: { ar: "مارينا أم القيوين", en: "UAQ Marina" },
    developer: { ar: "مجموعة صوبا العقارية", en: "Sobha Realty" },
    propertyType: "townhouse",
    priceFrom: 1_100_000,
    isPriceEstimated: true,
    bedrooms: ["3"],
    areaSqftFrom: 1900,
    areaSqftTo: 2400,
    status: "coming_soon",
    publishOnWebsite: true,
  }),
  project({
    slug: "fujairah-bay-offices",
    title: { ar: "مكاتب فجيرة باي", en: "Fujairah Bay Offices" },
    description: {
      ar: "مساحات مكتبية جاهزة في منطقة فجيرة باي الحرة، مناسبة للشركات الباحثة عن حضور استراتيجي على الساحل الشرقي للدولة.",
      en: "Ready office spaces in the Fujairah Bay free zone, suited to companies seeking a strategic presence on the country's east coast.",
    },
    shortDescription: { ar: "مكاتب جاهزة في المنطقة الحرة بالفجيرة", en: "Ready offices in the Fujairah free zone" },
    emirate: "fujairah",
    area: { ar: "فجيرة باي", en: "Fujairah Bay" },
    developer: { ar: "المنطقة الحرة بالفجيرة", en: "Fujairah Free Zone Authority" },
    propertyType: "office",
    priceFrom: 650_000,
    bedrooms: [],
    areaSqftFrom: 900,
    areaSqftTo: 2000,
    status: "ready",
    publishOnWebsite: true,
  }),
  project({
    slug: "business-bay-retail-plaza",
    title: { ar: "بيزنس باي ريتيل بلازا", en: "Business Bay Retail Plaza" },
    description: {
      ar: "محلات تجارية على الواجهة المائية لقناة بيزنس باي، بحركة مشاة عالية على مدار العام ومناسبة للمطاعم والمقاهي والعلامات التجارية.",
      en: "Retail units on the Business Bay canal waterfront with high year-round foot traffic, suited to restaurants, cafés, and retail brands.",
    },
    shortDescription: { ar: "محلات تجارية على قناة بيزنس باي", en: "Retail units on the Business Bay canal" },
    emirate: "dubai",
    area: { ar: "بيزنس باي", en: "Business Bay" },
    developer: { ar: "داماك العقارية", en: "DAMAC Properties" },
    propertyType: "shop",
    priceFrom: 1_900_000,
    isPriceEstimated: true,
    bedrooms: [],
    areaSqftFrom: 600,
    areaSqftTo: 1800,
    handoverDate: "2027-02-28",
    handoverLabel: { ar: "الربع الأول 2027", en: "Q1 2027" },
    status: "off_plan",
    publishOnWebsite: true,
  }),
  project({
    slug: "al-quoz-logistics-warehouse",
    title: { ar: "مستودعات الخوض اللوجستية", en: "Al Quoz Logistics Warehouse" },
    description: {
      ar: "مستودعات جاهزة للتشغيل في منطقة الخوض الصناعية، بارتفاعات تخزين كبيرة وقرب من الطرق الرئيسية والموانئ.",
      en: "Ready-to-operate warehouses in the Al Quoz industrial area, with high storage clearances and proximity to major roads and ports.",
    },
    shortDescription: { ar: "مستودعات جاهزة في منطقة الخوض", en: "Ready warehouses in Al Quoz" },
    emirate: "dubai",
    area: { ar: "الخوض الصناعية", en: "Al Quoz Industrial" },
    developer: { ar: "دبي للاستثمارات الصناعية", en: "Dubai Industrial City" },
    propertyType: "warehouse",
    priceFrom: 3_800_000,
    isPriceEstimated: true,
    bedrooms: [],
    areaSqftFrom: 8000,
    areaSqftTo: 15000,
    status: "ready",
    publishOnWebsite: true,
  }),
  project({
    slug: "dubai-south-commercial-plot",
    title: { ar: "أرض تجارية دبي الجنوب", en: "Dubai South Commercial Plot" },
    description: {
      ar: "قطعة أرض تجارية في منطقة دبي الجنوب الاستراتيجية القريبة من مطار آل مكتوم الدولي ومعرض إكسبو، مثالية لمشاريع تطويرية كبرى.",
      en: "A commercial land plot in the strategic Dubai South area near Al Maktoum International Airport and the Expo site — ideal for major development projects.",
    },
    shortDescription: { ar: "أرض استثمارية استراتيجية بدبي الجنوب", en: "Strategic investment land in Dubai South" },
    emirate: "dubai",
    area: { ar: "دبي الجنوب", en: "Dubai South" },
    developer: { ar: "هيئة دبي الجنوب", en: "Dubai South Authority" },
    propertyType: "commercial_land",
    priceFrom: 5_500_000,
    isPriceEstimated: true,
    bedrooms: [],
    status: "off_plan",
    publishOnWebsite: true,
  }),
  project({
    slug: "jumeirah-residential-land",
    title: { ar: "أرض سكنية جميرا", en: "Jumeirah Residential Land" },
    description: {
      ar: "قطعة أرض سكنية نادرة في منطقة جميرا الأولى، مناسبة لبناء فيلا خاصة فاخرة على مقربة من الشاطئ.",
      en: "A rare residential land plot in Jumeirah 1, suited to building a luxury private villa close to the beach.",
    },
    shortDescription: { ar: "أرض نادرة قرب شاطئ جميرا", en: "Rare land plot near Jumeirah beach" },
    emirate: "dubai",
    area: { ar: "جميرا 1", en: "Jumeirah 1" },
    developer: { ar: "مالك خاص", en: "Private Owner" },
    propertyType: "residential_land",
    priceFrom: 12_000_000,
    isPriceEstimated: true,
    bedrooms: [],
    status: "ready",
    publishOnWebsite: true,
  }),
  project({
    slug: "downtown-hotel-apartments",
    title: { ar: "شقق داون تاون الفندقية", en: "Downtown Hotel Apartments" },
    description: {
      ar: "شقق فندقية مدارة بالكامل في قلب داون تاون دبي، بإطلالات على برج خليفة ونافورة دبي، ومناسبة للتأجير قصير المدى.",
      en: "Fully managed hotel apartments in the heart of Downtown Dubai, with views of Burj Khalifa and the Dubai Fountain — ideal for short-term rental.",
    },
    shortDescription: { ar: "شقق فندقية بإطلالة على برج خليفة", en: "Hotel apartments with Burj Khalifa views" },
    emirate: "dubai",
    area: { ar: "داون تاون دبي", en: "Downtown Dubai" },
    developer: { ar: "إعمار العقارية", en: "Emaar Properties" },
    propertyType: "hotel_apartment",
    priceFrom: 1_250_000,
    bedrooms: ["1", "2"],
    areaSqftFrom: 620,
    areaSqftTo: 980,
    paymentPlan: { ar: "25% عند الحجز، 75% عند التسليم", en: "25% on booking, 75% on handover" },
    handoverDate: "2026-11-30",
    handoverLabel: { ar: "الربع الرابع 2026", en: "Q4 2026" },
    status: "off_plan",
    publishOnWebsite: true,
  }),
  project({
    slug: "al-rams-studios",
    title: { ar: "استوديوهات الرمس", en: "Al Rams Studios" },
    description: {
      ar: "شقق استوديو اقتصادية جاهزة للتسليم في منطقة الرمس برأس الخيمة، خيار مناسب للمستثمرين الباحثين عن نقطة دخول منخفضة.",
      en: "Affordable, ready-to-move studio apartments in Al Rams, Ras Al Khaimah — a good fit for investors seeking a low entry point.",
    },
    shortDescription: { ar: "استوديوهات اقتصادية جاهزة في رأس الخيمة", en: "Affordable ready studios in Ras Al Khaimah" },
    emirate: "ras_al_khaimah",
    area: { ar: "الرمس", en: "Al Rams" },
    developer: { ar: "شركة رأس الخيمة العقارية", en: "RAK Properties" },
    propertyType: "apartment",
    priceFrom: 420_000,
    bedrooms: ["studio"],
    areaSqftFrom: 350,
    areaSqftTo: 420,
    status: "ready",
    publishOnWebsite: true,
  }),
];

export function getFeaturedProjects(): Project[] {
  return MOCK_PROJECTS.filter((p) => p.isFeatured && p.publishOnWebsite);
}

export function getPublishedProjects(): Project[] {
  return MOCK_PROJECTS.filter((p) => p.publishOnWebsite);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return MOCK_PROJECTS.find((p) => p.slug === slug && p.publishOnWebsite);
}
