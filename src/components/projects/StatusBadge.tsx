import { useTranslation } from "react-i18next";
import type { ProjectStatus } from "../../types/project";
import { Badge } from "../ui/Badge";

const VARIANT_BY_STATUS: Record<ProjectStatus, "gold-solid" | "gold-outline" | "neutral"> = {
  coming_soon: "gold-solid",
  off_plan: "gold-outline",
  ready: "gold-outline",
  sold_out: "neutral",
};

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  const { t } = useTranslation();
  return (
    <Badge variant={VARIANT_BY_STATUS[status]} className={className}>
      {t(`projectStatus.${status}`)}
    </Badge>
  );
}
