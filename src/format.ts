import type { CheckResult } from "./types.js";

const CATEGORY_LABELS: Record<string, string> = {
  domain: "Domains",
  social: "Social media",
  app: "App stores",
  company: "Mauritius company names",
  trademark: "Trademarks",
  tech: "Developer platforms",
};

function symbol(result: CheckResult): string {
  if (result.available === true) return "✓";
  if (result.available === false) return "✗";
  return result.status === "warning" ? "⚠" : "?";
}

export function formatText(name: string, results: CheckResult[], color = false): string {
  const paint = (value: string, code: number) => color ? `\u001b[${code}m${value}\u001b[0m` : value;
  const lines = [`Brand check: "${name}"`];
  let current = "";
  for (const result of results) {
    if (result.category !== current) {
      current = result.category;
      lines.push("", CATEGORY_LABELS[current] ?? current);
    }
    const icon = symbol(result);
    const colored = paint(icon, result.available === true ? 32 : result.available === false ? 31 : 33);
    const detail = result.detail ? ` — ${result.detail}` : "";
    lines.push(`${colored} ${result.platform}${detail}`);
    if (result.url) lines.push(`  ${result.url}`);
  }
  lines.push("", "Screening only: confirm domains with a registrar and obtain professional clearance before adopting a company name or trademark.");
  return lines.join("\n");
}

export function formatMarkdown(name: string, results: CheckResult[]): string {
  const lines = [`# Brand check: “${name}”`];
  let current = "";
  for (const result of results) {
    if (result.category !== current) {
      current = result.category;
      lines.push("", `## ${CATEGORY_LABELS[current] ?? current}`, "");
    }
    const detail = result.detail ? ` — ${result.detail}` : "";
    lines.push(`${symbol(result)} [${result.platform}](${result.url})${detail}`);
  }
  lines.push("", "> Screening only: confirm domains with a registrar and obtain professional clearance before adopting a company name or trademark.");
  return lines.join("\n");
}
