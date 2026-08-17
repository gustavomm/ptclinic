import Link from "next/link";

/*
  A trilha estava escrita à mão em quatro páginas e faltava em quatro: as três
  de índice — áreas de atuação, unidades, conteúdo — e a de domiciliar. Nas de
  índice era pior que esquecimento: elas já emitiam BreadcrumbList no JSON-LD,
  então a página prometia ao Google uma trilha que ninguém via na tela.

  Recebe o mesmo array que vai para o breadcrumbSchema e desenha todos os itens
  menos o último. O último é a página em que a pessoa já está: precisa existir no
  schema, não precisa virar link na tela. Passar o mesmo array para os dois é o
  que impede que voltem a discordar.

  Numa página de índice o array tem dois itens, então sobra só "Início" — que é
  exatamente o "voltar para a home" que faltava fora do logo.
*/
export function Breadcrumb({
  trail,
}: {
  trail: ReadonlyArray<{ name: string; path: string }>;
}) {
  const ancestors = trail.slice(0, -1);
  if (!ancestors.length) return null;

  return (
    <nav aria-label="Trilha" className="mb-8 text-sm text-subtle">
      {ancestors.map((item, i) => (
        <span key={item.path}>
          {i > 0 && (
            <span className="mx-2" aria-hidden>
              /
            </span>
          )}
          <Link
            href={item.path}
            className="inline-flex min-h-[44px] items-center hover:text-accent"
          >
            {item.name}
          </Link>
        </span>
      ))}
    </nav>
  );
}
