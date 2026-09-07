import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, Phone, Mail, MessageCircle, FileText } from "lucide-react";
import logo from "../../assets/brand/altiva-icon.png";
import { Container } from "../ui/Container";
import { whatsappUrl } from "../../lib/whatsapp";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-cream/10 bg-navy-deep">
      <Container className="grid gap-12 py-16 md:grid-cols-4">
        <div className="text-center md:col-span-2 md:text-start">
          <Link to="/" className="flex items-center justify-center gap-2.5 md:justify-start">
            <img src={logo} alt="ALTIVA" className="h-9 w-auto" />
            <span className="font-display-heading text-2xl font-bold text-copper">
              {t("brand.name")} <span className="text-sm font-normal text-cream/60">{t("brand.tagline")}</span>
            </span>
          </Link>
          <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-cream/60 md:mx-0">{t("footer.aboutText")}</p>
          <div className="mt-6 flex items-center justify-center gap-3 md:justify-start">
            <a
              href="https://www.facebook.com/profile.php?id=61590010035394"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 text-cream/70 transition-colors hover:border-copper hover:text-copper"
              aria-label="Facebook"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current">
                <path d="M14 8.5V7c0-.8.5-1 1.2-1H17V3h-2.6C11.8 3 10 4.7 10 7v1.5H7V12h3v9h4v-9h2.7l.5-3.5H14Z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/altiva_properties?igsh=MWI1a2pyYXRscWh3Yg=="
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 text-cream/70 transition-colors hover:border-copper hover:text-copper"
              aria-label="Instagram"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.3" cy="6.7" r="1" className="fill-current stroke-none" />
              </svg>
            </a>
          </div>
        </div>

        <div className="text-center md:text-start">
          <h3 className="font-display-heading text-lg font-bold text-cream">{t("footer.quickLinks")}</h3>
          <ul className="mt-5 space-y-3 text-sm text-cream/70">
            <li><Link to="/" className="hover:text-copper">{t("nav.home")}</Link></li>
            <li><Link to="/about" className="hover:text-copper">{t("nav.about")}</Link></li>
            <li><Link to="/projects" className="hover:text-copper">{t("nav.projects")}</Link></li>
            <li><Link to="/consultation" className="hover:text-copper">{t("nav.consultation")}</Link></li>
            <li><Link to="/privacy" className="hover:text-copper">{t("nav.privacy")}</Link></li>
          </ul>
        </div>

        <div className="text-center">
          <h3 className="font-display-heading text-lg font-bold text-cream">{t("footer.contactTitle")}</h3>
          <ul className="mt-5 space-y-5 text-center text-sm text-cream/70">
            <li className="flex flex-col items-center gap-2 text-center">
              <MapPin size={18} className="mt-0.5 shrink-0 text-copper" />
              <span>{t("footer.address")}</span>
            </li>
            <li className="flex flex-col items-center gap-2 text-center">
              <MessageCircle size={18} className="shrink-0 text-copper" />
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="hover:text-copper">
                <bdi dir="ltr">+965 5777 5289</bdi>
              </a>
            </li>
            <li className="flex flex-col items-center gap-2 text-center">
              <Phone size={18} className="shrink-0 text-copper" />
              <a href="tel:+9652220035" className="hover:text-copper">
                <bdi dir="ltr">+965 2220035</bdi>
              </a>
            </li>
            <li className="flex flex-col items-center gap-2 text-center">
              <Mail size={18} className="shrink-0 text-copper" />
              <a href="mailto:sales@altivaproperties.com" className="hover:text-copper">
                <bdi dir="ltr">sales@altivaproperties.com</bdi>
              </a>
            </li>
          </ul>
          <div className="mt-5 space-y-2 text-sm text-cream/70">
            <a
              href={`${import.meta.env.BASE_URL}downloads/altiva-company-profile-ar.pdf`}
              download
              className="flex items-center justify-center gap-2 hover:text-copper"
            >
              <FileText size={16} />
              <span>{t("footer.companyProfileAr")}</span>
            </a>
            <a
              href={`${import.meta.env.BASE_URL}downloads/altiva-company-profile-en.pdf`}
              download
              className="flex items-center justify-center gap-2 hover:text-copper"
            >
              <FileText size={16} />
              <span>{t("footer.companyProfileEn")}</span>
            </a>
          </div>
        </div>
      </Container>

      <div className="border-t border-cream/10 py-6">
        <p className="text-center text-xs text-cream/40">
          © {new Date().getFullYear()} {t("brand.name")} {t("brand.tagline")} — {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
