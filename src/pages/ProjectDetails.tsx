import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, Building2, BedDouble, Ruler, CalendarClock, FileText, MessageCircle, ArrowRight } from "lucide-react";
import type { Project } from "../types/project";
import { fetchProjectBySlug, fetchSimilarProjects } from "../services/projectsService";
import { localized, formatPrice, formatBedrooms, formatHandover } from "../lib/format";
import { Container } from "../components/ui/Container";
import { StatusBadge } from "../components/projects/StatusBadge";
import { Badge } from "../components/ui/Badge";
import { LinkButton, AnchorButton } from "../components/ui/Button";
import { ProjectCard } from "../components/projects/ProjectCard";
import { bilingualWhatsAppMessage, whatsappUrl } from "../lib/whatsapp";

export default function ProjectDetails() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [similar, setSimilar] = useState<Project[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setProject(undefined);
    setLoadError(false);
    fetchProjectBySlug(slug).then((p) => setProject(p ?? null)).catch(() => {
      setLoadError(true);
      setProject(null);
    });
    fetchSimilarProjects(slug).then(setSimilar).catch(() => setSimilar([]));
    setActiveImage(0);
  }, [slug]);

  if (project === undefined) {
    return (
      <div className="bg-navy py-24">
        <Container>
          <div className="h-96 animate-pulse rounded-3xl bg-navy-light" />
        </Container>
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="bg-navy py-24 text-center">
        <Container>
          <h1 className="font-display-heading text-3xl font-bold text-cream">{loadError ? t("common.loadError") : t("projectDetails.notFound")}</h1>
          {!loadError && <p className="mt-3 text-cream/60">{t("projectDetails.notFoundText")}</p>}
          <LinkButton to="/projects" className="mt-8">
            {t("common.backToProjects")}
          </LinkButton>
        </Container>
      </div>
    );
  }

  const gallery = project.gallery.length > 0 ? project.gallery : [project.coverImage];
  const message = bilingualWhatsAppMessage(
    `مرحبًا، أنا مهتم بمشروع "${project.title.ar}" وأرغب بمعرفة المزيد من التفاصيل.`,
    `Hello, I'm interested in the "${project.title.en}" project and would like more details.`
  );

  return (
    <div className="bg-navy pb-20 pt-10 sm:pt-16">
      <Container>
        <Link to="/projects" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-cream/60 hover:text-copper">
          <ArrowRight size={16} className="ltr:rotate-180" />
          {t("common.backToProjects")}
        </Link>

        {/* Gallery */}
        <div className="mb-10">
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-navy-deep">
            <img src={gallery[activeImage].url} alt={localized(gallery[activeImage].alt, lang)} className="h-full w-full object-cover" />
            <div className="absolute end-4 top-4">
              <StatusBadge status={project.status} />
            </div>
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {gallery.map((g, idx) => (
                <button
                  key={g.id}
                  onClick={() => setActiveImage(idx)}
                  aria-label={`${t("projectDetails.gallery")} ${idx + 1}`}
                  aria-pressed={idx === activeImage}
                  className={`h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                    idx === activeImage ? "border-copper" : "border-transparent opacity-60"
                  }`}
                >
                  <img src={g.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Main content */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-cream/60">
              <MapPin size={16} className="text-copper" />
              {localized(project.area, lang)} · {t(`emirates.${project.emirate}`)}
            </div>
            <h1 className="font-display-heading text-3xl font-bold text-cream sm:text-4xl">{localized(project.title, lang)}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-xl font-bold text-copper">
                {t("projectDetails.priceFrom")}: {t("common.aed")} {formatPrice(project.priceFrom, lang)}
              </span>
              {project.isPriceEstimated && <Badge variant="neutral">{t("common.estimated")}</Badge>}
            </div>

            <p className="mt-6 whitespace-pre-line leading-relaxed text-cream/75">{localized(project.description, lang)}</p>

            {/* Details grid */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <DetailItem icon={Building2} label={t("projectDetails.developer")} value={localized(project.developer, lang)} />
              <DetailItem icon={MapPin} label={t("projectDetails.propertyType")} value={t(`propertyTypes.${project.propertyType}`)} />
              <DetailItem
                icon={BedDouble}
                label={t("projectDetails.bedroomsRange")}
                value={formatBedrooms(project.bedrooms, lang, t("common.studio"), t("common.bedroomsShort"))}
              />
              {(project.areaSqftFrom || project.areaSqftTo) && (
                <DetailItem
                  icon={Ruler}
                  label={t("projectDetails.areaRange")}
                  value={`${project.areaSqftFrom ?? "—"} - ${project.areaSqftTo ?? "—"} ${t("common.sqft")}`}
                />
              )}
              <DetailItem icon={CalendarClock} label={t("projectDetails.handover")} value={formatHandover(project.handoverDate, project.handoverLabel, lang)} />
              {project.paymentPlan && <DetailItem icon={FileText} label={t("projectDetails.paymentPlan")} value={localized(project.paymentPlan, lang)} wide />}
            </div>

            {(project.brochureAr || project.brochureEn) && (
              <div className="mt-8 flex flex-wrap gap-3">
                {project.brochureAr && (
                  <AnchorButton href={project.brochureAr} variant="secondary" icon={<FileText size={16} />}>
                    {t("projectDetails.brochureAr")}
                  </AnchorButton>
                )}
                {project.brochureEn && (
                  <AnchorButton href={project.brochureEn} variant="secondary" icon={<FileText size={16} />}>
                    {t("projectDetails.brochureEn")}
                  </AnchorButton>
                )}
              </div>
            )}
          </div>

          {/* Sidebar CTA */}
          <aside>
            <div className="sticky top-28 rounded-3xl border border-copper/20 bg-navy-light p-7 text-center">
              <h3 className="font-display-heading text-xl font-bold text-cream">{t("projectDetails.interested")}</h3>
              <p className="mt-2 text-sm text-cream/60">{t("consultation.subtitle")}</p>
              <div className="mt-6 flex flex-col gap-3">
                <LinkButton to={`/consultation?project=${encodeURIComponent(project.slug)}`} className="w-full">
                  {t("projectDetails.requestInfo")}
                </LinkButton>
                <AnchorButton
                  href={whatsappUrl(message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="secondary"
                  className="w-full"
                  icon={<MessageCircle size={16} />}
                >
                  {t("common.whatsapp")}
                </AnchorButton>
              </div>
            </div>
          </aside>
        </div>

        {/* Similar projects */}
        {similar.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display-heading mb-6 text-2xl font-bold text-cream">{t("projectDetails.similar")}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  wide,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-cream/10 bg-navy-light p-4 ${wide ? "col-span-2 sm:col-span-3" : ""}`}>
      <div className="mb-1.5 flex items-center gap-1.5 text-xs text-cream/50">
        <Icon size={14} className="text-copper" />
        {label}
      </div>
      <div className="text-sm font-semibold text-cream">{value}</div>
    </div>
  );
}
