import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import { units } from "@/content/units";

/*
  Os dois links de unidade no rodapé das seções "Onde atendemos" e "Onde
  praticar" eram texto solto: mudavam de cor no hover e nada mais. No desktop
  ainda dava para descobrir; no celular não existe hover, então eram duas linhas
  de texto que ninguém tinha motivo para tocar.

  Agora são caixas com borda visível, seta e área de toque inteira clicável. A
  borda é o que faz o trabalho no celular, onde não há estado intermediário
  entre ver e tocar.

  Vive num componente porque são três páginas com o mesmo bloco — pilates,
  cada área de atuação e o domiciliar — e antes as três repetiam o markup.
*/
export function UnitLinks() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
      {units.map((u) => (
        <Link
          key={u.slug}
          href={`/unidades/${u.slug}`}
          className="group flex min-h-[44px] flex-col gap-1 border border-surface/30 px-6 py-4 transition-colors hover:border-accent-warm-soft hover:bg-surface/5 focus-visible:border-accent-warm-soft sm:min-w-[15rem]"
        >
          <span className="font-display font-light text-2xl text-surface group-hover:text-accent-warm-soft">
            {u.shortName}
            <Arrow />
          </span>
          <span className="text-sm text-surface/70">{u.street}</span>
        </Link>
      ))}
    </div>
  );
}
