import { lookup } from "node:dns/promises";
import { fetchWithTimeout, httpStatus } from "./http.js";
import { checkMauritiusCompany, checkMauritiusTrademark, checkMuDomain } from "./providers/mauritius.js";
import type { BrandCheckOptions, CheckResult } from "./types.js";

export function cleanHandle(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

async function checkDnsDomain(name: string, tld: string): Promise<CheckResult> {
  const domain = `${name}.${tld}`;
  try {
    await lookup(domain);
    return { platform: `.${tld}`, category: "domain", url: `https://${domain}`, available: false, status: "taken", detail: "DNS records found" };
  } catch (error) {
    const code = error instanceof Error && "code" in error ? String(error.code) : "DNS_ERROR";
    if (code === "ENOTFOUND" || code === "ENODATA") {
      return {
        platform: `.${tld}`,
        category: "domain",
        url: `https://${domain}`,
        available: null,
        status: "unknown",
        detail: "No DNS records found; registration status requires a registrar/RDAP check",
      };
    }
    return { platform: `.${tld}`, category: "domain", url: `https://${domain}`, available: null, status: "unknown", detail: code };
  }
}

async function checkSocial(name: string, platform: string, template: string): Promise<CheckResult> {
  const url = template.replace("{name}", name);
  try {
    const status = await httpStatus(url);
    if (status === 404 || status === 410) return { platform, category: "social", url, available: true, status: "available" };
    if (status === 200) return { platform, category: "social", url, available: false, status: "taken" };
    return { platform, category: "social", url, available: null, status: "unknown", detail: `HTTP ${status}` };
  } catch (error) {
    return { platform, category: "social", url, available: null, status: "error", detail: error instanceof Error ? error.message : "Request failed" };
  }
}

async function checkAppStore(name: string): Promise<CheckResult> {
  const searchUrl = `https://apps.apple.com/mu/search?term=${encodeURIComponent(name)}`;
  try {
    const response = await fetchWithTimeout(`https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=software&limit=10&country=mu`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json() as { resultCount: number; results?: Array<{ trackName?: string; bundleId?: string }> };
    const sought = name.toLowerCase();
    const exact = data.results?.find((item) => item.trackName?.toLowerCase() === sought || item.bundleId?.toLowerCase().includes(sought));
    return exact
      ? { platform: "App Store", category: "app", url: searchUrl, available: false, status: "taken", detail: exact.trackName }
      : { platform: "App Store", category: "app", url: searchUrl, available: true, status: "available", detail: `No exact match among ${data.resultCount} results` };
  } catch (error) {
    return { platform: "App Store", category: "app", url: searchUrl, available: null, status: "error", detail: error instanceof Error ? error.message : "Request failed" };
  }
}

async function checkGooglePlay(name: string): Promise<CheckResult> {
  const url = `https://play.google.com/store/search?q=${encodeURIComponent(name)}&c=apps`;
  return { platform: "Google Play", category: "app", url, available: null, status: "warning", detail: "Review search results manually; store HTML is not a reliable availability signal" };
}

async function checkInpi(name: string): Promise<CheckResult> {
  const url = `https://data.inpi.fr/recherche?q=${encodeURIComponent(name)}&type=marques`;
  return { platform: "INPI (France)", category: "trademark", url, available: null, status: "warning", detail: "Review identical and similar marks manually" };
}

async function checkNpm(name: string): Promise<CheckResult> {
  const url = `https://www.npmjs.com/package/${name}`;
  try {
    const response = await fetchWithTimeout(`https://registry.npmjs.org/${encodeURIComponent(name)}`);
    if (response.status === 404) return { platform: "npm", category: "tech", url, available: true, status: "available" };
    if (response.ok) return { platform: "npm", category: "tech", url, available: false, status: "taken" };
    return { platform: "npm", category: "tech", url, available: null, status: "unknown", detail: `HTTP ${response.status}` };
  } catch (error) {
    return { platform: "npm", category: "tech", url, available: null, status: "error", detail: error instanceof Error ? error.message : "Request failed" };
  }
}

async function checkGitHub(name: string): Promise<CheckResult> {
  const url = `https://github.com/${name}`;
  try {
    const status = await httpStatus(url);
    if (status === 404) return { platform: "GitHub", category: "tech", url, available: true, status: "available" };
    if (status === 200) return { platform: "GitHub", category: "tech", url, available: false, status: "taken" };
    return { platform: "GitHub", category: "tech", url, available: null, status: "unknown", detail: `HTTP ${status}` };
  } catch (error) {
    return { platform: "GitHub", category: "tech", url, available: null, status: "error", detail: error instanceof Error ? error.message : "Request failed" };
  }
}

export async function checkDomains(name: string, tlds?: string[]): Promise<CheckResult[]> {
  const handle = cleanHandle(name);
  const extensions = tlds ?? ["mu", "com", "fr", "io", "co", "app", "ai", "dev", "org", "net", "eu"];
  return Promise.all(extensions.map((tld) => tld.toLowerCase() === "mu" ? checkMuDomain(handle) : checkDnsDomain(handle, tld.toLowerCase())));
}

export async function checkSocials(name: string): Promise<CheckResult[]> {
  const handle = cleanHandle(name);
  const platforms: Array<[string, string]> = [
    ["X", "https://x.com/{name}"],
    ["Instagram", "https://www.instagram.com/{name}/"],
    ["TikTok", "https://www.tiktok.com/@{name}"],
    ["LinkedIn", "https://www.linkedin.com/company/{name}/"],
    ["Facebook", "https://www.facebook.com/{name}"],
    ["YouTube", "https://www.youtube.com/@{name}"],
    ["Threads", "https://www.threads.net/@{name}"],
    ["Pinterest", "https://www.pinterest.com/{name}/"],
    ["Reddit", "https://www.reddit.com/r/{name}"],
    ["Snapchat", "https://www.snapchat.com/add/{name}"],
    ["Bluesky", "https://bsky.app/profile/{name}.bsky.social"],
  ];
  return Promise.all(platforms.map(([platform, template]) => checkSocial(handle, platform, template)));
}

export async function brandCheck(name: string, options: BrandCheckOptions = {}): Promise<CheckResult[]> {
  const handle = cleanHandle(name);
  if (!handle) throw new Error("Brand name must contain at least one letter or number");

  const groups: Array<Promise<CheckResult[]>> = [];
  if (options.domains !== false) groups.push(checkDomains(name));
  if (options.social !== false) groups.push(checkSocials(name));
  if (options.apps !== false) groups.push(Promise.all([checkAppStore(name), checkGooglePlay(name)]));
  if (options.trademark !== false) groups.push(Promise.all([checkInpi(name), checkMauritiusTrademark(name)]));
  if (options.company !== false) groups.push(Promise.all([checkMauritiusCompany(name)]));
  if (options.tech !== false) groups.push(Promise.all([checkNpm(handle), checkGitHub(handle)]));
  return (await Promise.all(groups)).flat();
}
