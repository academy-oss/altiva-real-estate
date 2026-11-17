import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Camera,
  Download,
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
} from "lucide-react";
import { publicAsset } from "../lib/utils";

const MAP_URL = "https://share.google/6IICTy9gYjbXOnDQj";

const profiles = {
  yasmin: {
    slug: "yasmin-shahabi",
    name: { ar: "ياسمين شهابي", en: "Yasmin Shahabi" },
    title: { ar: "مديرة المكتب", en: "Office Manager" },
    firstName: "Yasmin",
    phone: "+96557775289",
    phoneDisplay: "+965 5777 5289",
    officePhone: "+96522200355",
    officePhoneDisplay: "+965 2220 0355",
    email: "yasmin@altivaproperties.com",
    photo: "team/yasmin-shahabi.jpg",
    downloadName: "Yasmin-Shahabi-ALTIVA.vcf",
  },
  sarah: {
    slug: "sarah-alotaibi",
    name: { ar: "سارة العتيبي", en: "Sarah Al Otaibi" },
    title: { ar: "سكرتيرة المدير", en: "Executive Secretary" },
    firstName: "Sarah",
    phone: "+96557775094",
    phoneDisplay: "+965 5777 5094",
    officePhone: "+96522200355",
    officePhoneDisplay: "+965 2220 0355",
    email: "sarah@altivaproperties.com",
    photo: "team/sarah-alotaibi.jpg",
    downloadName: "Sarah-Al-Otaibi-ALTIVA.vcf",
  },
} as const;

type ProfileKey = keyof typeof profiles;

const copy = {
  ar: {
    company: "ألتيفا العقارية",
    call: "اتصال",
    whatsapp: "واتساب",
    email: "البريد",
    location: "الموقع",
    save: "حفظ جهة الاتصال",
    website: "الموقع الإلكتروني",
    instagram: "إنستغرام",
    office: "هاتف المكتب",
    mobile: "الهاتف والواتساب",
    address: "مجمع الصالحية، بوابة 5، الطابق الثاني، الكويت",
    share: "مشاركة البطاقة",
    copied: "تم نسخ الرابط",
    language: "EN",
  },
  en: {
    company: "ALTIVA Real Estate",
    call: "Call",
    whatsapp: "WhatsApp",
    email: "Email",
    location: "Location",
    save: "Save Contact",
    website: "Website",
    instagram: "Instagram",
    office: "Office Phone",
    mobile: "Mobile & WhatsApp",
    address: "Al Salhiya Complex, Gate 5, Second Floor, Kuwait",
    share: "Share Card",
    copied: "Link copied",
    language: "عربي",
  },
} as const;

export default function DigitalCard({ profileKey }: { profileKey: ProfileKey }) {
  const { i18n } = useTranslation();
  const language = i18n.language.startsWith("en") ? "en" : "ar";
  const text = copy[language];
  const profile = profiles[profileKey];
  const name = profile.name[language];
  const title = profile.title[language];
  const cardUrl = `https://altivaproperties.com/card/${profile.slug}`;
  const whatsappMessage = `مرحبًا ${profile.name.ar}، تواصلت معك عبر بطاقتك الرقمية من ALTIVA.\nHello ${profile.firstName}, I contacted you through your ALTIVA digital card.`;
  const whatsappUrl = `https://wa.me/${profile.phone.replace("+", "")}?text=${encodeURIComponent(whatsappMessage)}`;
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    const previousTitle = document.title;
    const previousDirection = document.documentElement.dir;
    const previousLanguage = document.documentElement.lang;
    document.title = `${name} | ${title} — ALTIVA`;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;

    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const previousRobots = robots?.content;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content = "noindex, nofollow";

    return () => {
      document.title = previousTitle;
      document.documentElement.dir = previousDirection;
      document.documentElement.lang = previousLanguage;
      if (previousRobots) robots!.content = previousRobots;
    };
  }, [language, name, title]);

  async function shareCard() {
    try {
      if (navigator.share) {
        await navigator.share({ title: `${name} — ${text.company}`, text: title, url: cardUrl });
      } else {
        await navigator.clipboard.writeText(cardUrl);
        setShareStatus(text.copied);
        window.setTimeout(() => setShareStatus(""), 2200);
      }
    } catch {
      // The visitor may cancel the native share sheet without an error message.
    }
  }

  return (
    <div className="min-h-[100svh] bg-navy-deep px-4 py-5 text-cream sm:py-10">
      <main className="mx-auto max-w-[430px] overflow-hidden rounded-[2rem] border border-copper/25 bg-navy shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
        <header className="relative h-56 overflow-hidden">
          <img
            src={publicAsset("cards/altiva-gcc-card-background-web.jpg")}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/20 via-navy-deep/15 to-navy" />

          <div className="relative flex items-start justify-between p-5">
            <button
              type="button"
              onClick={() => i18n.changeLanguage(language === "ar" ? "en" : "ar")}
              className="rounded-full border border-cream/25 bg-navy-deep/65 px-4 py-2 text-xs font-bold text-cream backdrop-blur-md transition hover:border-copper hover:text-copper"
            >
              {text.language}
            </button>
            <button
              type="button"
              onClick={shareCard}
              aria-label={text.share}
              className="grid h-10 w-10 place-items-center rounded-full border border-cream/25 bg-navy-deep/65 text-cream backdrop-blur-md transition hover:border-copper hover:text-copper"
            >
              <Share2 size={17} />
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-3">
            <img src={publicAsset("altiva-icon.png")} alt="ALTIVA" className="h-11 w-11 object-contain" />
            <div className="text-start leading-tight">
              <div className="font-display-heading text-xl font-bold tracking-[0.16em] text-gold-light">ALTIVA</div>
              <div className="text-[9px] font-semibold tracking-[0.28em] text-cream/65">REAL ESTATE</div>
            </div>
          </div>
        </header>

        <section className="relative px-6 pb-7 text-center">
          <div className="mx-auto -mt-5 h-32 w-32 overflow-hidden rounded-full border-[3px] border-copper bg-navy-light p-1 shadow-gold-lg">
            <img
              src={publicAsset(profile.photo)}
              alt={name}
              className="h-full w-full rounded-full object-cover object-top"
            />
          </div>

          <h1 className="mt-4 font-display-heading text-3xl font-bold text-cream">{name}</h1>
          <p className="mt-1 text-sm font-bold tracking-wide text-copper">{title}</p>
          <p className="mt-1 text-xs text-cream/55">{text.company}</p>

          <div className="mt-6 grid grid-cols-4 gap-3">
            <Action href={`tel:${profile.phone}`} icon={Phone} label={text.call} />
            <Action href={whatsappUrl} icon={MessageCircle} label={text.whatsapp} external />
            <Action href={`mailto:${profile.email}`} icon={Mail} label={text.email} />
            <Action href={MAP_URL} icon={MapPin} label={text.location} external />
          </div>

          <a
            href={publicAsset(`cards/${profile.slug}.vcf`)}
            download={profile.downloadName}
            className="btn-shine mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gold-gradient px-5 py-3.5 text-sm font-extrabold text-navy-deep shadow-gold-sm transition hover:-translate-y-0.5"
          >
            <Download size={18} />
            {text.save}
          </a>

          <div className="mt-6 overflow-hidden rounded-2xl border border-cream/10 bg-navy-light/60 text-start">
            <Detail href={`tel:${profile.phone}`} icon={Phone} label={text.mobile} value={profile.phoneDisplay} />
            <Detail href={`tel:${profile.officePhone}`} icon={Building2} label={text.office} value={profile.officePhoneDisplay} />
            <Detail href={`mailto:${profile.email}`} icon={Mail} label={text.email} value={profile.email} />
            <Detail href={MAP_URL} icon={MapPin} label={text.location} value={text.address} external />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <SocialLink href="https://altivaproperties.com/" icon={Globe2} label={text.website} />
            <SocialLink href="https://www.instagram.com/altiva_properties/" icon={Camera} label={text.instagram} />
          </div>

          {shareStatus && <p className="mt-4 text-xs font-semibold text-gold-light">{shareStatus}</p>}
          <p className="mt-7 text-[10px] tracking-wide text-cream/30">ALTIVA REAL ESTATE · KUWAIT & GCC</p>
        </section>
      </main>
    </div>
  );
}

function Action({ href, icon: Icon, label, external = false }: { href: string; icon: typeof Phone; label: string; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group flex flex-col items-center gap-2 text-[10px] font-semibold text-cream/60 transition hover:text-copper"
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl border border-copper/25 bg-navy-light text-copper transition group-hover:border-copper group-hover:bg-copper group-hover:text-navy-deep">
        <Icon size={19} />
      </span>
      {label}
    </a>
  );
}

function Detail({ href, icon: Icon, label, value, external = false }: { href: string; icon: typeof Phone; label: string; value: string; external?: boolean }) {
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="flex items-center gap-3 border-b border-cream/10 px-4 py-3.5 last:border-0 hover:bg-cream/5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-copper/10 text-copper"><Icon size={16} /></span>
      <span className="min-w-0">
        <span className="block text-[10px] text-cream/40">{label}</span>
        <span dir="ltr" className="mt-0.5 block break-words text-xs font-semibold text-cream/85">{value}</span>
      </span>
    </a>
  );
}

function SocialLink({ href, icon: Icon, label }: { href: string; icon: typeof Globe2; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-2xl border border-cream/10 bg-navy-light/60 px-3 py-3 text-xs font-semibold text-cream/70 transition hover:border-copper/50 hover:text-copper">
      <Icon size={16} />
      {label}
    </a>
  );
}
