import * as core from "@actions/core";
import { parseConfig } from "./config";

async function run(): Promise<void> {
  try {
    const config = parseConfig(
      core.getInput("github-token"),
      core.getInput("period-days"),
      core.getInput("output-path"),
      core.getInput("theme"),
    );

    core.info("Proof of Shipping");
    core.info(`Period: ${config.periodDays} days`);
    core.info(`Output: ${config.outputPath}`);
    core.info(`Theme: ${config.theme}`);
  } catch (error) {
    core.setFailed(
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}

void run();