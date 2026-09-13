import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BadgeDollarSign,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  HardHat,
  KeyRound,
  Search,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { EMIRATES, PRICE_RANGES, PROPERTY_TYPES } from "../types/project";
import type { PreferredContactMethod, ServiceRequestLead, ServiceRequestType } from "../types/lead";
import { submitServiceRequestLead } from "../services/leadsService";
import { Container } from "../components/ui/Container";
import { SectionHeading } from "../components/ui/SectionHeading";
import { Button } from "../components/ui/Button";
import { CheckboxField, FieldWrapper, RadioGroupField, SelectField, TextareaField, TextField } from "../components/forms/fields";

const SERVICE_TYPES: ServiceRequestType[] = [
  "buy_property",
  "sell_property",
  "property_management",
  "property_valuation",
  "construction_support",
  "other_service",
];

const SERVICE_ICONS = [Search, BadgeDollarSign, KeyRound, ClipboardCheck, HardHat, Building2];
const MAX_FILES = 3;
const MAX_TOTAL_BYTES = 20 * 1024 * 1024;
const ALLOWED_FILE_NAME = /\.(pdf|jpe?g|png)$/i;

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  serviceType: ServiceRequestType | "";
  emirateOfInterest: string;
  propertyType: string;
  budget: string;
  propertyLocation: string;
  preferredContactMethod: PreferredContactMethod | "";
  message: string;
  attachments: File[];
  consentAccepted: boolean;
};

const initialForm = (serviceType: ServiceRequestType | "" = ""): FormState => ({
  fullName: "",
  phone: "",
  email: "",
  serviceType,
  emirateOfInterest: "",
  propertyType: "",
  budget: "",
  propertyLocation: "",
  preferredContactMethod: "whatsapp",
  message: "",
  attachments: [],
  consentAccepted: false,
});

export default function Services() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialService = useMemo(() => {
    const value = searchParams.get("service") as ServiceRequestType | null;
    return value && SERVICE_TYPES.includes(value) ? value : "";
  }, [searchParams]);
  const [form, setForm] = useState<FormState>(() => initialForm(initialService));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [attachmentError, setAttachmentError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const chooseService = (serviceType: ServiceRequestType) => {
    set("serviceType", serviceType);
    window.setTimeout(() => document.getElementById("service-request")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const onFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setAttachmentError("");
    if (files.length > MAX_FILES) {
      setAttachmentError(t("services.form.fileCountError"));
      event.target.value = "";
      return;
    }
    if (files.some((file) => !ALLOWED_FILE_NAME.test(file.name))) {
      setAttachmentError(t("services.form.fileTypeError"));
      event.target.value = "";
      return;
    }
    if (files.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL_BYTES) {
      setAttachmentError(t("services.form.fileSizeError"));
      event.target.value = "";
      return;
    }
    set("attachments", files);
  };

  const validate = () => {
    const required = t("common.required");
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim()) next.fullName = required;
    if (!form.phone.trim()) next.phone = required;
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = t("services.form.emailError");
    if (!form.serviceType) next.serviceType = required;
    if (!form.emirateOfInterest) next.emirateOfInterest = required;
    if (!form.preferredContactMethod) next.preferredContactMethod = required;
    if (!form.consentAccepted) next.consentAccepted = required;
    setErrors(next);
    return Object.keys(next).length === 0 && !attachmentError;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitError(false);
    setSubmitting(true);
    try {
      const lead: ServiceRequestLead = {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || undefined,
        serviceType: form.serviceType as ServiceRequestType,
        emirateOfInterest: form.emirateOfInterest,
        propertyType: form.propertyType || undefined,
        budget: form.budget || undefined,
        propertyLocation: form.propertyLocation || undefined,
        preferredContactMethod: form.preferredContactMethod as PreferredContactMethod,
        message: form.message || undefined,
        attachments: form.attachments,
        consentAccepted: form.consentAccepted,
        submittedAt: new Date().toISOString(),
        source: "website_services_form",
      };
      await submitServiceRequestLead(lead);
      setSubmitted(true);
      setForm(initialForm());
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const cards = t("services.items", { returnObjects: true }) as unknown as { title: string; text: string; points: string[] }[];

  return (
    <main className="bg-navy">
      <section className="relative overflow-hidden border-b border-cream/10 py-16 sm:py-24">
        <div className="absolute inset-0 bg-gold-radial" aria-hidden="true" />
        <Container className="relative text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">{t("brand.name")}</p>
          <h1 className="font-display-heading mt-4 text-4xl font-bold text-cream sm:text-5xl md:text-6xl">{t("services.pageTitle")}</h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-cream/70 sm:text-lg">{t("services.pageSubtitle")}</p>
          <div className="mx-auto mt-8 flex max-w-3xl items-center justify-center gap-3 rounded-2xl border border-copper/25 bg-navy-deep/60 px-5 py-4 text-sm text-cream/75">
            <ShieldCheck className="shrink-0 text-copper" size={22} />
            <span>{t("services.trustLine")}</span>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading title={t("services.cardsTitle")} subtitle={t("services.cardsSubtitle")} />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, index) => {
              const Icon = SERVICE_ICONS[index];
              const serviceType = SERVICE_TYPES[index];
              return (
                <article key={serviceType} className="flex h-full flex-col rounded-3xl border border-cream/10 bg-navy-light p-7 transition hover:-translate-y-1 hover:border-copper/40">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gold-gradient text-navy-deep"><Icon size={25} /></div>
                  <h2 className="font-display-heading mt-5 text-xl font-bold text-cream">{card.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-cream/65">{card.text}</p>
                  <ul className="mt-5 space-y-2 text-sm text-cream/75">
                    {card.points.map((point) => (
                      <li key={point} className="flex items-start gap-2"><CheckCircle2 className="mt-1 shrink-0 text-copper" size={15} /><span>{point}</span></li>
                    ))}
                  </ul>
                  <Button type="button" variant="secondary" className="mt-7 w-full" onClick={() => chooseService(serviceType)}>{t("services.requestService")}</Button>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section id="service-request" className="scroll-mt-24 bg-cream py-16 sm:py-24">
        <Container className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:sticky lg:top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">{t("brand.name")}</p>
            <h2 className="font-display-heading mt-3 text-3xl font-bold text-navy-deep sm:text-4xl">{t("services.form.title")}</h2>
            <p className="mt-4 leading-8 text-navy/65">{t("services.form.subtitle")}</p>
            <div className="mt-6 rounded-2xl border border-gold/25 bg-white p-5 text-sm leading-7 text-navy/65">
              <UploadCloud className="mb-3 text-gold-dark" size={25} />
              <p className="font-semibold text-navy-deep">{t("services.form.attachmentsOptional")}</p>
              <p>{t("services.form.attachmentsSafety")}</p>
            </div>
          </div>

          {submitted ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-xl sm:p-12" role="status">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold-gradient text-navy-deep"><CheckCircle2 size={32} /></div>
              <h2 className="font-display-heading mt-6 text-3xl font-bold text-navy-deep">{t("services.form.successTitle")}</h2>
              <p className="mx-auto mt-3 max-w-lg text-navy/60">{t("services.form.successText")}</p>
              <Button type="button" className="mt-7" onClick={() => setSubmitted(false)}>{t("services.form.newRequest")}</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-xl sm:p-10">
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField label={t("services.form.fullName")} htmlFor="serviceFullName" required value={form.fullName} onChange={(e) => set("fullName", e.target.value)} error={errors.fullName} />
                <TextField label={t("services.form.phone")} htmlFor="servicePhone" type="tel" dir="ltr" required value={form.phone} onChange={(e) => set("phone", e.target.value)} error={errors.phone} />
                <TextField label={t("services.form.email")} htmlFor="serviceEmail" type="email" dir="ltr" value={form.email} onChange={(e) => set("email", e.target.value)} error={errors.email} />
                <SelectField
                  label={t("services.form.serviceType")}
                  htmlFor="serviceType"
                  required
                  value={form.serviceType}
                  onChange={(e) => set("serviceType", e.target.value as ServiceRequestType)}
                  options={SERVICE_TYPES.map((service) => ({ value: service, label: t(`services.serviceOptions.${service}`) }))}
                  placeholder={t("services.form.chooseService")}
                  error={errors.serviceType}
                />
                <SelectField
                  label={t("services.form.emirate")}
                  htmlFor="serviceEmirate"
                  required
                  value={form.emirateOfInterest}
                  onChange={(e) => set("emirateOfInterest", e.target.value)}
                  options={[...EMIRATES.map((emirate) => ({ value: emirate, label: t(`emirates.${emirate}`) })), { value: "any_emirate", label: t("services.form.anyEmirate") }]}
                  placeholder={t("services.form.chooseEmirate")}
                  error={errors.emirateOfInterest}
                />
                <SelectField
                  label={t("services.form.propertyType")}
                  htmlFor="servicePropertyType"
                  value={form.propertyType}
                  onChange={(e) => set("propertyType", e.target.value)}
                  options={PROPERTY_TYPES.map((type) => ({ value: type, label: t(`propertyTypes.${type}`) }))}
                  placeholder={t("services.form.choosePropertyType")}
                />
                <SelectField
                  label={t("services.form.budget")}
                  htmlFor="serviceBudget"
                  value={form.budget}
                  onChange={(e) => set("budget", e.target.value)}
                  options={PRICE_RANGES.map((range) => ({ value: range.id, label: t(`priceRanges.${range.id}`) }))}
                  placeholder={t("services.form.chooseBudget")}
                />
                <TextField label={t("services.form.propertyLocation")} htmlFor="servicePropertyLocation" value={form.propertyLocation} onChange={(e) => set("propertyLocation", e.target.value)} />
              </div>

              <div className="mt-6">
                <RadioGroupField
                  label={t("services.form.contactMethod")}
                  name="servicePreferredContact"
                  required
                  value={form.preferredContactMethod}
                  onChange={(value) => set("preferredContactMethod", value as PreferredContactMethod)}
                  options={("phone whatsapp email".split(" ") as PreferredContactMethod[]).map((method) => ({ value: method, label: t(`consultation.form.contactMethodOptions.${method}`) }))}
                  error={errors.preferredContactMethod}
                />
              </div>

              <div className="mt-6">
                <TextareaField label={t("services.form.details")} htmlFor="serviceDetails" value={form.message} onChange={(e) => set("message", e.target.value)} />
              </div>

              <div className="mt-6">
                <FieldWrapper label={t("services.form.attachments")} htmlFor="serviceAttachments">
                  <label htmlFor="serviceAttachments" className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-copper/60 bg-cream/60 px-5 py-7 text-center transition hover:bg-cream">
                    <UploadCloud className="text-gold-dark" size={29} />
                    <span className="mt-2 text-sm font-semibold text-navy-deep">{t("services.form.uploadCta")}</span>
                    <span className="mt-1 text-xs text-navy/50">{t("services.form.uploadHint")}</span>
                    <input ref={fileInputRef} id="serviceAttachments" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="sr-only" onChange={onFilesSelected} />
                  </label>
                  {form.attachments.length > 0 && <p className="text-xs text-navy/60">{form.attachments.map((file) => file.name).join(" • ")}</p>}
                  {attachmentError && <span role="alert" className="text-xs font-medium text-red-600">{attachmentError}</span>}
                </FieldWrapper>
              </div>

              <div className="mt-6">
                <CheckboxField id="serviceConsent" checked={form.consentAccepted} onChange={(value) => set("consentAccepted", value)} label={t("services.form.consent")} error={errors.consentAccepted} />
              </div>

              <Button type="submit" size="lg" className="mt-8 w-full" disabled={submitting}>
                {submitting ? t("common.sending") : t("services.form.submit")}
              </Button>
              {submitError && <p role="alert" className="mt-4 text-center text-sm font-semibold text-red-700">{t("common.submissionError")}</p>}
            </form>
          )}
        </Container>
      </section>
    </main>
  );
}
