import { describe, it, expect } from "vitest";
import { redactSecrets } from "../lib/redact";

describe("redactSecrets", () => {
  it("redacts emails and bearer tokens", () => {
    const input = "email test@example.com\nAuthorization: Bearer abc.def.ghi";
    const out = redactSecrets(input);
    expect(out).not.toContain("test@example.com");
    expect(out).toContain("[REDACTED]");
  });

  it("redacts secret=VALUE patterns", () => {
    const input = "password=supersecret token=abcd1234";
    const out = redactSecrets(input);
    expect(out).toContain("password=[REDACTED]");
    expect(out).toContain("token=[REDACTED]");
  });
});
