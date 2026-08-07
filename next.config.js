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
      ["/speciality/drenagem-linfatica", "/especialidades/drenagem-linfatica"],
      ["/speciality/pilates", "/pilates"],
    ].map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};
