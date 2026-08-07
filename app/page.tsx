import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { ComoFunciona } from "@/components/sections/ComoFunciona";

export default function Home() {
  return (
    <main>
      <Hero />
      <Manifesto />
      <ComoFunciona />
    </main>
  );
}
