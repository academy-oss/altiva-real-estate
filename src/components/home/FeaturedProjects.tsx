import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import type { Project } from "../../types/project";
import { fetchFeaturedProjects } from "../../services/projectsService";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { LinkButton } from "../ui/Button";
import { ProjectCard } from "../projects/ProjectCard";

export function FeaturedProjects() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetchFeaturedProjects().then(setProjects).catch(() => {
      setLoadError(true);
      setProjects([]);
    });
  }, []);

  return (
    <section className="bg-navy py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={t("brand.name")} title={t("home.featured.title")} subtitle={t("home.featured.subtitle")} />

        {loadError ? (
          <div role="alert" className="rounded-3xl border border-cream/10 bg-navy-light p-10 text-center text-cream/60">{t("common.loadError")}</div>
        ) : !projects ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-navy-light" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <LinkButton to="/projects" variant="secondary" size="lg" icon={<ArrowRight size={18} className="rtl:rotate-180" />}>
            {t("home.featured.viewAll")}
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
