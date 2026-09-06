import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import logo from "../../assets/brand/altiva-icon.png";
import { LinkButton } from "../ui/Button";
import { Container } from "../ui/Container";
import { cn } from "../../lib/utils";

export function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [i18n.language, location.pathname]);

  const toggleLanguage = () => {
    const next = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(next);
  };

  const navItems = [
    { to: "/", label: t("nav.home") },
    { to: "/about", label: t("nav.about") },
    { to: "/projects", label: t("nav.projects") },
    { to: "/contact", label: t("nav.contact") },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        scrolled || open ? "bg-navy-deep/95 backdrop-blur-md border-b border-cream/10" : "bg-transparent"
      )}
    >
      <Container className="flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="ALTIVA" className="h-9 w-auto" />
          <span className="font-display-heading text-2xl font-bold tracking-wide text-copper">{t("brand.name")}</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn("text-sm font-medium transition-colors hover:text-copper", isActive ? "text-copper" : "text-cream/85")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="rounded-full border border-copper/50 px-4 py-1.5 text-sm font-medium text-cream transition-colors hover:bg-copper/10"
            aria-label="Toggle language"
          >
            {i18n.language === "ar" ? "EN" : "عربي"}
          </button>

          <div className="hidden md:block">
            <LinkButton to="/consultation" size="md">
              {t("nav.consultation")}
            </LinkButton>
          </div>

          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-cream/15 text-cream lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </Container>

      {open && (
        <div id="mobile-navigation" className="border-t border-cream/10 bg-navy-deep px-5 pb-6 pt-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn("rounded-lg px-3 py-3 text-base font-medium", isActive ? "bg-copper/10 text-copper" : "text-cream/90")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <LinkButton to="/consultation" size="md" className="mt-4 w-full">
            {t("nav.consultation")}
          </LinkButton>
        </div>
      )}
    </header>
  );
}
