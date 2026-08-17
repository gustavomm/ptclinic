"use client";

/**
 * Minimal shadcn-style Sheet primitive, hand-authored on top of
 * @radix-ui/react-dialog.
 *
 * We did not run `npx shadcn@latest add sheet`: on this repo it ignored
 * --no-css-variables, injected an OKLCH CSS-variable theme block into
 * app/globals.css, and — because macOS's default filesystem is
 * case-insensitive — silently overwrote components/ui/Button.tsx with its
 * own lowercase button.tsx. That's well beyond "add sheet.tsx", so per the
 * task brief we stopped, reverted, and hand-built this component directly on
 * Radix Dialog (the same primitive shadcn's Sheet wraps) using this
 * project's existing Tailwind tokens. See task-10-report.md for details.
 *
 * Radix's Presence (used internally by Dialog.Content/Overlay) detects the
 * CSS transition below and delays unmount until it finishes, so open/close
 * animate correctly without any extra animation plugin.
 */

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { Xmark } from "iconoir-react";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

function SheetOverlay({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-ink-deep/40 transition-opacity duration-300 data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
        className
      )}
      {...props}
    />
  );
}

type Side = "top" | "right" | "bottom" | "left";

const SIDE_CLASSES: Record<Side, string> = {
  right:
    "inset-y-0 right-0 h-full border-l data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full",
  left: "inset-y-0 left-0 h-full border-r data-[state=open]:translate-x-0 data-[state=closed]:-translate-x-full",
  top: "inset-x-0 top-0 border-b data-[state=open]:translate-y-0 data-[state=closed]:-translate-y-full",
  bottom:
    "inset-x-0 bottom-0 border-t data-[state=open]:translate-y-0 data-[state=closed]:translate-y-full",
};

function SheetContent({
  side = "right",
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & {
  side?: Side;
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col overflow-y-auto p-6 shadow-lg transition-transform duration-300 ease-in-out",
          SIDE_CLASSES[side],
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-ink/5"
        >
          <Xmark width={20} height={20} />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      className={cn("text-lg font-medium text-ink", className)}
      {...props}
    />
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle };
