"use client";

/**
 * Minimal shadcn-style Accordion primitive, hand-authored on top of
 * @radix-ui/react-accordion — same reasoning as components/ui/sheet.tsx
 * (read that file first). We did not run `npx shadcn@latest add accordion`:
 * on this repo the CLI ignored --no-css-variables, injected an OKLCH
 * CSS-variable theme block into app/globals.css, and — because macOS's
 * default filesystem is case-insensitive — silently overwrote
 * components/ui/Button.tsx with its own lowercase button.tsx. So per the
 * task brief we hand-built this directly on Radix Accordion (the same
 * primitive shadcn's Accordion wraps) using this project's existing
 * Tailwind tokens instead.
 *
 * The open/close height animation relies on the
 * `--radix-accordion-content-height` CSS custom property Radix sets on the
 * content element while it measures, driving the `accordion-down` /
 * `accordion-up` keyframes declared in tailwind.config.js
 * (theme.extend.keyframes/animation) — no animation plugin required.
 *
 * Accessibility (all delegated to Radix, not reimplemented here):
 * - AccordionTrigger renders as a real <button> inside an
 *   AccordionPrimitive.Header (a heading wrapper), so triggers are
 *   reachable via Tab and heading navigation in a screen reader.
 * - Radix wires aria-expanded, aria-controls/aria-labelledby, and unique
 *   ids between each trigger and its content panel automatically.
 * - Arrow-key (Up/Down/Home/End) roving focus across triggers, and
 *   Enter/Space to toggle, come from Radix's built-in keyboard handling.
 * - AccordionContent uses `hidden until-found` semantics via Radix's
 *   own unmount handling — collapsed panels are removed from the
 *   accessibility tree, not just visually hidden.
 */

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { NavArrowDown } from "iconoir-react";
import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

function AccordionItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item className={cn("border-b", className)} {...props} />;
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "flex min-h-[44px] flex-1 items-center justify-between gap-4 text-left [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <NavArrowDown
          className="h-5 w-5 flex-none text-subtle transition-transform duration-200"
          aria-hidden
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn(className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
