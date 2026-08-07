import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppLink } from "@/components/WhatsAppLink";

const POINTS = [
  "Grupos reduzidos, aparelhos completos",
  "Avaliação postural antes da primeira aula",
  "Transição natural para quem sai da reabilitação",
];

export function PilatesSection() {
  return (
    <Section id="pilates" tone="ink">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <Eyebrow tone="warm">Pilates</Eyebrow>
          <h2 className="font-display text-display-lg text-balance text-surface">
            Todas as aulas com <em className="italic">fisioterapeuta</em>. Sempre.
          </h2>
          <p className="mt-6 text-[17px] font-light leading-relaxed text-surface/80">
            É a diferença que ninguém vê no Instagram e todo mundo sente na
            terceira semana: quem corrige a sua postura conhece a sua lesão, sabe
            o que a sua cirurgia limitou e entende por que aquele ombro ainda dói.
          </p>
          <p className="mt-5 text-[17px] font-light leading-relaxed text-surface/80">
            Fortalecimento de core, alinhamento postural, mobilidade e
            consciência corporal — dosados para o seu corpo de hoje.
          </p>
          <ul className="mt-8 flex flex-col gap-3 border-t border-surface/20 pt-6">
            {POINTS.map((p) => (
              <li key={p} className="flex items-baseline gap-3 text-base font-light text-surface/90">
                <span className="text-accent-warm-soft" aria-hidden>·</span>
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-wrap gap-3">
            <WhatsAppLink service="pilates" from="landing-pilates" variant="warm">
              Agendar aula experimental
            </WhatsAppLink>
            <Link href="/pilates" className="inline-flex min-h-[44px] items-center rounded-full border border-surface/60 px-8 text-base text-surface hover:bg-surface/10">
              Conhecer o Pilates
            </Link>
          </div>
        </Reveal>

        <Reveal delay={120} className="grid grid-cols-2 grid-rows-2 gap-3">
          <Image src="/pilates-corredor.webp" alt="Corredor do estúdio de Pilates da Vyta em Pinheiros, com fileira de espelhos arqueados iluminados refletindo reformers e outros aparelhos" width={480} height={640} sizes="(max-width: 1024px) 50vw, 25vw" className="row-span-2 h-full w-full object-cover" />
          <Image src="/pilates-espelhos.webp" alt="Espelhos arqueados iluminados do estúdio de Pilates da Vyta em Pinheiros, refletindo cadillac e reformer" width={480} height={360} sizes="(max-width: 1024px) 50vw, 25vw" className="h-full w-full object-cover" />
          <Image src="/pilates-aparelhos.webp" alt="Fileira de aparelhos de Pilates da unidade Consolação da Vyta — reformer, cadillac e escada sueca junto à parede coral" width={480} height={360} sizes="(max-width: 1024px) 50vw, 25vw" className="h-full w-full object-cover" />
        </Reveal>
      </div>
    </Section>
  );
}
