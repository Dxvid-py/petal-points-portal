import { supabase } from "@/lib/supabase";
import type { SiteContentRow } from "@/lib/types";

export type SiteContentMap = Record<string, { text: string | null; url: string | null }>;

export async function fetchSiteContent(): Promise<SiteContentMap> {
  const { data } = await supabase.from("site_content").select("*");
  const map: SiteContentMap = {};
  (data ?? []).forEach((row: SiteContentRow) => {
    map[row.key] = { text: row.value_text, url: row.value_url };
  });
  return map;
}

export function getText(map: SiteContentMap, key: string, fallback = ""): string {
  return map[key]?.text ?? fallback;
}

export function getUrl(map: SiteContentMap, key: string): string | null {
  return map[key]?.url ?? null;
}
