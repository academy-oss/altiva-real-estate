import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Container } from "../ui/Container";
import { LinkButton } from "../ui/Button";

export function AboutTeaser() {
  const { t } = useTranslation();

  return (
    <section className="bg-cream py-20 sm:py-28">
      <Container className="mx-auto max-w-3xl text-center">
        <div className="mb-4 flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-copper">
          <span className="h-px w-8 bg-gold-gradient" />
          {t("home.about.title")}
        </div>
        <p className="text-lg leading-relaxed text-navy-deep/75 sm:text-xl">{t("home.about.text")}</p>
        <div className="mt-8">
          <LinkButton to="/about" variant="secondary" size="md" icon={<ArrowRight size={16} className="rtl:rotate-180" />} className="border-navy-deep/20 text-navy-deep hover:bg-navy-deep/5">
            {t("common.learnMore")}
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
