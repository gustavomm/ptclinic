export function Eyebrow({
  children,
  tone = "deep",
}: {
  children: React.ReactNode;
  tone?: "deep" | "warm";
}) {
  const color = tone === "warm" ? "text-accent-warm-soft" : "text-accent-deep";
  return (
    <div className={`mb-4 text-xs uppercase tracking-eyebrow ${color}`}>
      {children}
    </div>
  );
}
