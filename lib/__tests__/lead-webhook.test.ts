import { afterEach, describe, expect, it, vi } from "vitest";
import { sendLead } from "../lead-webhook";

const row = { Código: "VY-GABCDE" };

afterEach(() => vi.restoreAllMocks());

describe("sendLead", () => {
  it("POSTs the row and the shared secret as JSON (Apps Script cannot read headers)", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("ok"));
    await sendLead(row, { url: "https://script.example/exec", secret: "s3", fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://script.example/exec");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ secret: "s3", row });
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("does nothing when no webhook is configured (previews, local builds)", async () => {
    const fetchImpl = vi.fn();
    await sendLead(row, { url: undefined, secret: "s3", fetchImpl });
    await sendLead(row, { url: "", secret: "s3", fetchImpl });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("logs and swallows a network failure", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchImpl = vi.fn().mockRejectedValue(new Error("ECONNRESET"));
    await expect(sendLead(row, { url: "https://x/exec", secret: "", fetchImpl })).resolves.toBeUndefined();
    expect(log).toHaveBeenCalledWith(expect.stringContaining("VY-GABCDE"), expect.anything());
  });

  it("logs a non-2xx answer as a failure", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    // Even an "ok" body does not make a server error a success.
    const fetchImpl = vi.fn().mockResolvedValue(new Response("ok", { status: 500 }));
    await sendLead(row, { url: "https://x/exec", secret: "", fetchImpl });
    expect(log).toHaveBeenCalledWith(expect.stringContaining("VY-GABCDE"), expect.stringContaining("500"));
  });

  it("logs an Apps Script refusal: it answers 200 even when the secret is wrong", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchImpl = vi.fn().mockResolvedValue(new Response("forbidden"));
    await sendLead(row, { url: "https://x/exec", secret: "wrong", fetchImpl });
    expect(log).toHaveBeenCalledWith(expect.stringContaining("VY-GABCDE"), expect.stringContaining("forbidden"));
  });

  it("stays quiet when the script answers ok", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    await sendLead(row, { url: "https://x/exec", secret: "s3", fetchImpl: vi.fn().mockResolvedValue(new Response("ok\n")) });
    expect(log).not.toHaveBeenCalled();
  });
});
