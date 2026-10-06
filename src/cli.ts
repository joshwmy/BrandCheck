#!/usr/bin/env node
import { brandCheck, checkDomains } from "./brand-check.js";
import { formatMarkdown, formatText } from "./format.js";
import { checkMauritiusCompany, checkMauritiusTrademark } from "./providers/mauritius.js";

function usage(): string {
  return [
    "Usage: check-brand <name> [options]",
    "",
    "Options:",
    "  --mauritius-only   Check .mu, Mauritius CBRD, and Mauritius trademarks",
    "  --json             Output machine-readable JSON",
    "  --markdown         Output Markdown",
    "  --no-color         Disable terminal colors",
    "  -h, --help         Show this help",
  ].join("\n");
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(usage());
  process.exit(0);
}

const flags = new Set(args.filter((argument) => argument.startsWith("-")));
const name = args.filter((argument) => !argument.startsWith("-"))[0];
if (!name) {
  console.error(usage());
  process.exit(1);
}

try {
  const results = flags.has("--mauritius-only")
    ? (await Promise.all([
        checkDomains(name, ["mu"]),
        checkMauritiusTrademark(name),
        checkMauritiusCompany(name),
      ])).flat()
    : await brandCheck(name);
  if (flags.has("--json")) console.log(JSON.stringify({ name, results }, null, 2));
  else if (flags.has("--markdown")) console.log(formatMarkdown(name, results));
  else console.log(formatText(name, results, process.stdout.isTTY && !flags.has("--no-color")));
} catch (error) {
  console.error(`check-brand: ${error instanceof Error ? error.message : "check failed"}`);
  process.exitCode = 1;
}
