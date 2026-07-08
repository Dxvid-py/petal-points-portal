import { supabase } from "@/lib/supabase";

/**
 * Devuelve el número de WhatsApp del atelier (solo dígitos, listo para wa.me).
 * Cae al fallback 573011940530 si no hay dato en site_content.
 */
export async function getWhatsAppNumber(): Promise<string> {
  const { data } = await supabase
    .from("site_content")
    .select("value_text")
    .eq("key", "whatsapp_number")
    .maybeSingle();
  const raw = data?.value_text ?? "573011940530";
  return raw.replace(/\D/g, "");
}

export function buildWaLink(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/**
 * Abre WhatsApp con un mensaje de aviso al atelier tras una redención.
 * No bloquea la ejecución si el pop-up es bloqueado.
 */
export async function notifyRedemptionViaWhatsApp(params: {
  clientName: string;
  clientPhone?: string | null;
  rewardTitle: string;
  points: number;
  manual?: boolean;
}) {
  const number = await getWhatsAppNumber();
  const source = params.manual ? "🖥️ Redención manual (presencial)" : "🌸 Nueva redención online";
  const msg =
    `${source}\n\n` +
    `Cliente: ${params.clientName}\n` +
    (params.clientPhone ? `Tel: ${params.clientPhone}\n` : "") +
    `Recompensa: ${params.rewardTitle}\n` +
    `Puntos: ${params.points} pts`;
  const url = buildWaLink(number, msg);
  window.open(url, "_blank", "noopener,noreferrer");
}
