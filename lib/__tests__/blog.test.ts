import { describe, it, expect } from "vitest";
import { getAllPosts, getPostMeta, getPost } from "../blog";

describe("blog", () => {
  it("loads six posts", () => {
    expect(getAllPosts()).toHaveLength(6);
  });

  it("sorts newest first", () => {
    const dates = getAllPosts().map((p) => p.date);
    const sorted = [...dates].sort().reverse();
    expect(dates).toEqual(sorted);
  });

  it("gives every post a named author", () => {
    for (const p of getAllPosts()) {
      expect(p.authorSlugs.length).toBeGreaterThan(0);
    }
  });

  it("gives every post a description under 160 characters", () => {
    for (const p of getAllPosts()) {
      expect(p.description.length).toBeLessThanOrEqual(160);
    }
  });

  it("computes a reading time", () => {
    for (const p of getAllPosts()) {
      expect(p.readingMinutes).toBeGreaterThan(0);
    }
  });

  it("looks up one post and returns its body", () => {
    const post = getPost("fisioterapia-apos-avc");
    expect(post?.meta.title).toContain("AVC");
    expect(post?.content).toContain("##");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getPostMeta("nope")).toBeUndefined();
  });
});
