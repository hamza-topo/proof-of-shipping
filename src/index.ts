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

    const releases = shipping.events.filter(
      (event) => event.type === "release",
    );

    const mergedPullRequests = shipping.events.filter(
      (event) => event.type === "merged_pull_request",
    );

    core.info(
      `Found ${releases.length} release(s).`,
    );

    core.info(
      `Found ${mergedPullRequests.length} merged pull request(s).`,
    );

    for (const event of shipping.events) {
      if (event.type === "release") {
        core.info(
          `🚀 ${event.repository} ${event.tag} — ${event.occurredAt}`,
        );

        continue;
      }

      core.info(
        `✓ ${event.repository} #${event.number} — ${event.title} — ${event.occurredAt}`,
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