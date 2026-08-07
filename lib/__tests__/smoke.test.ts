import { describe, it, expect } from "vitest";
import { formatPhone } from "../format";

describe("formatPhone", () => {
  it("formats an E.164 Brazilian mobile for display", () => {
    expect(formatPhone("+5511989172311")).toBe("(11) 98917-2311");
  });
});
