import { describe, expect, it } from "vitest";
import {
  filterShips,
  type GitHubRelease,
} from "../src/domain/filter-ships";

const now = new Date("2026-09-27T12:00:00Z");

function release(
  overrides: Partial<GitHubRelease> = {},
): GitHubRelease {
  return {
    repository: "capturekit",
    tag: "v1.0.0",
    name: "Release 1.0.0",
    url: "https://github.com/example/capturekit/releases/tag/v1.0.0",
    draft: false,
    prerelease: false,
    publishedAt: "2026-09-20T12:00:00Z",
    ...overrides,
  };
}

describe("filterShips", () => {
  it("keeps published releases inside the period", () => {
    const result = filterShips([release()], 90, now);

    expect(result).toHaveLength(1);
  });

  it("rejects draft releases", () => {
    const result = filterShips(
      [release({ draft: true })],
      90,
      now,
    );

    expect(result).toHaveLength(0);
  });

  it("rejects prereleases", () => {
    const result = filterShips(
      [release({ prerelease: true })],
      90,
      now,
    );

    expect(result).toHaveLength(0);
  });

  it("rejects releases without a publication date", () => {
    const result = filterShips(
      [release({ publishedAt: null })],
      90,
      now,
    );

    expect(result).toHaveLength(0);
  });

  it("rejects releases older than the selected period", () => {
    const result = filterShips(
      [
        release({
          publishedAt: "2026-05-01T12:00:00Z",
        }),
      ],
      90,
      now,
    );

    expect(result).toHaveLength(0);
  });

  it("sorts newest ships first", () => {
    const result = filterShips(
      [
        release({
          tag: "v1.0.0",
          publishedAt: "2026-09-10T12:00:00Z",
        }),
        release({
          tag: "v1.1.0",
          publishedAt: "2026-09-25T12:00:00Z",
        }),
      ],
      90,
      now,
    );

    expect(result.map((item) => item.tag)).toEqual([
      "v1.1.0",
      "v1.0.0",
    ]);
  });
});