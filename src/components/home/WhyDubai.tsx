import { useTranslation } from "react-i18next";
import { TrendingUp, Users, ShieldCheck, Compass } from "lucide-react";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";

const ICONS = [TrendingUp, Users, ShieldCheck, Compass];

export function WhyDubai() {
  const { t } = useTranslation();
  const cards = t("home.whyDubai.cards", { returnObjects: true }) as unknown as { title: string; text: string }[];

  return (
    <section id="why-dubai" className="bg-cream py-20 sm:py-28">
      <Container>
        <SectionHeading
          tone="dark"
          eyebrow={t("brand.name")}
          title={t("home.whyDubai.title")}
          subtitle={t("home.whyDubai.subtitle")}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, idx) => {
            const Icon = ICONS[idx % ICONS.length];
            return (
              <div key={card.title} className="rounded-3xl border border-navy-deep/5 bg-white p-7 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-cream-dark text-navy-deep">
                  <Icon size={26} />
                </div>
                <h3 className="font-display-heading text-lg font-bold text-navy-deep">{card.title}</h3>
                <p className="mt-2 text-sm text-navy-deep/60">{card.text}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
