import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import { EMIRATES, PROPERTY_TYPES, PRICE_RANGES, BEDROOM_OPTIONS } from "../types/project";
import type { ConsultationLead, PreferredContactMethod, PurchasePurpose, PurchaseTimeline } from "../types/lead";
import { submitConsultationLead } from "../services/leadsService";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { TextField, SelectField, TextareaField, CheckboxField, RadioGroupField } from "../components/forms/fields";

const COUNTRIES: { value: string; ar: string; en: string }[] = [
  { value: "kuwait", ar: "الكويت", en: "Kuwait" },
  { value: "uae", ar: "الإمارات العربية المتحدة", en: "United Arab Emirates" },
  { value: "saudi_arabia", ar: "السعودية", en: "Saudi Arabia" },
  { value: "qatar", ar: "قطر", en: "Qatar" },
  { value: "bahrain", ar: "البحرين", en: "Bahrain" },
  { value: "oman", ar: "عُمان", en: "Oman" },
  { value: "other", ar: "دولة أخرى", en: "Other" },
];

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  countryOfResidence: string;
  emirateOfInterest: string;
  propertyType: string;
  budget: string;
  purpose: PurchasePurpose | "";
  purchaseTimeline: PurchaseTimeline | "";
  bedrooms: string;
  preferredContactMethod: PreferredContactMethod | "";
  message: string;
  consentAccepted: boolean;
};

const INITIAL_STATE: FormState = {
  fullName: "",
  phone: "",
  email: "",
  countryOfResidence: "",
  emirateOfInterest: "",
  propertyType: "",
  budget: "",
  purpose: "",
  purchaseTimeline: "",
  bedrooms: "",
  preferredContactMethod: "",
  message: "",
  consentAccepted: false,
};

export default function Consultation() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const projectSlug = searchParams.get("project") || undefined;
  const lang = i18n.language;
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function validate(): boolean {
    const required = t("common.required");
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim()) next.fullName = required;
    if (!form.phone.trim()) next.phone = required;
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) next.email = required;
    if (!form.countryOfResidence) next.countryOfResidence = required;
    if (!form.emirateOfInterest) next.emirateOfInterest = required;
    if (!form.propertyType) next.propertyType = required;
    if (!form.budget) next.budget = required;
    if (!form.purpose) next.purpose = required;
    if (!form.purchaseTimeline) next.purchaseTimeline = required;
    if (!form.bedrooms) next.bedrooms = required;
    if (!form.preferredContactMethod) next.preferredContactMethod = required;
    if (!form.consentAccepted) next.consentAccepted = required;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError(false);
    setSubmitting(true);
    try {
      const lead: ConsultationLead = {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        countryOfResidence: form.countryOfResidence,
        emirateOfInterest: form.emirateOfInterest,
        propertyType: form.propertyType,
        budget: form.budget,
        purpose: form.purpose as PurchasePurpose,
        purchaseTimeline: form.purchaseTimeline as PurchaseTimeline,
        bedrooms: form.bedrooms,
        preferredContactMethod: form.preferredContactMethod as PreferredContactMethod,
        message: form.message || undefined,
        consentAccepted: form.consentAccepted,
        projectSlug,
      };
      await submitConsultationLead(lead);
      setSubmitted(true);
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-navy py-24">
        <Container className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-gold-gradient text-navy-deep">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="font-display-heading text-3xl font-bold text-cream">{t("consultation.form.successTitle")}</h1>
          <p className="mt-3 text-cream/60">{t("consultation.form.successText")}</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-navy py-16 sm:py-20">
      <Container className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h1 className="font-display-heading text-4xl font-bold text-cream sm:text-5xl">{t("consultation.title")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-cream/60">{t("consultation.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl bg-cream p-6 sm:p-10">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label={t("consultation.form.fullName")}
              htmlFor="fullName"
              required
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              error={errors.fullName}
            />
            <TextField
              label={t("consultation.form.phone")}
              htmlFor="phone"
              type="tel"
              required
              dir="ltr"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              error={errors.phone}
            />
            <TextField
              label={t("consultation.form.email")}
              htmlFor="email"
              type="email"
              required
              dir="ltr"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              error={errors.email}
            />
            <SelectField
              label={t("consultation.form.countryOfResidence")}
              htmlFor="countryOfResidence"
              required
              value={form.countryOfResidence}
              onChange={(e) => set("countryOfResidence", e.target.value)}
              options={COUNTRIES.map((c) => ({ value: c.value, label: lang === "ar" ? c.ar : c.en }))}
              placeholder={t("consultation.form.countryOfResidence")}
              error={errors.countryOfResidence}
            />
            <SelectField
              label={t("consultation.form.emirate")}
              htmlFor="emirateOfInterest"
              required
              value={form.emirateOfInterest}
              onChange={(e) => set("emirateOfInterest", e.target.value)}
              options={EMIRATES.map((em) => ({ value: em, label: t(`emirates.${em}`) }))}
              placeholder={t("consultation.form.emirate")}
              error={errors.emirateOfInterest}
            />
            <SelectField
              label={t("consultation.form.propertyType")}
              htmlFor="propertyType"
              required
              value={form.propertyType}
              onChange={(e) => set("propertyType", e.target.value)}
              options={PROPERTY_TYPES.map((pt) => ({ value: pt, label: t(`propertyTypes.${pt}`) }))}
              placeholder={t("consultation.form.propertyType")}
              error={errors.propertyType}
            />
            <SelectField
              label={t("consultation.form.budget")}
              htmlFor="budget"
              required
              value={form.budget}
              onChange={(e) => set("budget", e.target.value)}
              options={PRICE_RANGES.map((r) => ({ value: r.id, label: t(`priceRanges.${r.id}`) }))}
              placeholder={t("consultation.form.budget")}
              error={errors.budget}
            />
            <SelectField
              label={t("consultation.form.bedrooms")}
              htmlFor="bedrooms"
              required
              value={form.bedrooms}
              onChange={(e) => set("bedrooms", e.target.value)}
              options={BEDROOM_OPTIONS.map((b) => ({ value: b, label: b === "studio" ? t("common.studio") : b }))}
              placeholder={t("consultation.form.bedrooms")}
              error={errors.bedrooms}
            />
          </div>

          <div className="mt-6 grid gap-6">
            <RadioGroupField
              label={t("consultation.form.purpose")}
              name="purpose"
              required
              value={form.purpose}
              onChange={(v) => set("purpose", v as PurchasePurpose)}
              options={(["investment", "residence", "holiday_home", "golden_visa", "undecided"] as PurchasePurpose[]).map((p) => ({
                value: p,
                label: t(`consultation.form.purposeOptions.${p}`),
              }))}
              error={errors.purpose}
            />
            <RadioGroupField
              label={t("consultation.form.purchaseTimeline")}
              name="purchaseTimeline"
              required
              value={form.purchaseTimeline}
              onChange={(v) => set("purchaseTimeline", v as PurchaseTimeline)}
              options={(["immediate", "3_months", "6_months", "exploring"] as PurchaseTimeline[]).map((p) => ({
                value: p,
                label: t(`consultation.form.timelineOptions.${p}`),
              }))}
              error={errors.purchaseTimeline}
            />
            <RadioGroupField
              label={t("consultation.form.contactMethod")}
              name="preferredContactMethod"
              required
              value={form.preferredContactMethod}
              onChange={(v) => set("preferredContactMethod", v as PreferredContactMethod)}
              options={(["phone", "whatsapp", "email"] as PreferredContactMethod[]).map((p) => ({
                value: p,
                label: t(`consultation.form.contactMethodOptions.${p}`),
              }))}
              error={errors.preferredContactMethod}
            />
          </div>

          <div className="mt-6">
            <TextareaField
              label={t("consultation.form.message")}
              htmlFor="message"
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
            />
          </div>

          <div className="mt-6">
            <CheckboxField
              id="consentAccepted"
              checked={form.consentAccepted}
              onChange={(v) => set("consentAccepted", v)}
              label={t("consultation.form.consent")}
              error={errors.consentAccepted}
            />
          </div>

          <Button type="submit" size="lg" className="mt-8 w-full" disabled={submitting}>
            {submitting ? t("common.sending") : t("consultation.form.submit")}
          </Button>
          {submitError && <p role="alert" className="mt-4 text-center text-sm font-semibold text-red-700">{t("common.submissionError")}</p>}
        </form>
      </Container>
    </div>
  );
}
