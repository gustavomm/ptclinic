import Link from "next/link";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { clinic } from "@/content/clinic";

export const NAV_ITEMS = [
  { href: "/especialidades", label: "Especialidades" },
  { href: "/pilates", label: "Pilates" },
  { href: "/#quem-somos", label: "Quem somos" },
  { href: "/unidades", label: "Unidades" },
  { href: "/blog", label: "Conteúdo" },
] as const;

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-line bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-shell items-center justify-between gap-6 px-6 py-3 md:px-8">
        <Link href="/" className="flex flex-none items-center gap-4">
          <Logo size={40} />
          <span className="hidden h-8 w-px bg-line sm:block" aria-hidden />
          <span className="hidden pl-[0.32em] text-[9px] uppercase tracking-brand text-ink sm:block">
            {clinic.tagline}
          </span>
        </Link>

        <div className="hidden items-center gap-7 text-sm lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="text-ink hover:text-accent-deep">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-none items-center gap-3">
          <WhatsAppLink service="geral" from="nav" variant="teal" className="hidden px-6 text-sm sm:inline-flex">
            Agendar
          </WhatsAppLink>
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
}
