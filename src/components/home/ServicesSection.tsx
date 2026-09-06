import { useTranslation } from "react-i18next";
import { Sparkles, Home as HomeIcon, ShieldCheck, CheckCircle2, Building2 } from "lucide-react";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";

const ICONS = [Sparkles, HomeIcon, ShieldCheck, CheckCircle2, Building2];

export function ServicesSection() {
  const { t } = useTranslation();
  const items = t("home.services.items", { returnObjects: true }) as unknown as { title: string; text: string }[];

  return (
    <section className="bg-navy py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={t("brand.name")} title={t("home.services.title")} subtitle={t("home.services.subtitle")} />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => {
            const Icon = ICONS[idx % ICONS.length];
            return (
              <div key={item.title} className="rounded-3xl border border-cream/10 bg-navy-light p-7 transition-colors hover:border-copper/30">
                <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gold-gradient text-navy-deep">
                  <Icon size={24} />
                </div>
                <h3 className="font-display-heading text-lg font-bold text-cream">{item.title}</h3>
                <p className="mt-2 text-sm text-cream/60">{item.text}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
