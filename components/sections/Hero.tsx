import Image from "next/image";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { WhatsAppLink } from "@/components/WhatsAppLink";

export function Hero() {
  return (
    <section id="topo" className="relative flex min-h-[calc(100svh-var(--chrome-height))] w-full items-center justify-center overflow-hidden">
      {/*
        Esta é a foto do site antigo. O arquivo já vem cortado 260px no topo,
        onde ficava a luminária fluorescente mais próxima da câmera: no celular
        o recorte é pela largura, a foto aparece inteira na vertical, e aquele
        painel frio caía bem atrás do logotipo.

        No desktop sobra o corte vertical, e é ele que o object-position
        controla. Ancorado perto do topo entra a parede coral inteira com o
        cadillac; do meio para baixo a parede sai de quadro e sobram a porta e
        o piso, que é justamente o que a foto tem de mais frio.
      */}
      <Image
        src="/hero-pilates.webp"
        alt="Sala de Pilates da Vyta, com parede coral, cadillac, barril e reformer sobre piso de madeira"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_10%]"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/65 to-ink/90"
        aria-hidden
      />
      <div className="relative flex max-w-4xl flex-col items-center px-6 py-24 text-center md:px-8">
        <Logo size={88} className="bg-surface" />
        <span className="my-6 block h-px w-16 bg-accent-warm" aria-hidden />
        <span className="pl-[0.46em] text-[13px] uppercase tracking-hero text-surface">
          Fisioterapia &amp; Pilates
        </span>
        <h1 className="mt-10 font-display text-display-xl text-balance text-surface">
          Cuidar do movimento é <em className="italic">cuidar da vida</em>
        </h1>
        <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-surface text-pretty">
          Aqui toda sessão é conduzida por fisioterapeutas, inclusive as de
          Pilates. Avaliação longa, plano escrito para o seu corpo, e alguém que
          acompanha a sua evolução de perto.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <WhatsAppLink service="geral" from="hero">Agendar no WhatsApp</WhatsAppLink>
          <Button href="#como-funciona" variant="outline">Como funciona</Button>
        </div>
      </div>
    </section>
  );
}
