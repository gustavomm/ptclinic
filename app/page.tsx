import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { ComoFunciona } from "@/components/sections/ComoFunciona";
import { EspecialidadesGrid } from "@/components/sections/EspecialidadesGrid";

export default function Home() {
  return (
    <main>
      <Hero />
      <Manifesto />
      <ComoFunciona />
      <EspecialidadesGrid />
    </main>
  );
}
