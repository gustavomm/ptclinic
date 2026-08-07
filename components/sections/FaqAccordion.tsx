import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqAccordion({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  return (
    <Accordion type="single" collapsible className="w-full max-w-2xl">
      {items.map((item, i) => (
        <AccordionItem key={item.question} value={`item-${i}`} className="border-line">
          <AccordionTrigger className="py-5 text-left font-display text-xl text-ink hover:no-underline">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="pb-5 text-base font-light leading-relaxed text-muted">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
