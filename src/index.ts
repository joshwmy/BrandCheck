#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { brandCheck, checkDomains, checkSocials } from "./brand-check.js";
import { formatMarkdown } from "./format.js";

const server = new McpServer({ name: "brandcheck", version: "1.1.0" });

server.tool(
  "brandcheck",
  "Check a brand across domains (including .mu), social media, app stores, Mauritius CBRD, Mauritius/IPOM-WIPO and French trademarks, npm, and GitHub.",
  {
    name: z.string().describe("Brand name to check"),
    domains: z.boolean().optional(),
    social: z.boolean().optional(),
    apps: z.boolean().optional(),
    trademark: z.boolean().optional(),
    company: z.boolean().optional().describe("Include the Mauritius CBRD check"),
    tech: z.boolean().optional(),
  },
  async ({ name, domains, social, apps, trademark, company, tech }) => {
    try {
      const results = await brandCheck(name, { domains, social, apps, trademark, company, tech });
      return { content: [{ type: "text" as const, text: formatMarkdown(name, results) }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Brand check failed";
      return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true };
    }
  },
);

server.tool(
  "brandcheck_domains",
  "Check domain names, including authoritative RDAP lookup for .mu.",
  { name: z.string().describe("Brand name to check"), tlds: z.array(z.string()).optional() },
  async ({ name, tlds }) => ({
    content: [{ type: "text" as const, text: formatMarkdown(name, await checkDomains(name, tlds)) }],
  }),
);

server.tool(
  "brandcheck_social",
  "Check social media handles.",
  { name: z.string().describe("Handle to check") },
  async ({ name }) => ({
    content: [{ type: "text" as const, text: formatMarkdown(name, await checkSocials(name)) }],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("brandcheck v1.1.0 running on stdio");
