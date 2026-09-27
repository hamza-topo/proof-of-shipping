export interface Config {
  githubToken: string;
  periodDays: number;
  outputPath: string;
  theme: string;
}

export function parseConfig(
  githubToken: string,
  periodDays: string,
  outputPath: string,
  theme: string,
): Config {
  const days = Number(periodDays);

  if (!githubToken.trim()) {
    throw new Error("github-token is required");
  }

  if (!Number.isInteger(days) || days <= 0) {
    throw new Error("period-days must be a positive integer");
  }

  return {
    githubToken,
    periodDays: days,
    outputPath: outputPath.trim() || "proof-of-shipping.svg",
    theme: theme.trim() || "dark",
  };
}