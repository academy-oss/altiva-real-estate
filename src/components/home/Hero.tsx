import { useTranslation } from "react-i18next";
import { ChevronDown, MessageCircle } from "lucide-react";
import { AnchorButton } from "../ui/Button";

const WHATSAPP_NUMBER = "96557775289";

export function Hero() {
  const { t, i18n } = useTranslation();
  const message = encodeURIComponent(
    i18n.language === "ar"
      ? "مرحبًا، أرغب بمعرفة المزيد عن أفضل الفرص الاستثمارية المتاحة لدى ألتيفا في دبي."
      : "Hello, I'd like to learn more about the best investment opportunities available with Altiva in Dubai."
  );

  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden pt-24">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-deep via-navy to-navy-light" aria-hidden="true">
        <div className="absolute inset-0 bg-gold-radial" />
        <SkylineDecoration />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-navy-deep to-transparent" />
      </div>

      <div className="relative mx-auto max-w-4xl px-5 py-16 text-center sm:px-8">
        <div className="mx-auto mb-7 h-[3px] w-14 rounded-full bg-gold-gradient" aria-hidden="true" />
        <h1 className="font-display-heading text-4xl font-bold leading-[1.1] text-cream sm:text-6xl md:text-7xl">
          {t("home.hero.title")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-cream/80 sm:text-lg">{t("home.hero.subtitle")}</p>
        <div className="mt-10 flex justify-center">
          <AnchorButton
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            icon={<MessageCircle size={18} />}
          >
            {t("home.hero.ctaPrimary")}
          </AnchorButton>
        </div>
      </div>

      <a href="#why-dubai" className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-1 text-cream/50 hover:text-copper">
        <span className="text-xs">{t("home.hero.ctaSecondary")}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </a>
    </section>
  );
}

function SkylineDecoration() {
  return (
    <svg className="absolute inset-x-0 bottom-0 h-52 w-full sm:h-72 md:h-80" viewBox="0 0 1200 320" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="hero-skyline-copper" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1200" y2="0">
          <stop offset="0%" stopColor="#7A5A22" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#F0D68C" stopOpacity="1" />
          <stop offset="100%" stopColor="#7A5A22" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="hero-skyline-teal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7DEDDD" />
          <stop offset="100%" stopColor="#0F7A6E" />
        </linearGradient>
        <filter id="hero-skyline-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d="M0,320 L0,270 L36,270 L36,240 L80,240 L80,290 L124,290 L124,210 L160,210 L160,255 L200,255 L200,300 L940,300 L940,260 L980,260 L980,215 L1020,215 L1020,280 L1060,280 L1060,235 L1104,235 L1104,300 L1200,300 L1200,320 Z" fill="none" stroke="url(#hero-skyline-copper)" strokeWidth="1.25" strokeOpacity="0.4" />
      <g strokeLinejoin="round" style={{ filter: "url(#hero-skyline-glow)" }}>
        <line x1="182" y1="300" x2="182" y2="60" stroke="#E0B568" strokeWidth="2.25" strokeLinecap="round" />
        <circle cx="182" cy="57" r="2" fill="#F0D68C" />
        <line x1="232" y1="300" x2="232" y2="216" stroke="#E0B568" strokeWidth="3.5" />
        <circle cx="232" cy="196" r="20" fill="url(#hero-skyline-teal)" fillOpacity="0.55" stroke="url(#hero-skyline-teal)" strokeWidth="2.25" />
        <ellipse cx="232" cy="214" rx="25" ry="3.5" fill="none" stroke="url(#hero-skyline-teal)" strokeWidth="1" strokeOpacity="0.75" />
        <line x1="232" y1="176" x2="232" y2="128" stroke="#E0B568" strokeWidth="1.75" strokeLinecap="round" />
        <line x1="292" y1="300" x2="292" y2="176" stroke="#E0B568" strokeWidth="5" />
        <circle cx="292" cy="144" r="32" fill="url(#hero-skyline-teal)" fillOpacity="0.55" stroke="url(#hero-skyline-teal)" strokeWidth="2.75" />
        <ellipse cx="292" cy="172" rx="40" ry="5" fill="none" stroke="url(#hero-skyline-teal)" strokeWidth="1.25" strokeOpacity="0.75" />
        <line x1="292" y1="112" x2="292" y2="26" stroke="#E0B568" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <path d="M816,300 L816,260 L823,260 L823,170 L830,170 L830,90 L838,90 L838,40 L847,40 L850,4 L853,40 L862,40 L862,90 L870,90 L870,170 L877,170 L877,260 L884,260 L884,300" fill="none" stroke="url(#hero-skyline-copper)" strokeWidth="1.75" strokeLinejoin="round" style={{ filter: "url(#hero-skyline-glow)" }} />
    </svg>
  );
}
