<p align="center">
  <img src="static/banner.svg" alt="brandcheck" width="900"/>
</p>
<p align="center">
  <strong>Check brand name availability everywhere. One command.</strong><br>
  <sub>Domains · Social Media · App Stores · Mauritius Companies · Trademarks · Dev Platforms</sub>
</p>
<p align="center">
  <img src="https://img.shields.io/npm/v/brandcheck?color=8b5cf6&label=npm"/>
  <img src="https://img.shields.io/badge/platforms-27-6366f1"/>
  <img src="https://img.shields.io/badge/parallel-all_checks-34d399"/>
  <img src="https://img.shields.io/badge/license-MIT-blue"/>
</p>
<p align="center">
  <a href="cursor://anysphere.cursor-deeplink/mcp/install?name=brandcheck&config=eyJ0eXBlIjoic3RkaW8iLCJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImJyYW5kY2hlY2tAbGF0ZXN0Il19"><img src="https://cursor.com/deeplink/mcp-install-dark.svg" alt="Install in Cursor" /></a>
  &nbsp;&nbsp;
  <a href="https://soflution1.github.io/BrandCheck/install.html?name=brandcheck&config=eyJ0eXBlIjoic3RkaW8iLCJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImJyYW5kY2hlY2tAbGF0ZXN0Il19"><img src="https://img.shields.io/badge/Install_via-Web-8b5cf6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xMiAyYTEwIDEwIDAgMSAwIDAgMjAgMTAgMTAgMCAwIDAgMC0yMHoiLz48cGF0aCBkPSJNMiAxMmgyMCIvPjxwYXRoIGQ9Ik0xMiAyYTEwIDEwIDAgMCAxIDggOCAxMCAxMCAwIDAgMS04IDgiLz48cGF0aCBkPSJNMTIgMmExMCAxMCAwIDAgMC04IDggMTAgMTAgMCAwIDAgOCA4Ii8+PC9zdmc+" alt="Install via Web" /></a>
</p>

---

## What it checks

| Category | Platforms |
|----------|-----------|
| 🌐 **Domains** | `.mu` (RDAP) · `.com` `.fr` `.io` `.co` `.app` `.ai` `.dev` `.org` `.net` `.eu` |
| 📱 **Social** | X · Instagram · TikTok · LinkedIn · Facebook · YouTube · Threads · Pinterest · Reddit · Snapchat · Bluesky |
| 📲 **App Stores** | Apple App Store · Google Play |
| 🏢 **Companies** | Mauritius CBRD (official manual-verification link) |
| ⚖️ **Trademarks** | Mauritius IPOM/WIPO · INPI France (manual-verification links) |
| 💻 **Tech** | npm · GitHub |

**29 sources checked in parallel.** Network-dependent results usually return within a few seconds.

---

## Quick Start

### Command line

Install this fork and run the complete check:

```bash
npm install
npm link
check-brand "DodoWeb"
```

For the Mauritius-specific checks only:

```bash
check-brand "DodoWeb" --mauritius-only
```

Use `--json` for machine-readable output or `--markdown` for a report.

### MCP option 1: Cursor (one-click)

Click the **"Install MCP Server"** button above. Done.

### MCP option 2: Manual (any MCP client)

Add to your MCP config (`~/.cursor/mcp.json`, Claude Desktop, etc.):

```json
{
  "mcpServers": {
    "brandcheck": {
      "command": "npx",
      "args": ["-y", "brandcheck@latest"]
    }
  }
}
```

### MCP option 3: npx (zero install)

```bash
npx brandcheck@latest
```

---

## Tools

### `brandcheck`

Full audit across all platforms. One command, everything in parallel.

```
"Check if the name Luminova is available"
```

Returns a complete report with availability status per platform, recommendations on .com/.fr availability, and INPI trademark warnings.

### `brandcheck_domains`

Domain-only check. Fast.

```
"Check domains for roompilot"
```

### `brandcheck_social`

Social media handles only.

```
"Is the handle clickstay available on social media?"
```

---

## Example Output

```
🔍 Brand Check: "luminova"

Résumé: ✅ 18 dispo · ❌ 7 pris · ❓ 2 incertain

🌐 Noms de domaine
| .com  | ❌ Pris  | https://luminova.com  |
| .fr   | ✅ Dispo | https://luminova.fr   |
| .io   | ✅ Dispo | https://luminova.io   |
| .ai   | ✅ Dispo | https://luminova.ai   |

📱 Réseaux sociaux
| Instagram | ❌ Pris  | https://instagram.com/luminova |
| TikTok    | ✅ Dispo | https://tiktok.com/@luminova   |
| LinkedIn  | ✅ Dispo | https://linkedin.com/company/luminova |

💡 Recommandation
⚠️ Le .com est pris mais le .fr est dispo.
✅ Aucune marque identique trouvée à l'INPI.
```

---

## How it works

All checks run **in parallel**:
- **.mu domain**: registry RDAP; a 404 means no registration record was found but still requires registrar confirmation
- **Other domains**: DNS resolution, reported as unknown—not available—when no record is found
- **Social media**: HTTP HEAD/GET requests checking for 404 vs 200
- **App Store**: iTunes Search API
- **Mauritius companies**: official CBRD search link; the site requires an interactive Turnstile check
- **Mauritius trademarks**: official WIPO/IPOM entry point covering national and Madrid collections
- **Google Play and INPI**: manual-review links rather than unreliable scraping
- **npm/GitHub**: Registry and profile checks

**No API keys required.** Automated checks use public endpoints; restricted registries are never bypassed.

---

## Limitations

- Social media checks rely on HTTP status codes. Some platforms may rate-limit or return ambiguous results (shown as ❓).
- CBRD and WIPO require manual verification. WIPO's terms prohibit automatic querying of the Global Brand Database.
- Trademark and company-name results are screening aids, not legal clearance. Always consult a qualified professional before filing.
- App Store results are keyword-based. A "no exact match" doesn't guarantee the name is available for submission.

---

## Also by Soflution

- **[depsonar](https://github.com/Soflution1/depsonar)** — The most complete dependency audit MCP server. 9 languages, 23 tools. Scan, audit, update, migrate.

---

## License

MIT
