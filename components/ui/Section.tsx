const TONES = {
  surface: "bg-surface text-ink",
  "surface-alt": "bg-surface-alt text-ink",
  ink: "bg-ink text-surface",
} as const;

export function Section({
  id,
  tone = "surface",
  className = "",
  children,
}: {
  id?: string;
  tone?: keyof typeof TONES;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`w-full ${TONES[tone]} ${className}`}>
      <div className="mx-auto max-w-shell px-6 py-20 md:px-8 md:py-28">
        {children}
      </div>
    </section>
  );
}
