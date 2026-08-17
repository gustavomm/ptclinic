import { test, expect } from "@playwright/test";

const MAP: Array<[string, string]> = [
  ["/speciality/neurofuncional", "/especialidades/fisioterapia-neurologica"],
  ["/speciality/oncologica", "/especialidades/fisioterapia-oncologica"],
  ["/speciality/ortopedica", "/especialidades/fisioterapia-ortopedica"],
  ["/speciality/gerontologia", "/especialidades/fisioterapia-para-idosos"],
  ["/speciality/respiratoria", "/especialidades/fisioterapia-respiratoria"],
  [
    "/speciality/condicionamento-fisico",
    "/especialidades/fisioterapia-pre-e-pos-cirurgica",
  ],
  // Sem página própria desde agosto de 2026: cai na lista em vez de 404.
  ["/speciality/drenagem-linfatica", "/especialidades"],
  ["/speciality/pilates", "/pilates"],
];

test.describe("legacy URL redirects", () => {
  for (const [from, to] of MAP) {
    test(`${from} permanently redirects to ${to}`, async ({ request }) => {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(res.headers()["location"]).toBe(to);
      expect((await request.get(to)).status()).toBe(200);
    });
  }
});
