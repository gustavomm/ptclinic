import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Reveal } from "../Reveal";

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor(private cb: IntersectionObserverCallback) {}
    },
  );
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Reveal", () => {
  it("renders its children", () => {
    render(<Reveal>conteúdo</Reveal>);
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });

  it("starts hidden when motion is allowed", () => {
    render(<Reveal>conteúdo</Reveal>);
    expect(screen.getByText("conteúdo")).toHaveAttribute("data-revealed", "false");
  });

  it("renders immediately visible when reduced motion is requested", () => {
    vi.stubGlobal("matchMedia", (q: string) => ({
      matches: true,
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    render(<Reveal>conteúdo</Reveal>);
    expect(screen.getByText("conteúdo")).toHaveAttribute("data-revealed", "true");
  });
});
