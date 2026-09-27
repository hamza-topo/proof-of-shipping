import * as core from "@actions/core";
import * as github from "@actions/github";

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { parseConfig } from "./config";
import { buildShippingSummary } from "./domain/shipping-summary";
import { fetchShips } from "./github/github-client";
import { renderShippingCard } from "./render/shipping-card";

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

    const summary = buildShippingSummary(
      shipping.events,
    );

    const svg = renderShippingCard(
      summary,
      {
        username,
        periodDays: config.periodDays,
        theme:
          config.theme === "light"
            ? "light"
            : "dark",
      },
    );

    await mkdir(
      dirname(config.outputPath),
      {
        recursive: true,
      },
    );

    await writeFile(
      config.outputPath,
      svg,
      "utf8",
    );

    core.info(
      `Generated ${config.outputPath}`,
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