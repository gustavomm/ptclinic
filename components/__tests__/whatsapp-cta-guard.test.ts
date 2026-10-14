import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");
const SOURCE_DIRS = ["app", "components", "content", "lib"];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (name === "__tests__" || name === "node_modules") return [];
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(tsx?|mdx?)$/.test(name) ? [full] : [];
  });
}

const files = SOURCE_DIRS.flatMap((dir) => sourceFiles(path.join(ROOT, dir)));
const rel = (file: string) => path.relative(ROOT, file);

/** A JSX href, a markdown link, or an absolute URL pointing at /whatsapp. */
const LINK_TO_WHATSAPP_ROUTE =
  /href=\{?\s*["'`]\/whatsapp(?![\w-])|\]\(\s*\/whatsapp(?![\w-])|vytafisioterapia\.com\.br\/whatsapp(?![\w-])/;
const WHATSAPP_DEEPLINK = /wa\.me\/|api\.whatsapp\.com/;

describe("WhatsApp CTAs", () => {
  // A raw link to /whatsapp still counts as an Ads conversion in GTM, but
  // skips trackWhatsAppClick: no code handoff, no GA4 event, no Sheet row.
  it("link to /whatsapp only through WhatsAppLink", () => {
    const offenders = files
      .filter((file) => rel(file) !== path.join("components", "WhatsAppLink.tsx"))
      .filter((file) => LINK_TO_WHATSAPP_ROUTE.test(readFileSync(file, "utf8")))
      .map(rel);
    expect(offenders).toEqual([]);
  });

  // A direct wa.me link skips /whatsapp altogether: no conversion, no code.
  it("never link to WhatsApp directly; only /whatsapp builds that URL", () => {
    const offenders = files
      .filter((file) => rel(file) !== path.join("lib", "whatsapp.ts"))
      .filter((file) => WHATSAPP_DEEPLINK.test(readFileSync(file, "utf8")))
      .map(rel);
    expect(offenders).toEqual([]);
  });

  it.each([
    ['<a href="/whatsapp">', true],
    ["<a href={'/whatsapp'}>", true],
    ["[fale conosco](/whatsapp)", true],
    ["https://www.vytafisioterapia.com.br/whatsapp", true],
    ['<a href="/whatsapp-grupo">', false],
    ['<Link href="/pilates">', false],
  ])("recognises %s as a link to the route: %s", (source, expected) => {
    expect(LINK_TO_WHATSAPP_ROUTE.test(source)).toBe(expected);
  });
});
