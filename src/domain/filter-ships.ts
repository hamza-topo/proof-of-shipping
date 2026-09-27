import type { Ship } from "./ship";

export interface GitHubRelease {
  repository: string;
  tag: string;
  name: string | null;
  url: string;
  draft: boolean;
  prerelease: boolean;
  publishedAt: string | null;
}

export function filterShips(
  releases: GitHubRelease[],
  periodDays: number,
  now = new Date(),
): Ship[] {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - periodDays);

  return releases
    .filter((release) => {
      if (
        release.draft ||
        release.prerelease ||
        !release.publishedAt
      ) {
        return false;
      }

      const publishedAt = new Date(release.publishedAt);

      return publishedAt >= cutoff && publishedAt <= now;
    })
    .sort(
      (a, b) =>
        new Date(b.publishedAt!).getTime() -
        new Date(a.publishedAt!).getTime(),
    )
    .map((release) => ({
      repository: release.repository,
      tag: release.tag,
      name: release.name,
      url: release.url,
      publishedAt: release.publishedAt!,
    }));
}