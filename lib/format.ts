/** Formats an E.164 Brazilian mobile (+55DDNNNNNNNNN) for display. */
export function formatPhone(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  const national = digits.startsWith("55") ? digits.slice(2) : digits;
  const ddd = national.slice(0, 2);
  const rest = national.slice(2);
  const head = rest.length === 9 ? rest.slice(0, 5) : rest.slice(0, 4);
  const tail = rest.slice(head.length);
  return `(${ddd}) ${head}-${tail}`;
}
