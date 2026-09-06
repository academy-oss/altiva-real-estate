import { useTranslation } from "react-i18next";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";

export function TestimonialsSection() {
  const { t, i18n } = useTranslation();
  const items = t("home.testimonials.items", { returnObjects: true }) as unknown as { text: string; name: string; meta: string }[];
  const loopGroups = [items, items];

  return (
    <section className="bg-navy py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={t("brand.name")} title={t("home.testimonials.title")} subtitle={t("home.testimonials.subtitle")} />

      </Container>
      <div className="overflow-hidden" dir="ltr">
        <div className="marquee-track testimonials-marquee">
          {loopGroups.map((group, groupIndex) => (
            <div
              key={groupIndex}
              aria-hidden={groupIndex === 1}
              className={`flex shrink-0 gap-4 pe-4 ${groupIndex === 1 ? "testimonial-duplicate" : ""}`}
            >
              {group.map((item, itemIndex) => (
                <div key={`${item.name}-${itemIndex}`} dir={i18n.dir()} className="flex min-h-40 w-72 shrink-0 flex-col rounded-2xl border border-cream/10 bg-navy-light p-5 text-start">
                  <span className="mb-3 font-display-heading text-3xl text-copper">&rdquo;&rdquo;</span>
                  <p className="flex-1 text-sm leading-relaxed text-cream/80">{item.text}</p>
                  <div className="mt-4 border-t border-cream/10 pt-3">
                    <p className="text-sm font-bold text-cream">{item.name}</p>
                    <p className="text-xs text-cream/50">{item.meta}</p>
                  </div>
                </div>
              ))}
              </div>
          ))}
        </div>
      </div>
    </section>
  );
}
