import Link from "next/link";

const VARIANTS = {
  primary: "bg-accent-deep text-white hover:bg-accent-deep/90",
  teal: "bg-accent text-white hover:bg-accent/90",
  outline: "border border-surface/60 text-surface hover:bg-surface/10",
  outlineInk: "border border-line text-ink hover:bg-ink/5",
} as const;

export function Button({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: keyof typeof VARIANTS;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[44px] items-center justify-center rounded-full px-8 text-base transition-colors ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
