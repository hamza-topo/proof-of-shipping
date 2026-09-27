export interface BaseShippingEvent {
  repository: string;
  url: string;
  occurredAt: string;
}

export interface ReleaseShippingEvent extends BaseShippingEvent {
  type: "release";
  tag: string;
  name: string | null;
  publishedAt: string;
}

export interface MergedPullRequestShippingEvent
  extends BaseShippingEvent {
  type: "merged_pull_request";
  number: number;
  title: string;
  mergedAt: string;
}

export type ShippingEvent =
  | ReleaseShippingEvent
  | MergedPullRequestShippingEvent;