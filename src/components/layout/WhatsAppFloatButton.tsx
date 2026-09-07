import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "../../lib/whatsapp";

export function WhatsAppFloatButton() {
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold-gradient text-navy-deep shadow-gold-lg btn-shine transition-transform hover:scale-105"
      style={{
        right: "max(1rem, env(safe-area-inset-right))",
        bottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
      aria-label="WhatsApp"
    >
      <MessageCircle size={26} fill="currentColor" />
    </a>
  );
}
