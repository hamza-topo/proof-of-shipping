import * as core from "@actions/core";
import * as github from "@actions/github";
import { parseConfig } from "./config";
import { fetchShips } from "./github/github-client";

async function run(): Promise<void> {
  try {
    const config = parseConfig(
      core.getInput("github-token"),
      core.getInput("period-days"),
      core.getInput("output-path"),
      core.getInput("theme"),
    );

    const username = github.context.repo.owner;

    core.info(`Analyzing shipping activity for @${username}`);
    core.info(`Period: ${config.periodDays} days`);

    const shipping = await fetchShips(
      config.githubToken,
      username,
      config.periodDays,
    );

    core.info(
      `Found ${shipping.ships.length} shipped release(s).`,
    );

    for (const ship of shipping.ships) {
      core.info(
        `🚀 ${ship.repository} ${ship.tag} — ${ship.publishedAt}`,
      );
    }
  } catch (error) {
    core.setFailed(
      error instanceof Error
        ? error.message
        : "Unknown error",
    );
  }
}

void run();