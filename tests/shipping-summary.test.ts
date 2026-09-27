import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildShippingSummary,
} from "../src/domain/shipping-summary";

import type {
  ShippingEvent,
} from "../src/domain/shipping-event";

describe("buildShippingSummary", () => {
  it("counts releases and merged pull requests", () => {
    const events: ShippingEvent[] = [
      {
        type: "release",
        repository: "project-a",
        tag: "v1.0.0",
        name: "Version 1",
        url: "https://github.com/example/project-a/releases/tag/v1.0.0",
        publishedAt: "2026-09-20T12:00:00Z",
        occurredAt: "2026-09-20T12:00:00Z",
      },
      {
        type: "merged_pull_request",
        repository: "project-b",
        number: 42,
        title: "Add feature",
        url: "https://github.com/example/project-b/pull/42",
        mergedAt: "2026-09-25T12:00:00Z",
        occurredAt: "2026-09-25T12:00:00Z",
      },
    ];

    const summary =
      buildShippingSummary(events);

    expect(summary.releases).toBe(1);
    expect(summary.mergedPullRequests).toBe(1);
    expect(summary.totalEvents).toBe(2);
  });

  it("returns the newest event as latestEvent", () => {
    const events: ShippingEvent[] = [
      {
        type: "merged_pull_request",
        repository: "project-a",
        number: 1,
        title: "Older",
        url: "https://github.com/example/project-a/pull/1",
        mergedAt: "2026-09-10T12:00:00Z",
        occurredAt: "2026-09-10T12:00:00Z",
      },
      {
        type: "merged_pull_request",
        repository: "project-a",
        number: 2,
        title: "Newest",
        url: "https://github.com/example/project-a/pull/2",
        mergedAt: "2026-09-25T12:00:00Z",
        occurredAt: "2026-09-25T12:00:00Z",
      },
    ];

    const summary =
      buildShippingSummary(events);

    expect(summary.latestEvent).not.toBeNull();

    expect(
      summary.latestEvent?.occurredAt,
    ).toBe(
      "2026-09-25T12:00:00Z",
    );
  });

  it("returns null latestEvent when there are no events", () => {
    const summary =
      buildShippingSummary([]);

    expect(summary.releases).toBe(0);
    expect(summary.mergedPullRequests).toBe(0);
    expect(summary.totalEvents).toBe(0);
    expect(summary.latestEvent).toBeNull();
  });
});