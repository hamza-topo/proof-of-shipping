import type {
  MergedPullRequestShippingEvent,
} from "./shipping-event";

export interface GitHubPullRequest {
  repository: string;
  number: number;
  title: string;
  url: string;
  author: string | null;
  mergedAt: string | null;
}

export function filterMergedPullRequests(
  pullRequests: GitHubPullRequest[],
  username: string,
  periodDays: number,
  now = new Date(),
): MergedPullRequestShippingEvent[] {
  const cutoff = new Date(now);

  cutoff.setUTCDate(
    cutoff.getUTCDate() - periodDays,
  );

  const normalizedUsername =
    username.toLowerCase();

  return pullRequests
    .filter((pullRequest) => {
      if (
        !pullRequest.mergedAt ||
        !pullRequest.author
      ) {
        return false;
      }

      if (
        pullRequest.author.toLowerCase() !==
        normalizedUsername
      ) {
        return false;
      }

      const mergedAt =
        new Date(pullRequest.mergedAt);

      return (
        mergedAt >= cutoff &&
        mergedAt <= now
      );
    })
    .sort(
      (a, b) =>
        new Date(b.mergedAt!).getTime() -
        new Date(a.mergedAt!).getTime(),
    )
    .map((pullRequest) => ({
      type: "merged_pull_request" as const,
      repository: pullRequest.repository,
      number: pullRequest.number,
      title: pullRequest.title,
      url: pullRequest.url,
      mergedAt: pullRequest.mergedAt!,
      occurredAt: pullRequest.mergedAt!,
    }));
}