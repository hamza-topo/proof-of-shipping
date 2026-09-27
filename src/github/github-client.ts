import * as github from "@actions/github";
import type { Ship } from "../domain/ship";
import {
  filterShips,
  type GitHubRelease,
} from "../domain/filter-ships";

export interface ShippingData {
  username: string;
  ships: Ship[];
}

export async function fetchShips(
  token: string,
  username: string,
  periodDays: number,
  now = new Date(),
): Promise<ShippingData> {
  const octokit = github.getOctokit(token);

  const repositories = await octokit.paginate(
    octokit.rest.repos.listForUser,
    {
      username,
      type: "owner",
      per_page: 100,
    },
  );

  const eligibleRepositories = repositories.filter(
    (repository) =>
      !repository.private &&
      !repository.fork,
  );

  const releases: GitHubRelease[] = [];

  for (const repository of eligibleRepositories) {
    const repositoryReleases = await octokit.paginate(
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
  }

  return {
    username,
    ships: filterShips(releases, periodDays, now),
  };
}