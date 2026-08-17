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
  const Heading = level;
  return (
    <div className={className}>
      {eyebrow && <Eyebrow tone={tone === "surface" ? "warm" : "deep"}>{eyebrow}</Eyebrow>}
      <Heading className={`font-display text-display-lg text-balance ${titleColor}`}>
        {title}
      </Heading>
      {lead && (
        <p className={`mt-5 max-w-2xl text-lg leading-relaxed ${leadColor}`}>
          {lead}
        </p>
      )}
    </div>
  );
}
