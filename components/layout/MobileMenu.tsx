"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "iconoir-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAV_ITEMS } from "./Nav";
import { WhatsAppLink } from "@/components/WhatsAppLink";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Abrir menu"
        className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-ink/5 lg:hidden"
      >
        <Menu width={22} height={22} />
      </SheetTrigger>
      <SheetContent side="right" className="w-[86vw] max-w-sm border-line bg-surface">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="mt-10 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex min-h-[44px] items-center border-b border-line py-3 font-display text-2xl text-ink"
            >
              {item.label}
            </Link>
          ))}
          <WhatsAppLink service="geral" from="mobile-menu" variant="teal" className="mt-8 w-full">
            Agendar no WhatsApp
          </WhatsAppLink>
        </div>
      </SheetContent>
    </Sheet>
  );
}
