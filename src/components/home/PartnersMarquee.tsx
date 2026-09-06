import { useTranslation } from "react-i18next";
import { Container } from "../ui/Container";
import { publicAsset } from "../../lib/utils";

const PARTNERS = [
  { name: "DAMAC Properties", logo: "/developers/damac-wordmark.png", className: "bg-navy-light" },
  { name: "Emaar Properties", logo: "/developers/emaar.svg", className: "bg-navy-light" },
  { name: "Azizi Developments", logo: "/developers/azizi.svg", className: "bg-navy-light" },
  { name: "OMNIYAT", logo: "/developers/omniyat.svg", className: "bg-navy-light" },
  { name: "Sobha Realty", logo: "/developers/sobha.svg", className: "bg-navy-light" },
  { name: "RAK Properties", logo: "/developers/rak-properties.svg", className: "bg-cream" },
  { name: "Object 1", logo: "/developers/object-1.svg", className: "bg-cream" },
  { name: "Empire Developments", logo: "/developers/empire-developments.png", className: "bg-navy-light" },
  { name: "Tiger Group", logo: "/developers/tiger-group.webp", className: "bg-cream" },
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
              <img src={publicAsset(partner.logo)} alt={idx < PARTNERS.length ? partner.name : ""} className="max-h-14 max-w-full object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
