import {
  describe,
  expect,
  it,
} from "vitest";

import {
  filterMergedPullRequests,
  type GitHubPullRequest,
} from "../src/domain/filter-merged-pull-requests";

const now =
  new Date("2026-09-27T12:00:00Z");

function pullRequest(
  overrides: Partial<GitHubPullRequest> = {},
): GitHubPullRequest {
  return {
    repository: "capturekit",
    number: 42,
    title: "Add recording controls",
    url: "https://github.com/example/capturekit/pull/42",
    author: "hamza-topo",
    mergedAt: "2026-09-20T12:00:00Z",
    ...overrides,
  };
}

describe("filterMergedPullRequests", () => {
  it("keeps merged pull requests authored by the developer", () => {
    const result =
      filterMergedPullRequests(
        [pullRequest()],
        "hamza-topo",
        90,
        now,
      );

    expect(result).toHaveLength(1);
  });

  it("rejects unmerged pull requests", () => {
    const result =
      filterMergedPullRequests(
        [
          pullRequest({
            mergedAt: null,
          }),
        ],
        "hamza-topo",
        90,
        now,
      );

    expect(result).toHaveLength(0);
  });

  it("rejects pull requests authored by another developer", () => {
    const result =
      filterMergedPullRequests(
        [
          pullRequest({
            author: "someone-else",
          }),
        ],
        "hamza-topo",
        90,
        now,
      );

    expect(result).toHaveLength(0);
  });

  it("matches GitHub usernames case-insensitively", () => {
    const result =
      filterMergedPullRequests(
        [
          pullRequest({
            author: "HAMZA-TOPO",
          }),
        ],
        "hamza-topo",
        90,
        now,
      );

    expect(result).toHaveLength(1);
  });

  it("rejects pull requests outside the period", () => {
    const result =
      filterMergedPullRequests(
        [
          pullRequest({
            mergedAt:
              "2026-01-01T12:00:00Z",
          }),
        ],
        "hamza-topo",
        90,
        now,
      );

    expect(result).toHaveLength(0);
  });

  it("sorts newest merged pull requests first", () => {
    const result =
      filterMergedPullRequests(
        [
          pullRequest({
            number: 1,
            mergedAt:
              "2026-09-10T12:00:00Z",
          }),
          pullRequest({
            number: 2,
            mergedAt:
              "2026-09-25T12:00:00Z",
          }),
        ],
        "hamza-topo",
        90,
        now,
      );

    expect(
      result.map(
        (pullRequest) =>
          pullRequest.number,
      ),
    ).toEqual([2, 1]);
  });
});