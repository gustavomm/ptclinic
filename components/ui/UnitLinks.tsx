import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import { units } from "@/content/units";

/*
  Os dois links de unidade eram texto solto: mudavam de cor no hover e nada
  mais. No desktop ainda dava para descobrir; no celular não existe hover, então
  eram duas linhas que ninguém tinha motivo para tocar. Agora são caixas com
  borda, seta e a área inteira clicável — a borda é o que faz o trabalho onde
  não há estado entre ver e tocar.

  Grade e não flex-wrap. Com flex cada caixa nascia do tamanho do próprio texto,
  então "Consolação, Rua Frei Caneca, 1212, Conjunto 53" ficava visivelmente
  mais larga que "Pinheiros, Rua Fradique Coutinho, 380" e as duas terminavam em
  lugares diferentes. Na grade as colunas são iguais por definição.

  `withHomeVisits` liga a terceira caixa, a do domiciliar. Fica ligada em "Onde
  atendemos", das áreas de atuação, porque toda área é atendida em casa. Fica
  desligada em "Onde praticar", do pilates: o pilates depende de reformer,
  cadillac e barril, que não vão à casa de ninguém.
*/
export function UnitLinks({ withHomeVisits = false }: { withHomeVisits?: boolean }) {
  const CARD =
    "group flex min-h-[44px] flex-col gap-1 border border-surface/30 px-6 py-5 transition-colors hover:border-accent-warm-soft hover:bg-surface/5 focus-visible:border-accent-warm-soft";
  const NAME =
    "font-display font-light text-2xl text-surface group-hover:text-accent-warm-soft";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {units.map((u) => (
        <Link key={u.slug} href={`/unidades/${u.slug}`} className={CARD}>
          <span className={NAME}>
            {u.shortName}
            <Arrow />
          </span>
          <span className="text-sm text-surface/70">{u.street}</span>
        </Link>
      ))}

      {withHomeVisits && (
        <Link href="/fisioterapia-domiciliar" className={CARD}>
          <span className={NAME}>
            Na sua casa
            <Arrow />
          </span>
          <span className="text-sm text-surface/70">Atendimento domiciliar em São Paulo</span>
        </Link>
      )}
    </div>
  );
}
