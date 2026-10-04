import { useTranslation } from "react-i18next";
import { Container } from "../components/ui/Container";
import { SectionHeading } from "../components/ui/SectionHeading";
import { publicAsset } from "../lib/utils";

const TEAM_IMAGES = [
  "team/yasmin-shahabi.jpg",
  "team/milad.png",
  "team/fatma-hasan.jpg",
  "team/sarah-alotaibi.jpg",
];

export default function About() {
  const { t } = useTranslation();
  const team = t("about.team", { returnObjects: true }) as unknown as { name: string; role: string }[];

  return (
    <div className="bg-navy">
      <section className="py-16 sm:py-24">
        <Container className="mx-auto max-w-3xl text-center">
          <h1 className="font-display-heading text-4xl font-bold text-cream sm:text-5xl">{t("about.pageTitle")}</h1>
          <p className="mt-6 text-lg leading-relaxed text-cream/70">{t("about.intro")}</p>
        </Container>
      </section>

      <section className="bg-cream py-16 sm:py-24">
        <Container>
          <SectionHeading tone="dark" eyebrow={t("brand.name")} title={t("about.founderWord")} />
          <div className="mx-auto grid max-w-4xl items-center gap-10 sm:grid-cols-[190px_1fr]">
            <div className="mx-auto rounded-3xl bg-gradient-to-br from-copper/35 via-cream to-navy/15 p-2 shadow-xl shadow-navy-deep/10">
              <div className="aspect-[1198/1313] w-44 overflow-hidden rounded-2xl bg-cream">
                <img src={publicAsset("team/hassan-alsuwaidi-founder.png")} alt={t("about.founder.name")} className="h-full w-full object-cover object-top" />
              </div>
            </div>
            <div>
              <h3 className="font-display-heading text-2xl font-bold text-navy-deep">{t("about.founder.name")}</h3>
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-copper">{t("about.founder.title")}</p>
              <div className="space-y-4 text-sm leading-relaxed text-navy-deep/70">
                <p>{t("about.founder.bio1")}</p>
                <p>{t("about.founder.bio2")}</p>
                <p>{t("about.founder.bio3")}</p>
                <p>{t("about.founder.bio4")}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading eyebrow={t("brand.name")} title={t("about.teamTitle")} />
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {team.map((member, index) => (
              <div key={member.name} className="rounded-3xl border border-cream/10 bg-navy-light p-6 text-center">
                <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border-2 border-copper/40 bg-navy-deep">
                  <img src={publicAsset(TEAM_IMAGES[index])} alt={member.name} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <h4 className="font-display-heading text-lg font-bold text-cream">{member.name}</h4>
                <p className="mt-1 text-sm text-cream/50">{member.role}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
