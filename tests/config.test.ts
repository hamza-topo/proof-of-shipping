import { describe, expect, it } from "vitest";
import { parseConfig } from "../src/config";

describe("parseConfig", () => {
  it("parses valid configuration", () => {
    const config = parseConfig(
      "token",
      "90",
      "proof-of-shipping.svg",
      "dark",
    );

    expect(config).toEqual({
      githubToken: "token",
      periodDays: 90,
      outputPath: "proof-of-shipping.svg",
      theme: "dark",
    });
  });

  it("rejects an empty GitHub token", () => {
    expect(() =>
      parseConfig("", "90", "proof-of-shipping.svg", "dark"),
    ).toThrow("github-token is required");
  });

  it("rejects an invalid period", () => {
    expect(() =>
      parseConfig("token", "0", "proof-of-shipping.svg", "dark"),
    ).toThrow("period-days must be a positive integer");
  });
});