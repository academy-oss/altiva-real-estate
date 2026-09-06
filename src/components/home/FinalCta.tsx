import { useTranslation } from "react-i18next";
import { LinkButton } from "../ui/Button";
import { Container } from "../ui/Container";

export function FinalCta() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-navy-deep py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-gold-radial" />
      <Container className="relative mx-auto max-w-2xl text-center">
        <h2 className="font-display-heading text-3xl font-bold text-cream sm:text-4xl">{t("home.finalCta.title")}</h2>
        <p className="mt-4 text-base text-cream/70 sm:text-lg">{t("home.finalCta.subtitle")}</p>
        <div className="mt-8">
          <LinkButton to="/consultation" size="lg">
            {t("home.finalCta.cta")}
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
