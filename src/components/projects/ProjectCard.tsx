import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import type { Project } from "../../types/project";
import { localized, formatPrice } from "../../lib/format";
import { StatusBadge } from "./StatusBadge";
import { Badge } from "../ui/Badge";

export function ProjectCard({ project }: { project: Project }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-cream/10 bg-navy-light transition-all duration-300 hover:-translate-y-1 hover:border-copper/40 hover:shadow-gold-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-navy-deep">
        <img
          src={project.coverImage.url}
          alt={localized(project.coverImage.alt, lang)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute end-4 top-4">
          <StatusBadge status={project.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="font-display-heading text-xl font-bold text-cream">{localized(project.title, lang)}</h3>

        <div className="flex items-center gap-1.5 text-sm text-cream/60">
          <MapPin size={15} className="shrink-0 text-copper" />
          <span>{localized(project.area, lang)}</span>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          <span className="text-sm font-bold text-copper">
            {t("common.startingFrom")} {t("common.aed")} {formatPrice(project.priceFrom, lang)}
          </span>
          {project.isPriceEstimated && (
            <Badge variant="neutral" className="text-[10px]">
              {t("common.estimated")}
            </Badge>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 border-t border-cream/10 pt-4 text-sm font-semibold text-cream/80 transition-colors group-hover:text-copper">
          {t("common.viewDetails")}
          <ArrowRight size={16} className="rtl:rotate-180" />
        </div>
      </div>
    </Link>
  );
}
