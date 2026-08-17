import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Reveal } from "../Reveal";

let observerOptions: IntersectionObserverInit | undefined;

beforeEach(() => {
  observerOptions = undefined;
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor(
        private cb: IntersectionObserverCallback,
        options?: IntersectionObserverInit,
      ) {
        observerOptions = options;
      }
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

  // O disparo não pode voltar a depender da altura do bloco. Com uma fração de
  // threshold, um bloco alto só começa a aparecer bem depois de entrar na tela,
  // e o efeito chega atrasado justamente nas seções maiores.
  it("observes at threshold 0, so the trigger point does not depend on block height", () => {
    render(<Reveal>conteúdo</Reveal>);
    expect(observerOptions?.threshold).toBe(0);
  });

  // Margem de baixo positiva = a área de observação passa da dobra e a
  // transição começa antes de o bloco aparecer. Negativa atrasaria o disparo.
  it("extends the observed area past the fold instead of shrinking it", () => {
    render(<Reveal>conteúdo</Reveal>);
    const bottom = String(observerOptions?.rootMargin ?? "").split(/\s+/)[2] ?? "";
    expect(parseFloat(bottom)).toBeGreaterThan(0);
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
