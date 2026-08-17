import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WhatsAppLink } from "../WhatsAppLink";
import * as tracking from "@/lib/tracking";

afterEach(cleanup);

describe("WhatsAppLink", () => {
  it("points at /whatsapp so the Ads conversion event fires", () => {
    render(<WhatsAppLink service="geral" from="/">Agendar</WhatsAppLink>);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/whatsapp");
  });

  it("carries the GTM class", () => {
    render(<WhatsAppLink service="geral" from="/">Agendar</WhatsAppLink>);
    expect(screen.getByRole("link")).toHaveClass("redirect-whatsapp");
  });

  it("keeps the GTM class when extra classes are passed", () => {
    render(
      <WhatsAppLink service="geral" from="/" className="mt-4">Agendar</WhatsAppLink>,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveClass("redirect-whatsapp");
    expect(link).toHaveClass("mt-4");
  });

  it("calls the tracking stub with service and origin on click", async () => {
    const spy = vi.spyOn(tracking, "trackWhatsAppClick").mockImplementation(() => {});
    render(<WhatsAppLink service="pilates" from="/pilates">Agendar</WhatsAppLink>);
    await userEvent.click(screen.getByRole("link"));
    expect(spy).toHaveBeenCalledWith({ service: "pilates", from: "/pilates" });
    spy.mockRestore();
  });
});
