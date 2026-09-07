import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "../../lib/whatsapp";

export function WhatsAppFloatButton() {
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 end-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gold-gradient text-navy-deep shadow-gold-lg btn-shine transition-transform hover:scale-105"
      aria-label="WhatsApp"
    >
      <MessageCircle size={26} fill="currentColor" />
    </a>
  );
}
