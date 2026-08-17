export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-2xl text-base font-light leading-relaxed text-muted [&_a]:text-accent [&_a:hover]:text-accent-deep [&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-display-sm [&_h2]:text-ink [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:text-ink [&_li]:mb-3 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-5 [&_strong]:font-medium [&_strong]:text-ink [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6">
      {children}
    </div>
  );
}
