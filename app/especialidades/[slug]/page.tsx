export function generateStaticParams() {
  return [
    "fisioterapia-neurologica",
    "fisioterapia-oncologica",
    "fisioterapia-ortopedica",
    "fisioterapia-para-idosos",
    "fisioterapia-respiratoria",
    "fisioterapia-pre-e-pos-cirurgica",
    "drenagem-linfatica",
  ].map((slug) => ({ slug }));
}

export default function SpecialityPage() {
  return <main />;
}
