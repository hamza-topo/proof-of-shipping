import * as github from "@actions/github";

import {
  filterShips,
  type GitHubRelease,
} from "../domain/filter-ships";

import {
  filterMergedPullRequests,
  type GitHubPullRequest,
} from "../domain/filter-merged-pull-requests";

import type {
  ShippingEvent,
} from "../domain/shipping-event";

export interface ShippingData {
  username: string;
  events: ShippingEvent[];
}

export async function fetchShips(
  token: string,
  username: string,
  periodDays: number,
  now = new Date(),
): Promise<ShippingData> {
  const octokit =
    github.getOctokit(token);

  const repositories =
    await octokit.paginate(
      octokit.rest.repos.listForUser,
      {
        username,
        type: "owner",
        per_page: 100,
      },
    );

  const eligibleRepositories =
    repositories.filter(
      (repository) =>
        !repository.private &&
        !repository.fork,
    );

  const releases: GitHubRelease[] = [];
  const pullRequests: GitHubPullRequest[] = [];

  for (const repository of eligibleRepositories) {
    const repositoryReleases =
      await octokit.paginate(
        octokit.rest.repos.listReleases,
        {
          owner: username,
          repo: repository.name,
          per_page: 100,
        },
      );

    for (const release of repositoryReleases) {
      releases.push({
        repository: repository.name,
        tag: release.tag_name,
        name: release.name,
        url: release.html_url,
        draft: release.draft,
        prerelease: release.prerelease,
        publishedAt: release.published_at,
      });
    }

    const repositoryPullRequests =
      await octokit.paginate(
        octokit.rest.pulls.list,
        {
          owner: username,
          repo: repository.name,
          state: "closed",
          sort: "updated",
          direction: "desc",
          per_page: 100,
        },
      );

    for (const pullRequest of repositoryPullRequests) {
      pullRequests.push({
        repository: repository.name,
        number: pullRequest.number,
        title: pullRequest.title,
        url: pullRequest.html_url,
        author: pullRequest.user?.login ?? null,
        mergedAt: pullRequest.merged_at,
      });
    }
  }

  const events: ShippingEvent[] = [
    ...filterShips(
      releases,
      periodDays,
      now,
    ),

    ...filterMergedPullRequests(
      pullRequests,
      username,
      periodDays,
      now,
    ),
  ];

  events.sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() -
      new Date(a.occurredAt).getTime(),
  );

  return {
    username,
    events,
  };
}