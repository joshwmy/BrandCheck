import { fetchWithTimeout } from "../http.js";
import type { CheckResult } from "../types.js";

export const CBRD_SEARCH_URL = "https://onlinesearch.mns.global/";
export const WIPO_MAURITIUS_URL = "https://www.wipo.int/en/web/country-profiles/MU";
const MU_RDAP_URL = "https://rdap.identitydigital.services/rdap/domain/";

export function normalizeBusinessName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(limited|ltd|incorporated|inc|company|co|societe|llc|plc)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function similarity(left: string, right: string): number {
  const a = normalizeBusinessName(left);
  const b = normalizeBusinessName(right);
  if (!a || !b) return 0;
  if (a === b) return 1;

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const above = previous[j];
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }
  return 1 - previous[b.length] / Math.max(a.length, b.length);
}

export async function checkMuDomain(name: string): Promise<CheckResult> {
  const domain = `${name}.mu`;
  const url = `https://${domain}`;
  try {
    const response = await fetchWithTimeout(`${MU_RDAP_URL}${encodeURIComponent(domain)}`, {
      headers: { Accept: "application/rdap+json, application/json" },
    });
    if (response.ok) {
      return { platform: ".mu", category: "domain", url, available: false, status: "taken", detail: "Registered in the .mu RDAP registry" };
    }
    if (response.status === 404) {
      return {
        platform: ".mu",
        category: "domain",
        url,
        available: true,
        status: "available",
        detail: "No RDAP registration found; confirm with a registrar before purchase",
      };
    }
    return { platform: ".mu", category: "domain", url, available: null, status: "unknown", detail: `Registry returned HTTP ${response.status}` };
  } catch (error) {
    return { platform: ".mu", category: "domain", url, available: null, status: "error", detail: error instanceof Error ? error.message : "RDAP request failed" };
  }
}

export async function checkMauritiusCompany(name: string): Promise<CheckResult> {
  return {
    platform: "Mauritius CBRD",
    category: "company",
    url: CBRD_SEARCH_URL,
    available: null,
    status: "warning",
    detail: `Search “${name}” manually. CBRD requires an interactive anti-bot check, so availability cannot be verified safely by this CLI.`,
  };
}

export async function checkMauritiusTrademark(name: string): Promise<CheckResult> {
  return {
    platform: "Mauritius trademarks (IPOM/WIPO)",
    category: "trademark",
    url: WIPO_MAURITIUS_URL,
    available: null,
    status: "warning",
    detail: `Search “${name}” in the Mauritius national and Madrid collections. WIPO prohibits automated querying; review similar marks and relevant Nice classes manually.`,
  };
}
