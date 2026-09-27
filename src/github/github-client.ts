import * as github from "@actions/github";
import type { Ship } from "../domain/ship";

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

  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - periodDays);

  const repositories = await octokit.paginate(
    octokit.rest.repos.listForUser,
    {
      username,
      type: "owner",
      per_page: 100,
    },
  );

  const eligibleRepositories = repositories.filter(
    (repo) => !repo.private && !repo.fork,
  );

  const ships: Ship[] = [];

  for (const repository of eligibleRepositories) {
    const releases = await octokit.paginate(
      octokit.rest.repos.listReleases,
      {
        owner: username,
        repo: repository.name,
        per_page: 100,
      },
    );

    for (const release of releases) {
      if (release.draft || release.prerelease || !release.published_at) {
        continue;
      }

      const publishedAt = new Date(release.published_at);

      if (publishedAt < cutoff || publishedAt > now) {
        continue;
      }

      ships.push({
        repository: repository.name,
        tag: release.tag_name,
        name: release.name,
        url: release.html_url,
        publishedAt: release.published_at,
      });
    }
  }

  ships.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() -
      new Date(a.publishedAt).getTime(),
  );

  return {
    username,
    ships,
  };
}