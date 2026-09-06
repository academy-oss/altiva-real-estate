import { useTranslation } from "react-i18next";
import { Container } from "../ui/Container";

const STATS = [
  { value: "23+", labelKey: "home.stats.years" },
  { value: "20+", labelKey: "home.stats.partners" },
  { value: "360°", labelKey: "home.stats.management" },
  { value: "8%+", labelKey: "home.stats.returns" },
];

export function StatsSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-navy-deep py-16">
      <Container className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.labelKey} className="text-center">
            <div className="font-display-heading text-4xl font-bold text-copper sm:text-5xl">{stat.value}</div>
            <p className="mt-3 text-sm text-cream/60">{t(stat.labelKey)}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}
