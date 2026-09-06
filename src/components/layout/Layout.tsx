import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isRtl } from "../../i18n";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppFloatButton } from "./WhatsAppFloatButton";

export function Layout() {
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const dir = isRtl(i18n.language) ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-navy text-cream">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloatButton />
    </div>
  );
}
