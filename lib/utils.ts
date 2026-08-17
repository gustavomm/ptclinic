/**
 * Joins conditional class name fragments, dropping falsy values. This project
 * uses Tailwind tokens directly (no CSS variables / class-variance-authority),
 * so this is a minimal `clsx`-style joiner rather than a Tailwind-merge dedupe.
 */
export function cn(...inputs: Array<string | undefined | null | false>) {
  return inputs.filter(Boolean).join(" ");
}
