export function Logo({
  size = 42,
  className = "bg-ink",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label="Vyta"
      className={`block flex-none ${className}`}
      style={{
        width: size,
        height: size,
        maskImage: "url('/LOGOTIPO 002.webp')",
        WebkitMaskImage: "url('/LOGOTIPO 002.webp')",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
