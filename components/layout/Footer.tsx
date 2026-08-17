import Link from "next/link";
import { Logo } from "./Logo";
import { clinic } from "@/content/clinic";
import { units } from "@/content/units";
import { team } from "@/content/team";
import { NAV_ITEMS } from "./Nav";

export function Footer() {
  return (
    <footer className="w-full border-t border-line bg-surface">
      <div className="mx-auto grid max-w-shell gap-10 px-6 py-16 md:grid-cols-2 md:px-8 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Logo size={40} />
            <span className="h-8 w-px bg-line" aria-hidden />
            <span className="pl-[0.32em] text-[11px] uppercase tracking-brand text-ink">
              {clinic.tagline}
            </span>
          </div>
          <p className="max-w-xs text-sm font-light leading-relaxed text-subtle">
            Atendimento particular, individual e baseado em evidências. Emitimos
            recibo para reembolso.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="mb-1 text-[13px] uppercase tracking-eyebrow text-subtle">Clínica</div>
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="flex min-h-[44px] items-center text-[15px] font-light text-ink hover:text-accent">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <div className="mb-1 text-[13px] uppercase tracking-eyebrow text-subtle">Unidades</div>
          {units.map((u) => (
            <Link key={u.slug} href={`/unidades/${u.slug}`} className="flex min-h-[44px] items-center text-[15px] font-light text-ink hover:text-accent">
              {u.street}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <div className="mb-1 text-[13px] uppercase tracking-eyebrow text-subtle">Contato</div>
          <a href="/whatsapp" className="redirect-whatsapp flex min-h-[44px] items-center text-[15px] font-light text-ink hover:text-accent">
            WhatsApp
          </a>
          <a href={`tel:${clinic.phoneE164}`} className="redirect-phone flex min-h-[44px] items-center text-[15px] font-light text-ink hover:text-accent">
            {clinic.phoneDisplay}
          </a>
          <a href={`mailto:${clinic.email}`} className="redirect-email flex min-h-[44px] items-center break-all text-[15px] font-light text-ink hover:text-accent">
            {clinic.email}
          </a>
          <a
            href={clinic.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="redirect-instagram flex min-h-[44px] items-center text-[15px] font-light text-ink hover:text-accent"
          >
            {clinic.instagramHandle}
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-shell flex-wrap justify-between gap-4 border-t border-line px-6 py-6 md:px-8">
        <span className="text-[13px] font-light text-subtle">
          © {new Date().getFullYear()} {clinic.name}
        </span>
        <span className="text-[13px] font-light text-subtle">
          {team.map((m) => m.crefito.replace("Crefito 3: ", "")).join(" · ")}
        </span>
      </div>
    </footer>
  );
}
