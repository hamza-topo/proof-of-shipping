import type {
  ShippingEvent,
} from "./shipping-event";

export interface ShippingSummary {
  releases: number;
  mergedPullRequests: number;
  totalEvents: number;
  latestEvent: ShippingEvent | null;
}

export function buildShippingSummary(
  events: ShippingEvent[],
): ShippingSummary {
  const sortedEvents = [...events].sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() -
      new Date(a.occurredAt).getTime(),
  );

  return {
    releases: events.filter(
      (event) => event.type === "release",
    ).length,

    mergedPullRequests: events.filter(
      (event) =>
        event.type === "merged_pull_request",
    ).length,

    totalEvents: events.length,

    latestEvent: sortedEvents[0] ?? null,
  };
}