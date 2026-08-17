import Image from "next/image";
import { Logo } from "@/components/layout/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { clinic } from "@/content/clinic";

export function ContactCTA() {
  return (
    <section id="contato" className="relative w-full overflow-hidden">
      <Image src="/sala-fisioterapia.webp" alt="Sala de fisioterapia da Vyta em Pinheiros, com maca de atendimento, espaldar e espelho de corpo inteiro" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-ink/90" aria-hidden />
      <Reveal className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-28 text-center md:px-8">
        <Logo size={68} className="bg-surface" />
        <span className="my-7 block h-px w-14 bg-accent-warm" aria-hidden />
        <h2 className="font-display text-display-lg text-balance text-surface">
          Conta pra gente o que está <em className="italic">te incomodando</em>
        </h2>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-surface">
          Basta contar o que está sentindo. A gente responde qual fisioterapeuta é a mais indicada, qual unidade fica melhor para você e quando você pode começar.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <WhatsAppLink service="geral" from="contato">Falar no WhatsApp</WhatsAppLink>
          <a
            href={`tel:${clinic.phoneE164}`}
            className="redirect-phone inline-flex min-h-[44px] items-center rounded-full border border-surface/60 px-8 text-base text-surface hover:bg-surface/10"
          >
            {clinic.phoneDisplay}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
