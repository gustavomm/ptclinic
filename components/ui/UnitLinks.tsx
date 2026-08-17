import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import { units } from "@/content/units";

/*
  Os dois links de unidade eram texto solto: mudavam de cor no hover e nada
  mais. No desktop ainda dava para descobrir; no celular não existe hover, então
  eram duas linhas que ninguém tinha motivo para tocar. Agora são caixas com
  borda, seta e a área inteira clicável — a borda é o que faz o trabalho onde
  não há estado entre ver e tocar.

  Empilhadas, uma por linha, e não em duas colunas. Em duas colunas o terceiro
  cartão — o do domicílio — deixava a quarta célula vazia, e era esse buraco que
  fazia a seção parecer torta. Três colunas não cabem: a coluna de conteúdo tem
  576px, o que daria 181px por cartão e quebraria "Rua Frei Caneca, 1212,
  Conjunto 53" em duas linhas.

  Empilhado não sobra célula, serve para dois cartões e para três, e é o mesmo
  arranjo que o celular já tinha. A largura é usada na horizontal: nome à
  esquerda, endereço à direita, que é como se lê uma lista de lugares.

  `withHomeVisits` liga a terceira caixa, a do domiciliar. Fica ligada em "Onde
  atendemos", das áreas de atuação, porque toda área é atendida em casa. Fica
  desligada em "Onde praticar", do pilates: o pilates depende de reformer,
  cadillac e barril, que não vão à casa de ninguém.
*/
export function UnitLinks({
  withHomeVisits = false,
  className = "",
}: {
  withHomeVisits?: boolean;
  className?: string;
}) {
  const CARD =
    "group flex min-h-[44px] flex-col gap-1 border border-surface/30 px-6 py-4 transition-colors hover:border-accent-warm-soft hover:bg-surface/5 focus-visible:border-accent-warm-soft sm:flex-row sm:items-baseline sm:justify-between sm:gap-6";
  const NAME =
    "font-display font-light text-2xl text-surface group-hover:text-accent-warm-soft";
  const WHERE = "text-sm text-surface/70 sm:text-right";

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {units.map((u) => (
        <Link key={u.slug} href={`/unidades/${u.slug}`} className={CARD}>
          <span className={NAME}>
            {u.shortName}
            <Arrow />
          </span>
          <span className={WHERE}>{u.street}</span>
        </Link>
      ))}

      {withHomeVisits && (
        <Link href="/fisioterapia-domiciliar" className={CARD}>
          <span className={NAME}>
            Na sua casa
            <Arrow />
          </span>
          <span className={WHERE}>Atendimento domiciliar em São Paulo</span>
        </Link>
      )}
    </div>
  );
}
