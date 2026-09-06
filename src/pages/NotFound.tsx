import { useTranslation } from "react-i18next";
import { Container } from "../components/ui/Container";
import { LinkButton } from "../components/ui/Button";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[60vh] items-center bg-navy py-24">
      <Container className="mx-auto max-w-lg text-center">
        <p className="font-display-heading text-7xl font-bold text-copper">404</p>
        <h1 className="font-display-heading mt-4 text-2xl font-bold text-cream">{t("projectDetails.notFound")}</h1>
        <div className="mt-8">
          <LinkButton to="/">{t("nav.home")}</LinkButton>
        </div>
      </Container>
    </div>
  );
}
