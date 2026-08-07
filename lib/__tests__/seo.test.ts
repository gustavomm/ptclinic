import { describe, it, expect } from "vitest";
import { buildMetadata } from "../seo";
import { clinic } from "@/content/clinic";

describe("buildMetadata", () => {
  it("sets an absolute canonical from the path", () => {
    const m = buildMetadata({
      title: "Pilates",
      description: "d",
      path: "/pilates",
    });
    expect(m.alternates?.canonical).toBe(`${clinic.siteUrl}/pilates`);
  });

  it("mirrors title and description into OpenGraph", () => {
    const m = buildMetadata({ title: "Pilates", description: "d", path: "/pilates" });
    expect(m.openGraph?.title).toBe("Pilates");
    expect(m.openGraph?.description).toBe("d");
    expect(m.openGraph?.locale).toBe("pt_BR");
  });

  it("marks the home path canonical as the bare site URL", () => {
    const m = buildMetadata({ title: "Home", description: "d", path: "/" });
    expect(m.alternates?.canonical).toBe(clinic.siteUrl);
  });

  it("defaults OpenGraph type to website and allows article", () => {
    expect(buildMetadata({ title: "t", description: "d", path: "/" }).openGraph).toMatchObject({
      type: "website",
    });
    expect(
      buildMetadata({ title: "t", description: "d", path: "/blog/x", type: "article" }).openGraph,
    ).toMatchObject({ type: "article" });
  });
});
