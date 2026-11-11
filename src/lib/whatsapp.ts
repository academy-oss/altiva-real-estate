export const WHATSAPP_NUMBER = "96557775289";

export function bilingualWhatsAppMessage(arabic: string, english: string) {
  return `${arabic}\n\n${english}`;
}

export const GENERAL_WHATSAPP_MESSAGE = bilingualWhatsAppMessage(
  "مرحبًا، أرغب بمعرفة المزيد عن أفضل الفرص العقارية والاستثمارية المتاحة لدى ألتيفا في دول الخليج.",
  "Hello, I'd like to learn more about the best GCC real estate investment opportunities available with ALTIVA."
);

export function whatsappUrl(message = GENERAL_WHATSAPP_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
