/*
  Bolinha pendurada, texto alinhado.

  Antes era `flex gap-4`: a bolinha ficava DENTRO da coluna e empurrava o texto
  uns 20px para a direita. O efeito só aparecia quando uma lista e um parágrafo
  dividiam a mesma coluna — o parágrafo começava na borda, a lista não, e as
  duas primeiras letras não se alinhavam com nada. Numa página de duas colunas
  isso salta.

  Agora a bolinha é absoluta e fica na margem, à esquerda do texto. O texto
  começa exatamente onde o parágrafo começa, e a lista continua parecendo lista.
  É o "hanging bullet" de sempre, que existe justamente para isto.
*/
export function BulletList({
  items,
  className = "",
}: {
  items: readonly string[];
  className?: string;
}) {
  return (
    <ul className={`flex flex-col gap-4 ${className}`}>
      {items.map((item) => (
        <li
          key={item}
          className="relative text-base font-book leading-relaxed text-muted"
        >
          <span
            // -left-5 é a mesma distância que o gap-4 dava antes, só que para
            // fora da coluna em vez de para dentro. top-[0.7em] põe a bolinha
            // na altura do meio da primeira linha, não no topo dela.
            className="absolute -left-5 top-[0.7em] h-1 w-1 rounded-full bg-accent-warm"
            aria-hidden
          />
          {item}
        </li>
      ))}
    </ul>
  );
}
