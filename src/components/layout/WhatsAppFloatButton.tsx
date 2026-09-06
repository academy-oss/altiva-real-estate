import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "96557775289";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hello, I'd like to learn more about the best investment opportunities available with Altiva in Dubai."
);

export function WhatsAppFloatButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 end-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gold-gradient text-navy-deep shadow-gold-lg btn-shine transition-transform hover:scale-105"
      aria-label="WhatsApp"
    >
      <MessageCircle size={26} fill="currentColor" />
    </a>
  );
}
