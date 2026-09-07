import { useTranslation } from "react-i18next";
import { Container } from "../ui/Container";
import damacLogo from "../../assets/developers/damac-wordmark.png";
import emaarLogo from "../../assets/developers/emaar.svg";
import aziziLogo from "../../assets/developers/azizi.svg";
import omniyatLogo from "../../assets/developers/omniyat.svg";
import sobhaLogo from "../../assets/developers/sobha.svg";
import rakPropertiesLogo from "../../assets/developers/rak-properties.svg";
import objectOneLogo from "../../assets/developers/object-1.svg";
import empireDevelopmentsLogo from "../../assets/developers/empire-developments.png";
import tigerGroupLogo from "../../assets/developers/tiger-group.webp";

const PARTNERS = [
  { name: "DAMAC Properties", logo: damacLogo, className: "bg-navy-light" },
  { name: "Emaar Properties", logo: emaarLogo, className: "bg-navy-light" },
  { name: "Azizi Developments", logo: aziziLogo, className: "bg-navy-light" },
  { name: "OMNIYAT", logo: omniyatLogo, className: "bg-navy-light" },
  { name: "Sobha Realty", logo: sobhaLogo, className: "bg-navy-light" },
  { name: "RAK Properties", logo: rakPropertiesLogo, className: "bg-cream" },
  { name: "Object 1", logo: objectOneLogo, className: "bg-cream" },
  { name: "Empire Developments", logo: empireDevelopmentsLogo, className: "bg-navy-light" },
  { name: "Tiger Group", logo: tigerGroupLogo, className: "bg-cream" },
] as const;

export function PartnersMarquee() {
  const { t } = useTranslation();
  const loopItems = [...PARTNERS, ...PARTNERS];

  return (
    <section className="border-y border-cream/10 bg-navy py-14">
      <Container>
        <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wide text-cream/50">{t("home.partners.title")}</p>
      </Container>
      <div className="thin-scrollbar overflow-hidden" dir="ltr">
        <div className="marquee-track">
          {loopItems.map((partner, idx) => (
            <div
              key={`${partner.name}-${idx}`}
              className={`mx-3 grid h-24 w-56 shrink-0 place-items-center rounded-2xl border border-cream/10 px-7 py-5 ${partner.className}`}
              aria-hidden={idx >= PARTNERS.length}
            >
              <img src={partner.logo} alt={idx < PARTNERS.length ? partner.name : ""} className="max-h-14 max-w-full object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
