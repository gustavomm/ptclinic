import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (name === "__tests__" || name === "node_modules") return [];
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(tsx?|mdx)$/.test(name) ? [full] : [];
  });
}

describe("WhatsApp CTAs", () => {
  // A raw link to /whatsapp still counts as an Ads conversion in GTM, but
  // skips trackWhatsAppClick: no code handoff, no GA4 event, no Sheet row.
  it("link to /whatsapp only through WhatsAppLink", () => {
    const offenders = ["app", "components", "content"]
      .flatMap((dir) => sourceFiles(path.join(ROOT, dir)))
      .filter((file) => !file.endsWith(path.join("components", "WhatsAppLink.tsx")))
      .filter((file) => /href=\{?\s*["'`]\/whatsapp(?![\w-])/.test(readFileSync(file, "utf8")))
      .map((file) => path.relative(ROOT, file));
    expect(offenders).toEqual([]);
  });
});
