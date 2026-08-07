import { describe, it, expect } from "vitest";
import { contrastRatio } from "../contrast";

describe("palette contrast", () => {
  it("subtle text on surface meets WCAG AA for normal text", () => {
    expect(contrastRatio("#6F695F", "#FAF6F0")).toBeGreaterThanOrEqual(4.5);
  });

  it("subtle text on surface-alt meets WCAG AA for normal text", () => {
    expect(contrastRatio("#6F695F", "#F3EDE4")).toBeGreaterThanOrEqual(4.5);
  });

  it("documents that the original comp value failed", () => {
    expect(contrastRatio("#8a8378", "#FAF6F0")).toBeLessThan(4.5);
  });

  it("muted text on surface meets WCAG AA", () => {
    expect(contrastRatio("#5d6664", "#FAF6F0")).toBeGreaterThanOrEqual(4.5);
  });
});
