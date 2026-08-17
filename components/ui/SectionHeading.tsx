import { Eyebrow } from "./Eyebrow";

export function SectionHeading({
  eyebrow,
  title,
  lead,
  tone = "ink",
  className = "",
  level = "h2",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: string;
  tone?: "ink" | "surface";
  className?: string;
  level?: "h1" | "h2";
}) {
  const titleColor = tone === "surface" ? "text-surface" : "text-ink";
  const leadColor = tone === "surface" ? "text-surface/80" : "text-muted";
  /*
    Texto claro sobre fundo escuro parece mais fino do que o mesmo texto escuro
    sobre fundo claro — o fundo "come" a haste da letra. Por isso o lead sobre o
    ink vai a 400 e o lead sobre o creme fica no 300, que é onde mora a elegância
    da fonte. Mesma razão pela qual Hero e ContactCTA, ambos sobre escuro, não
    voltaram ao 300 junto com os outros leads.
  */
  const leadWeight = tone === "surface" ? "font-normal" : "font-light";
  const Heading = level;
  return (
    <div className={className}>
      {eyebrow && <Eyebrow tone={tone === "surface" ? "warm" : "deep"}>{eyebrow}</Eyebrow>}
      <Heading className={`font-display text-display-lg text-balance ${titleColor}`}>
        {title}
      </Heading>
      {lead && (
        <p className={`mt-5 max-w-2xl text-lg ${leadWeight} leading-relaxed ${leadColor}`}>
          {lead}
        </p>
      )}
    </div>
  );
}
