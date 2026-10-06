import assert from "node:assert/strict";
import test from "node:test";
import { cleanHandle } from "../dist/brand-check.js";
import { formatText } from "../dist/format.js";
import { normalizeBusinessName, similarity } from "../dist/providers/mauritius.js";

test("normalizes Mauritius company suffixes and accents", () => {
  assert.equal(normalizeBusinessName("Société Dodo Web Limited"), "dodo web");
  assert.equal(normalizeBusinessName("DODO-WEB LTD"), "dodo web");
});

test("similarity ranks normalized exact names above variants", () => {
  assert.equal(similarity("Dodo Web Ltd", "Dodo-Web Limited"), 1);
  assert.ok(similarity("Dodo Web", "Dodo Works") > similarity("Dodo Web", "Mauritius Foods"));
});

test("cleans a brand into a safe handle", () => {
  assert.equal(cleanHandle("Dodo Web!"), "dodoweb");
});

test("formats the four-state result vocabulary", () => {
  const output = formatText("DodoWeb", [
    { platform: ".mu", category: "domain", url: "https://dodoweb.mu", available: true, status: "available" },
    { platform: "CBRD", category: "company", url: "https://example.test", available: null, status: "warning" },
  ]);
  assert.match(output, /✓ \.mu/);
  assert.match(output, /⚠ CBRD/);
});
