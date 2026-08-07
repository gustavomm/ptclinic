import Image from "next/image";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { WhatsAppLink } from "@/components/WhatsAppLink";

export function Hero() {
  return (
    <section id="topo" className="relative flex min-h-[85svh] w-full items-center justify-center overflow-hidden">
      <Image
        src="/hero-pilates.webp"
        alt="Estúdio de Pilates da Vyta em Pinheiros, com reformer, cadillac, escada sueca e letreiro Vyta na parede"
        fill
        priority
        sizes="100vw"
        className="object-cover"
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
          Uma clínica onde cada sessão — inclusive as de Pilates — é conduzida
          por fisioterapeuta. Avaliação longa, plano escrito para o seu corpo, e
          alguém que acompanha a sua evolução de perto.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <WhatsAppLink service="geral" from="hero">Agendar no WhatsApp</WhatsAppLink>
          <Button href="#como-funciona" variant="outline">Como funciona</Button>
        </div>
      </div>
    </section>
  );
}
