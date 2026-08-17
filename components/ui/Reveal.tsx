"use client";

import { useEffect, useRef, useState } from "react";

export function Reveal({
  as: Tag = "div",
  delay = 0,
  className = "",
  children,
}: {
  as?: "div" | "section" | "article" | "li";
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setRevealed(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setRevealed(true);
          io.unobserve(entry.target);
        }
      },
      /*
        threshold 0 dispara no primeiro pixel que entra. Com uma fração — era
        0.12 — o ponto de disparo dependia da altura do bloco: a coluna de texto
        do Pilates, com 800px, só começava a aparecer depois de 96px dentro da
        tela; um cartão de 200px, depois de 24px. Some a isso os 700ms de
        transição e os blocos altos chegavam legíveis já no meio da tela.

        A margem de baixo agora é positiva: estende a área de observação 10%
        abaixo da dobra, então a transição começa pouco antes de o bloco
        aparecer e termina quando ele está inteiro à vista. Antes eram -8%, que
        empurravam o disparo para ainda mais tarde.
      */
      { threshold: 0, rootMargin: "0px 0px 10% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      data-revealed={revealed}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
      className={`transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none data-[revealed=false]:translate-y-8 data-[revealed=false]:opacity-0 data-[revealed=true]:translate-y-0 data-[revealed=true]:opacity-100 ${className}`}
    >
      {children}
    </Tag>
  );
}
