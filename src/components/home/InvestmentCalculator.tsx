import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Info, MessageCircle } from "lucide-react";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { AnchorButton } from "../ui/Button";
import { bilingualWhatsAppMessage, whatsappUrl } from "../../lib/whatsapp";

type CalcType = "villa" | "tower" | "resort";

const YIELD_RATES: Record<CalcType, number> = {
  villa: 0.08,
  tower: 0.09,
  resort: 0.07,
};

const MIN_AMOUNT = 50_000;
const MAX_AMOUNT = 1_000_000;

export function InvestmentCalculator() {
  const { t, i18n } = useTranslation();
  const [amount, setAmount] = useState(200_000);
  const [type, setType] = useState<CalcType>("villa");

  const estimatedReturn = useMemo(() => Math.round((amount * YIELD_RATES[type]) / 1000) * 1000, [amount, type]);

  const numberFormatter = new Intl.NumberFormat(i18n.language === "ar" ? "ar-KW" : "en-KW");

  const message = bilingualWhatsAppMessage(
    `مرحبًا، أرغب بمعرفة المزيد عن فرص الاستثمار العقاري في دولة الإمارات. مبلغ استثماري التقريبي هو ${new Intl.NumberFormat("ar-KW").format(amount)} د.ك.`,
    `Hello, I'd like to learn more about real estate investment opportunities in the UAE. My approximate investment amount is KWD ${new Intl.NumberFormat("en-KW").format(amount)}.`
  );

  return (
    <section className="bg-cream py-20 sm:py-28">
      <Container className="mx-auto max-w-3xl">
        <SectionHeading tone="dark" eyebrow={t("brand.name")} title={t("home.calculator.title")} subtitle={t("home.calculator.subtitle")} />

        <div className="rounded-3xl border border-navy-deep/5 bg-white p-6 shadow-sm sm:p-10">
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between text-sm font-semibold text-navy-deep">
              <span>{t("home.calculator.amountLabel")}</span>
              <span dir="ltr">{numberFormatter.format(amount)} د.ك</span>
            </div>
            <input
              type="range"
              className="gold-range w-full"
              min={MIN_AMOUNT}
              max={MAX_AMOUNT}
              step={10_000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <div className="mt-2 flex justify-between text-xs text-navy-deep/40" dir="ltr">
              <span>{numberFormatter.format(MIN_AMOUNT)}</span>
              <span>{numberFormatter.format(MAX_AMOUNT)}</span>
            </div>
          </div>

          <div className="mb-8">
            <span className="mb-3 block text-sm font-semibold text-navy-deep">{t("home.calculator.typeLabel")}</span>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(YIELD_RATES) as CalcType[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                    type === key ? "border-copper bg-copper/10 text-navy-deep" : "border-cream-dark text-navy-deep/50 hover:border-copper/40"
                  }`}
                >
                  {t(`home.calculator.types.${key}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-navy-deep p-6 text-center">
            <p className="text-sm text-cream/60">{t("home.calculator.resultLabel")}</p>
            <p className="mt-2 font-display-heading text-3xl font-bold text-copper sm:text-4xl" dir="ltr">
              {numberFormatter.format(estimatedReturn)} د.ك
            </p>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-copper/20 bg-copper/5 px-4 py-3 text-start text-xs leading-6 text-navy-deep/60">
            <Info size={16} className="mt-1 shrink-0 text-copper" aria-hidden="true" />
            <p>{t("home.calculator.disclaimer")}</p>
          </div>

          <div className="mt-6 flex justify-center">
            <AnchorButton
              href={whatsappUrl(message)}
              target="_blank"
              rel="noopener noreferrer"
              icon={<MessageCircle size={18} />}
            >
              {t("common.whatsapp")}
            </AnchorButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
