import { CONTACT } from '@/lib/config';

/**
 * Builds the canonical WhatsApp link for a call-to-action.
 *
 * El `origen` viaja dentro del propio mensaje ("…desde la página de neveras")
 * para poder atribuir de dónde salió el contacto leyendo la conversación, sin
 * depender de que GTM esté bien configurado ni de un acortador de terceros.
 *
 * @param origen - Dónde se pulsó el botón, en minúsculas y sin punto final
 * @returns URL de wa.me con el mensaje ya codificado
 */
export function whatsappUrl(origen?: string): string {
  const mensaje = origen
    ? `${CONTACT.whatsappMessage.replace(/\.$/, '')} (${origen}).`
    : CONTACT.whatsappMessage;

  return `${CONTACT.whatsappLink}?text=${encodeURIComponent(mensaje)}`;
}

/**
 * Formats a Colombian phone number to a readable format
 * @param phoneNumber - Phone number in format '573016963313' or '+573016963313'
 * @returns Formatted phone number like '+57 301 696 3313'
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove '+' if present
  const cleaned = phoneNumber.replace(/^\+/, '');

  // Validate format (should be 12 digits for Colombian numbers: 57 + 10 digits)
  if (cleaned.length !== 12 || !cleaned.startsWith('57')) {
    return phoneNumber; // Return as-is if format is unexpected
  }

  const countryCode = cleaned.slice(0, 2); // '57'
  const areaCode = cleaned.slice(2, 5); // '301'
  const firstPart = cleaned.slice(5, 8); // '696'
  const lastPart = cleaned.slice(8); // '3313'

  return `+${countryCode} ${areaCode} ${firstPart} ${lastPart}`;
}
