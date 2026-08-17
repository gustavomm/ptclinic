import { describe, it, expect, beforeAll, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EspecialidadesGrid } from "../EspecialidadesGrid";
import { specialities } from "@/content/specialities";

// Os cartões vêm dentro de <Reveal>, que observa a entrada em tela. O jsdom não
// traz IntersectionObserver; sem este stub o componente nem monta.
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
  O título da grade traz o número de frentes por extenso, e nada no código
  obriga esse número a bater com o que a grade renderiza. Foi assim que "Oito
  frentes" sobreviveu à saída da drenagem linfática até alguém contar os
  cartões na tela.

  A grade mostra uma área por especialidade mais o cartão do Pilates, que não é
  uma especialidade e por isso não está em `specialities`.
*/
const NUMERAL = [
  "zero",
  "uma",
  "duas",
  "três",
  "quatro",
  "cinco",
  "seis",
  "sete",
  "oito",
  "nove",
  "dez",
];

describe("EspecialidadesGrid", () => {
  const frentes = specialities.length + 1;

  it("renders one card per speciality plus the Pilates card", () => {
    render(<EspecialidadesGrid />);
    expect(screen.getAllByRole("link")).toHaveLength(frentes);
    expect(screen.getByRole("link", { name: /Pilates/ })).toBeInTheDocument();
  });

  it("says the number of frentes that it actually renders", () => {
    render(<EspecialidadesGrid />);
    const heading = screen.getByRole("heading", { name: /frentes/ });
    expect(heading.textContent?.toLowerCase()).toContain(NUMERAL[frentes]);
  });

  it("no longer links to the drenagem linfática page", () => {
    render(<EspecialidadesGrid />);
    const hrefs = screen
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));
    expect(hrefs).not.toContain("/especialidades/drenagem-linfatica");
  });
});
