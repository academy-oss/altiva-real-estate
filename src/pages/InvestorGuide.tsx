import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowDownToLine, Check, CheckCircle2, LockKeyhole, MessageCircle, ShieldCheck } from "lucide-react";
import type { PurchasePurpose } from "../types/lead";
import { submitGuideLead } from "../services/leadsService";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { CheckboxField, RadioGroupField, TextField } from "../components/forms/fields";
import logo from "../assets/brand/altiva-icon.png";

const GUIDE_URL = "/downloads/altiva-investor-guide-dubai-2026-ar.pdf";
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "96557775289";

type FormState = {
  fullName: string;
  phone: string;
  purpose: PurchasePurpose | "";
  consentAccepted: boolean;
  contactRequested: boolean;
};

const INITIAL_FORM: FormState = {
  fullName: "",
  phone: "",
  purpose: "",
  consentAccepted: false,
  contactRequested: false,
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

function trackGuideLeadSubmitted() {
  window.dataLayer?.push({ event: "guide_lead_submitted", guide_name: "dubai_investor_2026" });
  window.gtag?.("event", "generate_lead", { lead_source: "investor_guide_2026" });
  window.fbq?.("track", "Lead", { content_name: "ALTIVA Investor Guide Dubai 2026" });
}

function trackGuideOpened() {
  window.dataLayer?.push({ event: "guide_opened", guide_name: "dubai_investor_2026" });
  window.gtag?.("event", "file_download", { file_name: "ALTIVA_Investor_Guide_Dubai_2026_AR.pdf" });
}

function normalisePhone(value: string) {
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const converted = [...value].map((character) => {
    const arabicIndex = arabicDigits.indexOf(character);
    if (arabicIndex >= 0) return String(arabicIndex);
    const persianIndex = persianDigits.indexOf(character);
    if (persianIndex >= 0) return String(persianIndex);
    return character;
  }).join("");
  const digits = converted.replace(/\D/g, "").replace(/^00/, "");
  return digits.length >= 8 && digits.length <= 15 && !digits.startsWith("0") ? `+${digits}` : "";
}

export default function InvestorGuide() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const copy = isArabic
    ? {
        eyebrow: "نسخة مجانية من ALTIVA",
        title: "دليل المستثمر العقاري في دبي 2026",
        subtitle: "دليل عملي يساعدك على طرح الأسئلة الصحيحة، مقارنة الفرص، وفهم الأرقام قبل اتخاذ قرار الشراء.",
        formTitle: "احصل على نسختك الآن",
        formHint: "بيانات أساسية فقط، وسيفتح الدليل فورًا.",
        name: "الاسم",
        phone: "رقم واتساب مع رمز الدولة",
        purpose: "ما هدفك الأقرب؟",
        purposes: [
          { value: "investment", label: "دخل وعائد" },
          { value: "residence", label: "سكن" },
          { value: "golden_visa", label: "إقامة ذهبية" },
          { value: "undecided", label: "ما زلت أبحث" },
        ],
        privacy: "أوافق على حفظ بياناتي لتسليم الدليل وفق سياسة الخصوصية.",
        followup: "أرغب أن يتواصل معي مستشار ALTIVA لمساعدتي في مقارنة الفرص.",
        submit: "احصل على الدليل الآن",
        submitting: "جارٍ تجهيز نسختك…",
        required: "هذا الحقل مطلوب",
        phoneError: "أدخل رقم واتساب صحيحًا مع رمز الدولة",
        error: "تعذر إرسال الطلب الآن. حاول مرة أخرى أو تواصل معنا عبر واتساب.",
        successTitle: "دليلك جاهز",
        successText: "يتم فتح الدليل الآن. إذا لم يفتح تلقائيًا، استخدم الزر أدناه.",
        download: "عرض وتحميل الدليل",
        whatsapp: "التحدث مع مستشار",
        includesTitle: "ماذا ستجد داخل الدليل؟",
        includes: [
          "كيف تحدد هدفك الاستثماري قبل اختيار المشروع",
          "مقارنة عملية بين العقار الجاهز وتحت الإنشاء",
          "طريقة تقدير العائد الصافي بدل الاكتفاء بالعائد المعلن",
          "معايير تقييم المنطقة والمطور وخطة الدفع",
          "قائمة فحص وأسئلة تستخدمها قبل الحجز",
        ],
        trust: "محتوى توعوي أعدته ALTIVA بخبرة عقارية تتجاوز 23 عامًا.",
      }
    : {
        eyebrow: "A complimentary ALTIVA guide",
        title: "Dubai Real Estate Investor Guide 2026 — Arabic Edition",
        subtitle: "A practical Arabic guide to asking better questions, comparing opportunities and understanding the numbers before buying.",
        formTitle: "Get your copy now",
        formHint: "Only the essentials. Your guide opens immediately.",
        name: "First name",
        phone: "WhatsApp number with country code",
        purpose: "What is your main goal?",
        purposes: [
          { value: "investment", label: "Income & yield" },
          { value: "residence", label: "Residence" },
          { value: "golden_visa", label: "Golden Visa" },
          { value: "undecided", label: "Still exploring" },
        ],
        privacy: "I agree to the storage of my details to deliver the guide, under the privacy policy.",
        followup: "I would like an ALTIVA advisor to help me compare suitable opportunities.",
        submit: "Get the guide now",
        submitting: "Preparing your copy…",
        required: "This field is required",
        phoneError: "Enter a valid WhatsApp number with country code",
        error: "We could not send the request. Please try again or contact us on WhatsApp.",
        successTitle: "Your guide is ready",
        successText: "The download has started. If it does not start automatically, use the button below.",
        download: "View and download the guide",
        whatsapp: "Speak with an advisor",
        includesTitle: "Inside the guide",
        includes: [
          "Define your investment goal before choosing a project",
          "Compare ready and off-plan property",
          "Estimate net yield instead of relying on headline yield",
          "Assess the location, developer and payment plan",
          "Use a practical checklist before reserving",
        ],
        trust: "Educational content prepared by ALTIVA, backed by more than 23 years of real-estate experience.",
      };

  const campaign = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const parts = [
      `source=${params.get("utm_source") || "direct"}`,
      `medium=${params.get("utm_medium") || "none"}`,
      `campaign=${params.get("utm_campaign") || "none"}`,
      params.get("utm_content") ? `content=${params.get("utm_content")}` : "",
    ].filter(Boolean);
    return parts.join(";");
  }, []);

  useEffect(() => {
    const oldTitle = document.title;
    document.title = isArabic ? "دليل المستثمر العقاري في دبي 2026 | ALTIVA" : "Dubai Investor Guide 2026 | ALTIVA";
    return () => { document.title = oldTitle; };
  }, [isArabic]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  function validate() {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim()) next.fullName = copy.required;
    if (!normalisePhone(form.phone)) next.phone = copy.phoneError;
    if (!form.purpose) next.purpose = copy.required;
    if (!form.consentAccepted) next.consentAccepted = copy.required;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(false);
    try {
      await submitGuideLead({
        fullName: form.fullName.trim(),
        phone: normalisePhone(form.phone),
        purpose: form.purpose as PurchasePurpose,
        consentAccepted: true,
        contactRequested: form.contactRequested,
        language: isArabic ? "ar" : "en",
        campaign,
        source: "investor_guide_2026",
      });
      trackGuideLeadSubmitted();
      setSubmitted(true);
      window.setTimeout(() => {
        trackGuideOpened();
        window.location.assign(GUIDE_URL);
      }, 650);
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  }

  const whatsappMessage = encodeURIComponent(
    isArabic
      ? "مرحبًا، حصلت على دليل المستثمر العقاري في دبي وأرغب في مساعدة بمقارنة الفرص المناسبة لهدفي."
      : "Hello, I downloaded the Dubai Investor Guide and would like help comparing opportunities that suit my goal.",
  );

  if (submitted) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-navy py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(201,161,90,0.16),transparent_48%)]" />
        <Container className="relative max-w-2xl text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-copper/40 bg-copper/10 text-copper">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="mt-7 font-display-heading text-4xl font-bold text-cream sm:text-5xl">{copy.successTitle}</h1>
          <p className="mx-auto mt-4 max-w-lg text-lg leading-8 text-cream/65">{copy.successText}</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <a href={GUIDE_URL} onClick={trackGuideOpened} className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-7 py-4 font-semibold text-navy-deep shadow-gold-sm">
              <ArrowDownToLine size={20} /> {copy.download}
            </a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-copper/55 px-7 py-4 font-semibold text-cream transition-colors hover:bg-copper/10">
              <MessageCircle size={20} /> {copy.whatsapp}
            </a>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy text-cream">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(201,161,90,0.13),transparent_34%),radial-gradient(circle_at_88%_70%,rgba(201,161,90,0.08),transparent_30%)]" />
      <header className="relative border-b border-cream/10">
        <Container className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5" aria-label="ALTIVA">
            <img src={logo} alt="ALTIVA" className="h-9 w-auto" />
            <span className="font-display-heading text-2xl font-bold tracking-wide text-copper">ALTIVA</span>
          </Link>
          <span className="hidden text-sm text-cream/50 sm:block">{isArabic ? "نختار لك ما يستحق الاستثمار" : "We select what is worth investing in"}</span>
        </Container>
      </header>
      <Container className="relative pb-20 pt-10 sm:pb-28 sm:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-copper/35 bg-copper/10 px-4 py-2 text-sm font-semibold text-copper">
              <ShieldCheck size={17} /> {copy.eyebrow}
            </div>
            <h1 className="mt-6 max-w-3xl font-display-heading text-4xl font-bold leading-[1.15] text-cream sm:text-5xl lg:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-cream/70 sm:text-xl">{copy.subtitle}</p>

            <div className="mt-9 grid gap-7 sm:grid-cols-[190px_1fr] sm:items-center">
              <div className="mx-auto w-full max-w-[210px] overflow-hidden rounded-2xl border border-copper/25 bg-navy-light shadow-2xl sm:mx-0">
                <img src="/altiva-investor-guide-cover.png" alt={copy.title} className="aspect-[1/1.414] w-full object-cover" />
              </div>
              <div>
                <h2 className="font-display-heading text-2xl font-bold text-cream">{copy.includesTitle}</h2>
                <ul className="mt-4 space-y-3">
                  {copy.includes.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-6 text-cream/70 sm:text-base">
                      <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-copper/15 text-copper"><Check size={13} /></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-7 flex max-w-xl items-start gap-3 rounded-2xl border border-cream/10 bg-cream/[0.04] p-4 text-sm leading-6 text-cream/60">
              <ShieldCheck className="mt-0.5 shrink-0 text-copper" size={19} /> {copy.trust}
            </p>
          </div>

          <div className="rounded-[2rem] border border-copper/20 bg-cream p-6 text-navy-deep shadow-2xl sm:p-9">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display-heading text-3xl font-bold">{copy.formTitle}</h2>
                <p className="mt-2 text-sm text-navy/55">{copy.formHint}</p>
              </div>
              <LockKeyhole className="shrink-0 text-copper" size={26} />
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
              <TextField
                label={copy.name}
                htmlFor="guideFullName"
                required
                autoComplete="given-name"
                value={form.fullName}
                onChange={(event) => set("fullName", event.target.value)}
                error={errors.fullName}
              />
              <TextField
                label={copy.phone}
                htmlFor="guidePhone"
                required
                type="tel"
                dir="ltr"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+965 0000 0000"
                value={form.phone}
                onChange={(event) => set("phone", event.target.value)}
                error={errors.phone}
              />
              <RadioGroupField
                label={copy.purpose}
                name="guidePurpose"
                required
                value={form.purpose}
                onChange={(value) => set("purpose", value as PurchasePurpose)}
                options={copy.purposes}
                error={errors.purpose}
              />
              <CheckboxField
                id="guidePrivacy"
                checked={form.consentAccepted}
                onChange={(checked) => set("consentAccepted", checked)}
                error={errors.consentAccepted}
                label={<>{copy.privacy} <Link to="/privacy" target="_blank" className="font-semibold text-copper underline underline-offset-2">{isArabic ? "عرض السياسة" : "View policy"}</Link></>}
              />
              <CheckboxField
                id="guideFollowup"
                checked={form.contactRequested}
                onChange={(checked) => set("contactRequested", checked)}
                label={copy.followup}
              />

              {submitError && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{copy.error}</p>}

              <Button type="submit" size="lg" className="w-full" disabled={submitting} icon={<ArrowDownToLine size={20} />}>
                {submitting ? copy.submitting : copy.submit}
              </Button>
            </form>
          </div>
        </div>
      </Container>
      <footer className="relative border-t border-cream/10 py-5 text-center text-xs text-cream/45">
        © 2026 ALTIVA Real Estate · <Link to="/privacy" className="underline underline-offset-2">{isArabic ? "سياسة الخصوصية" : "Privacy policy"}</Link>
      </footer>
    </main>
  );
}
