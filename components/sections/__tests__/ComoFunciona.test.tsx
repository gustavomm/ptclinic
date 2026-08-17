import { describe, it, expect, beforeAll, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComoFunciona } from "../ComoFunciona";

beforeAll(() => {
  class Stub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal("IntersectionObserver", Stub);
});

/*
  A revisão de agosto de 2026 devolveu dois passos com *asteriscos*, seguindo a
  convenção que a própria planilha ensina. Como `text` é string e não filho de
  JSX, o `apply` não os converte e eles chegaram literais ao componente. Se o
  `withEmphasis` sumir, os asteriscos voltam a aparecer na home.
*/
describe("ComoFunciona", () => {
  it("turns the review's asterisks into emphasis instead of printing them", () => {
    const { container } = render(<ComoFunciona />);
    expect(container.textContent).not.toContain("*");
    expect(
      screen.getByText("exclusivo para o seu caso").tagName.toLowerCase(),
    ).toBe("em");
    expect(
      screen.getByText("com quem já conhece sua história clínica").tagName.toLowerCase(),
    ).toBe("em");
  });

  it("keeps the surrounding words in the same paragraph", () => {
    render(<ComoFunciona />);
    const p = screen.getByText("exclusivo para o seu caso").closest("p");
    expect(p?.textContent).toBe(
      "Uma sessão inteira para escutar, examinar e testar. O tratamento já começa neste dia, e você sai com um plano definido e exclusivo para o seu caso.",
    );
  });
});
