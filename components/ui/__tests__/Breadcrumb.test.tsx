import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Breadcrumb } from "../Breadcrumb";

/*
  A trilha visível e o BreadcrumbList do JSON-LD saem do mesmo array — é assim
  que eles não voltam a discordar, que era o estado anterior: as três páginas de
  índice emitiam o schema e não desenhavam trilha nenhuma.

  O que este teste prende é a única regra que o componente aplica em cima do
  array: o último item é a página atual, entra no schema e não vira link.
*/
describe("Breadcrumb", () => {
  const TRAIL = [
    { name: "Início", path: "/" },
    { name: "Áreas de atuação", path: "/especialidades" },
    { name: "Fisioterapia Neurofuncional", path: "/especialidades/fisioterapia-neurologica" },
  ];

  it("links every ancestor and never the current page", () => {
    render(<Breadcrumb trail={TRAIL} />);
    expect(screen.getByRole("link", { name: "Início" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Áreas de atuação" })).toHaveAttribute(
      "href",
      "/especialidades",
    );
    expect(screen.queryByText("Fisioterapia Neurofuncional")).toBeNull();
  });

  it("still gets you home from a top-level page", () => {
    // Índices e /fisioterapia-domiciliar têm dois itens, então sobra só o
    // "Início" — que é justamente o voltar-para-a-home que faltava fora do logo.
    render(<Breadcrumb trail={TRAIL.slice(0, 2)} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/");
  });

  it("renders nothing on the home page itself", () => {
    const { container } = render(<Breadcrumb trail={[{ name: "Início", path: "/" }]} />);
    expect(container.firstChild).toBeNull();
  });

  it("keeps a 44px touch target on every link", () => {
    render(<Breadcrumb trail={TRAIL} />);
    for (const a of screen.getAllByRole("link")) {
      expect(a.className).toContain("min-h-[44px]");
    }
  });
});
