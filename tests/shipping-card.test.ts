import {
  describe,
  expect,
  it,
} from "vitest";

import {
  renderShippingCard,
} from "../src/render/shipping-card";

describe("renderShippingCard", () => {
  it("renders shipping metrics", () => {
    const svg = renderShippingCard(
      {
        releases: 2,
        mergedPullRequests: 7,
        totalEvents: 9,
        latestEvent: {
          type: "merged_pull_request",
          repository: "petmingle",
          number: 101,
          title: "Example",
          url: "https://github.com/example/pull/101",
          mergedAt: "2026-09-27T12:00:00Z",
          occurredAt: "2026-09-27T12:00:00Z",
        },
      },
      {
        username: "hamza-topo",
        periodDays: 90,
        theme: "dark",
      },
    );

    expect(svg).toContain("Proof of Shipping");
    expect(svg).toContain("@hamza-topo");
    expect(svg).toContain("MERGED PRS");
    expect(svg).toMatch(/>\s*7\s*</);
    expect(svg).toContain("petmingle · PR #101");
    expect(svg).toContain("Example");
    expect(svg).toContain("Sep 27, 2026");
  });

  it("escapes XML-sensitive values", () => {
    const svg = renderShippingCard(
      {
        releases: 0,
        mergedPullRequests: 0,
        totalEvents: 0,
        latestEvent: null,
      },
      {
        username: `foo&bar`,
        periodDays: 90,
        theme: "light",
      },
    );

    expect(svg).toContain("foo&amp;bar");
    expect(svg).not.toContain("foo&bar");
  });
});