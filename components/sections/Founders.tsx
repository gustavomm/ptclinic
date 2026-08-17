import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { team } from "@/content/team";
import { personSchema } from "@/lib/schema";

export function Founders() {
  return (
    <Section id="quem-somos">
      <JsonLd data={team.map((m) => personSchema(m))} />
      <SectionHeading
        className="mb-14 max-w-3xl"
        eyebrow="Quem somos"
        title={<>Duas fisioterapeutas que <em className="italic">atendem</em> e acompanham do primeiro contato à alta</>}
        lead="A Vyta nasceu de uma amizade formada na graduação e do mesmo incômodo: reabilitação boa não cabe em trinta minutos. Aqui, quem fundou a clínica é quem senta com você na avaliação."
      />
      <div className="grid gap-12 md:grid-cols-2">
        {team.map((m, i) => (
          <Reveal key={m.slug} delay={i * 100} className="flex flex-col gap-6">
            <div className="h-[26rem] overflow-hidden bg-surface-alt">
              <Image
                src={m.image}
                alt={m.name}
                width={640}
                height={840}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div>
              <h3 className="font-display text-display-sm text-ink">{m.name}</h3>
              <div className="mb-4 mt-1 text-[13px] uppercase tracking-eyebrow text-accent-deep">
                {m.role}
              </div>
              <p className="text-base font-book leading-relaxed text-muted">{m.bio}</p>
              <ul className="mt-4 flex flex-col gap-1">
                {m.education.map((e) => (
                  <li key={e} className="text-[15px] text-muted">{e}</li>
                ))}
              </ul>
              <div className="mt-4 text-[13px] text-subtle">{m.crefito}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
