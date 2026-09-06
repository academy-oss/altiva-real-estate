import { useTranslation } from "react-i18next";
import { Container } from "../components/ui/Container";

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  const sections = t("privacy.sections", { returnObjects: true }) as unknown as { title: string; text: string }[];

  return (
    <div className="bg-navy py-16 sm:py-20">
      <Container className="mx-auto max-w-3xl">
        <h1 className="font-display-heading text-4xl font-bold text-cream sm:text-5xl">{t("privacy.pageTitle")}</h1>
        <p className="mt-3 text-sm text-cream/50">{t("privacy.lastUpdated")}: 1 {new Date().getFullYear()}</p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="rounded-2xl border border-cream/10 bg-navy-light p-6">
              <h2 className="font-display-heading mb-2 text-xl font-bold text-copper">{section.title}</h2>
              <p className="leading-relaxed text-cream/70">{section.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
