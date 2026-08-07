import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { specialities } from "@/content/specialities";

export function EspecialidadesGrid() {
  return (
    <Section id="especialidades">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
        <SectionHeading
          className="max-w-2xl"
          eyebrow="Especialidades"
          title="Oito frentes, uma forma de trabalhar"
        />
        <p className="max-w-sm text-base font-light leading-relaxed text-muted">
          Cada especialidade tem técnica própria, mas todas partem do mesmo
          lugar: avaliar antes de tratar, e tratar uma pessoa — não um
          diagnóstico.
        </p>
      </div>

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
                <h3 className="font-display text-2xl">{s.cardTitle}</h3>
                <p className="text-sm font-light leading-relaxed text-muted">{s.cardText}</p>
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
                alt="Sala de Pilates da Vyta na unidade Consolação, com reformer, cadillac e escada sueca junto à parede coral"
                width={480}
                height={360}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-6">
              <h3 className="font-display text-2xl text-surface">Pilates</h3>
              <p className="text-sm font-light leading-relaxed text-surface">
                Força, mobilidade e controle — sempre com fisioterapeuta ao lado.
                Ver a sala →
              </p>
            </div>
          </Link>
        </Reveal>
      </div>
    </Section>
  );
}
