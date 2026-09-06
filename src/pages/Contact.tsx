import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import type { ContactMessage } from "../types/lead";
import { submitContactMessage } from "../services/leadsService";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { TextField, TextareaField, CheckboxField } from "../components/forms/fields";

const WHATSAPP_NUMBER = "96557775289";

type FormState = { name: string; email: string; phone: string; subject: string; message: string; consentAccepted: boolean };
const INITIAL: FormState = { name: "", email: "", phone: "", subject: "", message: "", consentAccepted: false };

export default function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(INITIAL);
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
    if (!form.name.trim()) next.name = required;
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) next.email = required;
    if (!form.subject.trim()) next.subject = required;
    if (!form.message.trim()) next.message = required;
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
      const payload: ContactMessage = { ...form };
      await submitContactMessage(payload);
      setSubmitted(true);
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-navy py-16 sm:py-20">
      <Container>
        <div className="mb-12 text-center">
          <h1 className="font-display-heading text-4xl font-bold text-cream sm:text-5xl">{t("contact.pageTitle")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-cream/60">{t("contact.subtitle")}</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="rounded-3xl bg-cream p-6 sm:p-10">
            {submitted ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-gold-gradient text-navy-deep">
                  <CheckCircle2 size={28} />
                </div>
                <h2 className="font-display-heading text-2xl font-bold text-navy-deep">{t("common.thankYou")}</h2>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField label={t("contact.form.name")} htmlFor="name" required value={form.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
                  <TextField label={t("contact.form.email")} htmlFor="email" type="email" dir="ltr" required value={form.email} onChange={(e) => set("email", e.target.value)} error={errors.email} />
                  <TextField label={t("contact.form.phone")} htmlFor="phone" type="tel" dir="ltr" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                  <TextField label={t("contact.form.subject")} htmlFor="subject" required value={form.subject} onChange={(e) => set("subject", e.target.value)} error={errors.subject} />
                </div>
                <TextareaField label={t("contact.form.message")} htmlFor="message" required value={form.message} onChange={(e) => set("message", e.target.value)} error={errors.message} />
                <CheckboxField
                  id="contactConsentAccepted"
                  checked={form.consentAccepted}
                  onChange={(value) => set("consentAccepted", value)}
                  label={t("consultation.form.consent")}
                  error={errors.consentAccepted}
                />
                {submitError && <p role="alert" className="text-sm font-semibold text-red-700">{t("common.submissionError")}</p>}
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? t("common.sending") : t("contact.form.submit")}
                </Button>
              </form>
            )}
          </div>

          <div className="rounded-3xl border border-cream/10 bg-navy-light p-7 text-center">
            <h3 className="font-display-heading mb-6 text-xl font-bold text-cream">{t("footer.contactTitle")}</h3>
            <ul className="space-y-6 text-center text-sm text-cream/75">
              <li className="flex flex-col items-center gap-2 text-center">
                <MapPin size={18} className="mt-0.5 shrink-0 text-copper" />
                <span className="text-center">{t("footer.address")}</span>
              </li>
              <li className="flex flex-col items-center gap-2 text-center">
                <MessageCircle size={18} className="shrink-0 text-copper" />
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="text-center hover:text-copper">
                  <bdi dir="ltr">+965 5777 5289</bdi>
                </a>
              </li>
              <li className="flex flex-col items-center gap-2 text-center">
                <Phone size={18} className="shrink-0 text-copper" />
                <a href="tel:+9652220035" className="text-center hover:text-copper">
                  <bdi dir="ltr">+965 2220035</bdi>
                </a>
              </li>
              <li className="flex flex-col items-center gap-2 text-center">
                <Mail size={18} className="shrink-0 text-copper" />
                <a href="mailto:sales@altivaproperties.com" className="text-center hover:text-copper">
                  <bdi dir="ltr">sales@altivaproperties.com</bdi>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </div>
  );
}
