import { Eyebrow } from "./Eyebrow";

export function SectionHeading({
  eyebrow,
  title,
  lead,
  tone = "ink",
  className = "",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: string;
  tone?: "ink" | "surface";
  className?: string;
}) {
  const titleColor = tone === "surface" ? "text-surface" : "text-ink";
  const leadColor = tone === "surface" ? "text-surface/80" : "text-muted";
  return (
    <div className={className}>
      {eyebrow && <Eyebrow tone={tone === "surface" ? "warm" : "deep"}>{eyebrow}</Eyebrow>}
      <h2 className={`font-display text-display-lg text-balance ${titleColor}`}>
        {title}
      </h2>
      {lead && (
        <p className={`mt-5 max-w-2xl text-lg font-light leading-relaxed ${leadColor}`}>
          {lead}
        </p>
      )}
    </div>
  );
}
