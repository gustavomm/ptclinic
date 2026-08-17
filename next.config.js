/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
  async redirects() {
    return [
      ["/speciality/neurofuncional", "/especialidades/fisioterapia-neurologica"],
      ["/speciality/oncologica", "/especialidades/fisioterapia-oncologica"],
      ["/speciality/ortopedica", "/especialidades/fisioterapia-ortopedica"],
      ["/speciality/gerontologia", "/especialidades/fisioterapia-para-idosos"],
      ["/speciality/respiratoria", "/especialidades/fisioterapia-respiratoria"],
      [
        "/speciality/condicionamento-fisico",
        "/especialidades/fisioterapia-pre-e-pos-cirurgica",
      ],
      // A clínica tirou a drenagem linfática da lista em agosto de 2026. A URL
      // do site legado continua existindo e não pode voltar 404, então aponta
      // para a lista: o linfedema, que era o motivo clínico de quem chegava por
      // aqui, é tratado dentro da fisioterapia oncológica.
      ["/speciality/drenagem-linfatica", "/especialidades"],
      ["/speciality/pilates", "/pilates"],
    ].map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};
