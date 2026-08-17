import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { specialities } from "@/content/specialities";

export function EspecialidadesGrid({
  showHeading = true,
}: {
  showHeading?: boolean;
}) {
  return (
    <Section id="especialidades">
      {showHeading && (
        <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            className="max-w-2xl"
            eyebrow="Áreas de atuação"
            /*
              Sete = specialities.length + 1, o cartão do Pilates. O número está
              escrito à mão porque é ele que vai para a planilha de revisão, mas
              por isso mesmo mente em silêncio se alguém somar ou tirar uma área.
              O teste em __tests__/EspecialidadesGrid.test.tsx prende os dois.
            */
            title="Sete frentes, uma forma de trabalhar"
          />
          <p className="max-w-sm text-base font-book leading-relaxed text-muted">
            Cada caso exige técnica própria, mas todos partem do mesmo lugar: escuta ativa, plano de tratamento individualizado e humanizado. Tratamos pessoas, não diagnósticos.
          </p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {specialities.map((s, i) => (
          <Reveal key={s.slug} delay={(i % 4) * 70}>
            <Link
              href={`/especialidades/${s.slug}`}
              className="group flex h-full flex-col overflow-hidden border border-line bg-white text-ink"
            >
              <div className="h-44 overflow-hidden">
                <Image
                  src={s.image}
                  alt={s.title}
                  width={480}
                  height={320}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-6">
                <h3 className="font-display font-light text-2xl">{s.cardTitle}</h3>
                <p className="text-sm leading-relaxed text-muted">{s.cardText}</p>
              </div>
            </Link>
          </Reveal>
        ))}

        <Reveal delay={210}>
          <Link
            href="/pilates"
            className="group flex h-full flex-col overflow-hidden border border-accent bg-accent text-surface"
          >
            <div className="h-44 overflow-hidden">
              <Image
                src="/pilates-sala.webp"
                alt="Estúdio de Pilates da Vyta na unidade Consolação, com os aparelhos de pilates sendo eles reformer, cadillac e chair, com parede de fundo na cor coral."
                width={480}
                height={360}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-6">
              <h3 className="font-display font-light text-2xl text-surface">Pilates</h3>
              <p className="text-sm leading-relaxed text-surface">
                Força, mobilidade e respiração. Sempre conduzido por um fisioterapeuta. Ver a sala →
              </p>
            </div>
          </Link>
        </Reveal>
      </div>
    </Section>
  );
}
