import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { units } from "@/content/units";

export function UnidadesSection({
  showHeading = true,
}: {
  showHeading?: boolean;
}) {
  return (
    <Section id="localizacao" tone="surface-alt">
      {showHeading && (
        <SectionHeading className="mb-14 max-w-2xl" eyebrow="Unidades" title="Consolação e Pinheiros" />
      )}
      <div className="grid gap-8 md:grid-cols-2">
        {units.map((u, i) => (
          <Reveal key={u.slug} delay={i * 100} className="border border-line bg-surface">
            <div className="h-64 overflow-hidden">
              <Image src={u.image} alt={u.imageAlt} width={u.imageWidth} height={u.imageHeight} sizes="(max-width: 768px) 100vw, 50vw" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col gap-3 p-8">
              <h3 className="font-display font-light text-3xl text-ink">{u.name}</h3>
              <p className="text-base font-book leading-relaxed text-muted">
                {u.street}
                <br />
                {u.district}, {u.city} · {u.state}
              </p>
              <Link href={`/unidades/${u.slug}`} className="inline-flex min-h-[44px] items-center text-[15px] text-accent hover:text-accent-deep">
                Ver a unidade →
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
