import type {
  ShippingSummary,
} from "../domain/shipping-summary";

export interface ShippingCardOptions {
  username: string;
  periodDays: number;
  theme: "dark" | "light";
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function latestDeliveryLabel(
  summary: ShippingSummary,
): string {
  const event = summary.latestEvent;

  if (!event) {
    return "No shipping activity yet";
  }

  if (event.type === "release") {
    return `${event.repository} ${event.tag}`;
  }

  return `${event.repository} #${event.number}`;
}

export function renderShippingCard(
  summary: ShippingSummary,
  options: ShippingCardOptions,
): string {
  const dark = options.theme === "dark";

  const background = dark ? "#0d1117" : "#ffffff";
  const border = dark ? "#30363d" : "#d0d7de";
  const primary = dark ? "#f0f6fc" : "#1f2328";
  const secondary = dark ? "#8b949e" : "#656d76";
  const accent = dark ? "#3fb950" : "#1a7f37";

  const latest = escapeXml(
    latestDeliveryLabel(summary),
  );

  const username = escapeXml(options.username);

  return `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="460"
  height="230"
  viewBox="0 0 460 230"
  role="img"
  aria-label="Proof of Shipping for ${username}"
>
  <rect
    x="0.5"
    y="0.5"
    width="459"
    height="229"
    rx="12"
    fill="${background}"
    stroke="${border}"
  />

  <style>
    .title {
      font: 600 18px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
      fill: ${primary};
    }

    .meta {
      font: 400 13px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
      fill: ${secondary};
    }

    .label {
      font: 500 14px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
      fill: ${secondary};
    }

    .value {
      font: 700 20px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
      fill: ${primary};
    }

    .latest {
      font: 600 14px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
      fill: ${primary};
    }

    .accent {
      fill: ${accent};
    }
  </style>

  <text x="24" y="36" class="title">
    Proof of Shipping
  </text>

  <text x="24" y="58" class="meta">
    @${username} · last ${options.periodDays} days
  </text>

  <circle
    cx="30"
    cy="101"
    r="5"
    class="accent"
  />

  <text x="44" y="106" class="label">
    Releases
  </text>

  <text x="190" y="106" class="value">
    ${summary.releases}
  </text>

  <circle
    cx="250"
    cy="101"
    r="5"
    class="accent"
  />

  <text x="264" y="106" class="label">
    Merged PRs
  </text>

  <text x="402" y="106" class="value">
    ${summary.mergedPullRequests}
  </text>

  <line
    x1="24"
    y1="132"
    x2="436"
    y2="132"
    stroke="${border}"
  />

  <text x="24" y="158" class="meta">
    Latest delivery
  </text>

  <text x="24" y="184" class="latest">
    ${latest}
  </text>

  <text x="24" y="208" class="meta">
    ${summary.totalEvents} shipping event(s) detected
  </text>
</svg>
`.trim();
}