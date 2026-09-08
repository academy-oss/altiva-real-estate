import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, CheckCircle2, ChevronLeft, ChevronRight, LoaderCircle, Send, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { askAltivaAssistant } from "../../services/assistantService";
import { submitAssistantLead } from "../../services/leadsService";
import { fetchProjects } from "../../services/projectsService";
import { EMIRATES, PRICE_RANGES, PROPERTY_TYPES } from "../../types/project";
import type { Project } from "../../types/project";
import type { AssistantLanguage, AssistantMessage } from "../../types/assistant";

type UiMessage = AssistantMessage & { id: number; projectSlugs?: string[] };

type LeadForm = {
  fullName: string;
  phone: string;
  email: string;
  budget: string;
  emirateOfInterest: string;
  propertyType: string;
  consentAccepted: boolean;
};

const INITIAL_LEAD: LeadForm = {
  fullName: "",
  phone: "",
  email: "",
  budget: "",
  emirateOfInterest: "",
  propertyType: "",
  consentAccepted: false,
};

const COPY = {
  ar: {
    title: "مستشار ALTIVA الذكي",
    subtitle: "دليلك إلى الفرص العقارية",
    open: "اسأل مستشار ALTIVA الذكي",
    greeting: "أهلاً بك في ALTIVA. أخبرني عن ميزانيتك، الإمارة أو نوع العقار الذي تبحث عنه، وسأساعدك في استكشاف الخيارات المتاحة.",
    placeholder: "اكتب سؤالك هنا...",
    send: "إرسال",
    quick: ["رشّح لي مشروعًا", "مشاريع تحت مليون", "أريد التحدث مع مستشار"],
    advisor: "طلب تواصل من مستشار",
    formTitle: "دع مستشار ALTIVA يتواصل معك",
    formText: "لن تُرسل بياناتك إلى فريقنا إلا بعد موافقتك.",
    name: "الاسم الكامل *",
    phone: "رقم الهاتف *",
    email: "البريد الإلكتروني (اختياري)",
    budget: "الميزانية التقريبية",
    emirate: "الإمارة المفضلة",
    property: "نوع العقار",
    optional: "غير محدد",
    consent: "أوافق على سياسة الخصوصية وأسمح لألتيفا بالتواصل معي بخصوص طلبي.",
    submit: "إرسال الطلب إلى ALTIVA",
    submitting: "جارٍ إرسال الطلب...",
    success: "تم إرسال طلبك إلى فريق ALTIVA بنجاح. سيتواصل معك أحد المستشارين قريبًا.",
    error: "تعذر إرسال الطلب الآن. يمكنك المحاولة مرة أخرى أو التواصل معنا عبر واتساب.",
    required: "يرجى إدخال الاسم ورقم الهاتف والموافقة على سياسة الخصوصية.",
    privacy: "لا تشارك بيانات بطاقتك أو أي معلومات شخصية حساسة في المحادثة.",
    details: "عرض تفاصيل المشروع",
    close: "إغلاق",
    back: "العودة للمحادثة",
    thinking: "أبحث في مشاريع ALTIVA...",
  },
  en: {
    title: "ALTIVA Smart Advisor",
    subtitle: "Your guide to property opportunities",
    open: "Ask ALTIVA Smart Advisor",
    greeting: "Welcome to ALTIVA. Tell me your budget, preferred emirate, or property type and I'll help you explore the available options.",
    placeholder: "Type your question...",
    send: "Send",
    quick: ["Recommend a project", "Projects under AED 1M", "Speak to an advisor"],
    advisor: "Request an advisor call",
    formTitle: "Let an ALTIVA advisor contact you",
    formText: "Your details will only be sent to our team after you consent.",
    name: "Full name *",
    phone: "Phone number *",
    email: "Email (optional)",
    budget: "Approximate budget",
    emirate: "Preferred emirate",
    property: "Property type",
    optional: "Not specified",
    consent: "I agree to the Privacy Policy and allow ALTIVA to contact me about my request.",
    submit: "Send request to ALTIVA",
    submitting: "Sending your request...",
    success: "Your request was sent to the ALTIVA team. An advisor will contact you shortly.",
    error: "We couldn't send your request right now. Please try again or contact us on WhatsApp.",
    required: "Please enter your name and phone number and accept the Privacy Policy.",
    privacy: "Do not share card details or sensitive personal information in this chat.",
    details: "View project details",
    close: "Close",
    back: "Back to chat",
    thinking: "Searching ALTIVA projects...",
  },
} as const;

export function AltivaAssistant() {
  const { i18n, t } = useTranslation();
  const language: AssistantLanguage = i18n.language === "en" ? "en" : "ar";
  const copy = COPY[language];
  const [open, setOpen] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [lead, setLead] = useState<LeadForm>(INITIAL_LEAD);
  const [leadError, setLeadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const messageId = useRef(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProjects().then(setProjects).catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    setMessages([{ id: messageId.current++, role: "assistant", content: copy.greeting }]);
    setShowLeadForm(false);
    setSubmitted(false);
  }, [language, copy.greeting]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking, open, showLeadForm]);

  const projectMap = useMemo(() => new Map(projects.map((project) => [project.slug, project])), [projects]);

  async function sendMessage(text = input) {
    const clean = text.trim();
    if (!clean || thinking) return;
    const userMessage: UiMessage = { id: messageId.current++, role: "user", content: clean };
    const previous = messages.map(({ role, content }) => ({ role, content }));
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setThinking(true);
    try {
      const answer = await askAltivaAssistant(clean, language, previous, projects);
      setMessages((current) => [...current, {
        id: messageId.current++,
        role: "assistant",
        content: answer.reply,
        projectSlugs: answer.projectSlugs,
      }]);
    } finally {
      setThinking(false);
    }
  }

  async function submitLead(event: React.FormEvent) {
    event.preventDefault();
    setLeadError("");
    if (!lead.fullName.trim() || !lead.phone.trim() || !lead.consentAccepted) {
      setLeadError(copy.required);
      return;
    }
    setSubmitting(true);
    const summary = messages
      .slice(-10)
      .map((message) => `${message.role === "user" ? "Visitor" : "ALTIVA"}: ${message.content}`)
      .join("\n");
    const latestProject = [...messages].reverse().flatMap((message) => message.projectSlugs ?? [])[0];
    try {
      await submitAssistantLead({
        fullName: lead.fullName,
        phone: lead.phone,
        email: lead.email || undefined,
        budget: lead.budget || undefined,
        emirateOfInterest: lead.emirateOfInterest || undefined,
        propertyType: lead.propertyType || undefined,
        projectSlug: latestProject,
        conversationSummary: summary,
        language,
        consentAccepted: lead.consentAccepted,
      });
      setSubmitted(true);
    } catch {
      setLeadError(copy.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="altiva-assistant-launcher"
          aria-label={copy.open}
        >
          <span className="altiva-assistant-launcher-icon"><Sparkles size={19} /></span>
          <span className="hidden sm:inline">{copy.open}</span>
          <span className="sm:hidden">{language === "ar" ? "المستشار الذكي" : "Smart advisor"}</span>
        </button>
      )}

      {open && (
        <section className="altiva-assistant-panel" aria-label={copy.title}>
          <header className="flex items-center gap-3 border-b border-copper/20 bg-navy-deep px-4 py-3 text-cream">
            {showLeadForm && !submitted ? (
              <button type="button" onClick={() => setShowLeadForm(false)} className="rounded-full p-1.5 text-copper hover:bg-white/5" aria-label={copy.back}>
                {language === "ar" ? <ChevronRight size={21} /> : <ChevronLeft size={21} />}
              </button>
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-gradient text-navy-deep"><Bot size={22} /></span>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="font-display-heading truncate text-base font-bold text-gold-light">{copy.title}</h2>
              <p className="truncate text-[11px] text-cream/60">{copy.subtitle}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-cream/70 hover:bg-white/5 hover:text-cream" aria-label={copy.close}>
              <X size={20} />
            </button>
          </header>

          {showLeadForm ? (
            <div className="thin-scrollbar flex-1 overflow-y-auto bg-cream p-4 text-navy-deep">
              {submitted ? (
                <div className="flex min-h-full flex-col items-center justify-center px-4 text-center">
                  <span className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-navy text-copper"><CheckCircle2 size={34} /></span>
                  <p className="font-display-heading text-xl font-bold">{copy.success}</p>
                  <button type="button" onClick={() => setShowLeadForm(false)} className="mt-6 rounded-full bg-navy px-6 py-3 text-sm font-bold text-gold-light">
                    {copy.back}
                  </button>
                </div>
              ) : (
                <form onSubmit={submitLead} className="space-y-3">
                  <div>
                    <h3 className="font-display-heading text-lg font-bold">{copy.formTitle}</h3>
                    <p className="mt-1 text-xs text-navy/60">{copy.formText}</p>
                  </div>
                  <input className="assistant-field" placeholder={copy.name} value={lead.fullName} onChange={(event) => setLead({ ...lead, fullName: event.target.value })} />
                  <input className="assistant-field" dir="ltr" type="tel" placeholder={copy.phone} value={lead.phone} onChange={(event) => setLead({ ...lead, phone: event.target.value })} />
                  <input className="assistant-field" dir="ltr" type="email" placeholder={copy.email} value={lead.email} onChange={(event) => setLead({ ...lead, email: event.target.value })} />
                  <select className="assistant-field" value={lead.budget} onChange={(event) => setLead({ ...lead, budget: event.target.value })}>
                    <option value="">{copy.budget}: {copy.optional}</option>
                    {PRICE_RANGES.map((range) => <option key={range.id} value={range.id}>{t(`priceRanges.${range.id}`)}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <select className="assistant-field" value={lead.emirateOfInterest} onChange={(event) => setLead({ ...lead, emirateOfInterest: event.target.value })}>
                      <option value="">{copy.emirate}</option>
                      {EMIRATES.map((emirate) => <option key={emirate} value={emirate}>{t(`emirates.${emirate}`)}</option>)}
                    </select>
                    <select className="assistant-field" value={lead.propertyType} onChange={(event) => setLead({ ...lead, propertyType: event.target.value })}>
                      <option value="">{copy.property}</option>
                      {PROPERTY_TYPES.map((type) => <option key={type} value={type}>{t(`propertyTypes.${type}`)}</option>)}
                    </select>
                  </div>
                  <label className="flex cursor-pointer items-start gap-2 rounded-xl bg-white p-3 text-xs leading-5 text-navy/75">
                    <input type="checkbox" className="mt-1 accent-[#b8873a]" checked={lead.consentAccepted} onChange={(event) => setLead({ ...lead, consentAccepted: event.target.checked })} />
                    <span>{copy.consent} <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="font-bold text-gold-dark underline">{language === "ar" ? "اقرأ السياسة" : "Read policy"}</Link></span>
                  </label>
                  {leadError && <p className="text-xs font-semibold text-red-700">{leadError}</p>}
                  <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-bold text-gold-light disabled:opacity-60">
                    {submitting && <LoaderCircle size={17} className="animate-spin" />}
                    {submitting ? copy.submitting : copy.submit}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <>
              <div className="thin-scrollbar flex-1 space-y-3 overflow-y-auto bg-cream-dark/95 p-4" role="log" aria-live="polite">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={message.role === "user" ? "assistant-bubble-user" : "assistant-bubble-bot"}>
                      <p className="whitespace-pre-line">{message.content}</p>
                      {message.projectSlugs?.map((slug) => {
                        const project = projectMap.get(slug);
                        if (!project) return null;
                        return (
                          <Link key={slug} to={`/projects/${slug}`} onClick={() => setOpen(false)} className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-copper/25 bg-navy px-3 py-2 text-xs font-bold text-gold-light hover:border-copper">
                            <span className="truncate">{project.title[language]}</span>
                            <span className="shrink-0 text-[10px] font-medium text-cream/60">{copy.details}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {thinking && (
                  <div className="flex justify-start">
                    <div className="assistant-bubble-bot flex items-center gap-2 text-navy/60">
                      <LoaderCircle size={16} className="animate-spin text-gold-dark" /> {copy.thinking}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="border-t border-copper/15 bg-cream p-3">
                {messages.length <= 2 && (
                  <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 thin-scrollbar">
                    {copy.quick.map((prompt) => (
                      <button key={prompt} type="button" onClick={() => sendMessage(prompt)} className="shrink-0 rounded-full border border-copper/35 bg-white px-3 py-1.5 text-[11px] font-semibold text-navy hover:border-copper">
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }}
                    className="min-w-0 flex-1 rounded-full border border-copper/30 bg-white px-4 py-2.5 text-sm text-navy-deep placeholder:text-navy/35 focus:border-copper focus:outline-none"
                    placeholder={copy.placeholder}
                    maxLength={1000}
                  />
                  <button type="button" onClick={() => sendMessage()} disabled={!input.trim() || thinking} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-gradient text-navy-deep disabled:opacity-50" aria-label={copy.send}>
                    <Send size={18} className={language === "ar" ? "rotate-180" : ""} />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-[9px] leading-4 text-navy/45">{copy.privacy}</p>
                  <button type="button" onClick={() => { setShowLeadForm(true); setSubmitted(false); setLeadError(""); }} className="shrink-0 text-[10px] font-bold text-gold-dark hover:underline">
                    {copy.advisor}
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </>
  );
}
