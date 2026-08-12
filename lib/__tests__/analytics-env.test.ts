import { describe, expect, it } from "vitest";
import { shouldLoadAnalytics } from "../analytics-env";

describe("shouldLoadAnalytics", () => {
  it("não carrega em preview: clique de revisão viraria conversão no Ads", () => {
    expect(shouldLoadAnalytics("preview")).toBe(false);
  });

  it("carrega em produção", () => {
    expect(shouldLoadAnalytics("production")).toBe(true);
  });

  // A polaridade importa: a trava é por "preview", não por "production". Se
  // alguém inverter para `env === "production"`, estes dois casos quebram e é
  // esse o ponto — sem a variável, o site tem que continuar medindo.
  it("carrega quando VERCEL_ENV não existe (build fora da Vercel)", () => {
    expect(shouldLoadAnalytics(undefined)).toBe(true);
  });

  it("carrega quando VERCEL_ENV tem um valor que ninguém previu", () => {
    expect(shouldLoadAnalytics("staging")).toBe(true);
  });
});
