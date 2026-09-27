import type {
  ShippingSummary,
} from "../domain/shipping-summary";

export interface ShippingCardOptions {
  username: string;
  periodDays: number;
  theme: "dark" | "light";
}

interface LatestDelivery {
  heading: string;
  description: string;
  date: string;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function truncate(
  value: string,
  maxLength: number,
): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function formatDate(
  isoDate: string,
): string {
  const date = new Date(isoDate);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

function getLatestDelivery(
  summary: ShippingSummary,
): LatestDelivery | null {
  const event = summary.latestEvent;

  if (!event) {
    return null;
  }

  if (event.type === "release") {
    return {
      heading: `${event.repository} · Release ${event.tag}`,
      description:
        event.name ??
        `Published release ${event.tag}`,
      date: formatDate(event.occurredAt),
    };
  }

  return {
    heading:
      `${event.repository} · PR #${event.number}`,
    description: event.title,
    date: formatDate(event.occurredAt),
  };
}

export function renderShippingCard(
  summary: ShippingSummary,
  options: ShippingCardOptions,
): string {
  const dark = options.theme === "dark";

  const background = dark
    ? "#0d1117"
    : "#ffffff";

  const surface = dark
    ? "#161b22"
    : "#f6f8fa";

  const border = dark
    ? "#30363d"
    : "#d0d7de";

  const primary = dark
    ? "#f0f6fc"
    : "#1f2328";

  const secondary = dark
    ? "#8b949e"
    : "#656d76";

  const accent = dark
    ? "#3fb950"
    : "#1a7f37";

  const badgeBackground = dark
    ? "#21262d"
    : "#eaeef2";

  const username = escapeXml(
    options.username,
  );

  const latest =
    getLatestDelivery(summary);

  const latestHeading = latest
    ? escapeXml(latest.heading)
    : "No shipping activity yet";

  const latestDescription = latest
    ? escapeXml(
        truncate(
          latest.description,
          58,
        ),
      )
    : "No public shipping events detected in this period.";

  const latestDate = latest
    ? escapeXml(latest.date)
    : "";

  return `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="520"
  height="310"
  viewBox="0 0 520 310"
  role="img"
  aria-label="Proof of Shipping for ${username}"
>
  <rect
    x="0.5"
    y="0.5"
    width="519"
    height="309"
    rx="14"
    fill="${background}"
    stroke="${border}"
  />

  <style>
    .title {
      font: 700 17px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
      letter-spacing: 0.4px;
      fill: ${primary};
    }

    .username {
      font: 400 13px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
      fill: ${secondary};
    }

    .badge {
      font: 600 11px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
      letter-spacing: 0.3px;
      fill: ${secondary};
    }

    .metric-label {
      font: 600 11px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
      letter-spacing: 0.5px;
      fill: ${secondary};
    }

    .metric-value {
      font: 700 28px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
      fill: ${primary};
    }

    .section-label {
      font: 600 11px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
      letter-spacing: 0.7px;
      fill: ${secondary};
    }

    .delivery-heading {
      font: 600 15px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
      fill: ${primary};
    }

    .delivery-description {
      font: 400 13px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
      fill: ${secondary};
    }

    .delivery-date {
      font: 500 12px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
      fill: ${secondary};
    }

    .footer {
      font: 400 11px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
      fill: ${secondary};
    }

    .accent {
      fill: ${accent};
    }
  </style>

  <!-- Header -->

  <text
    x="24"
    y="34"
    class="title"
  >
    PROOF OF SHIPPING
  </text>

  <text
    x="24"
    y="55"
    class="username"
  >
    @${username}
  </text>

  <rect
    x="408"
    y="20"
    width="88"
    height="26"
    rx="13"
    fill="${badgeBackground}"
  />

  <text
    x="452"
    y="37"
    text-anchor="middle"
    class="badge"
  >
    LAST ${options.periodDays} DAYS
  </text>

  <!-- Metrics -->

  <rect
    x="24"
    y="78"
    width="228"
    height="78"
    rx="10"
    fill="${surface}"
    stroke="${border}"
  />

  <text
    x="42"
    y="103"
    class="metric-label"
  >
    RELEASES
  </text>

  <text
    x="42"
    y="137"
    class="metric-value"
  >
    ${summary.releases}
  </text>

  <circle
    cx="225"
    cy="103"
    r="4"
    class="accent"
  />

  <rect
    x="268"
    y="78"
    width="228"
    height="78"
    rx="10"
    fill="${surface}"
    stroke="${border}"
  />

  <text
    x="286"
    y="103"
    class="metric-label"
  >
    MERGED PRS
  </text>

  <text
    x="286"
    y="137"
    class="metric-value"
  >
    ${summary.mergedPullRequests}
  </text>

  <circle
    cx="469"
    cy="103"
    r="4"
    class="accent"
  />

  <!-- Latest delivery -->

  <text
    x="24"
    y="188"
    class="section-label"
  >
    LATEST DELIVERY
  </text>

  <text
    x="24"
    y="215"
    class="delivery-heading"
  >
    ${latestHeading}
  </text>

  <text
    x="24"
    y="238"
    class="delivery-description"
  >
    ${latestDescription}
  </text>

  <text
    x="24"
    y="260"
    class="delivery-date"
  >
    ${latestDate}
  </text>

  <!-- Footer -->

  <line
    x1="24"
    y1="280"
    x2="496"
    y2="280"
    stroke="${border}"
  />

  <text
    x="24"
    y="300"
    class="footer"
  >
    ${summary.totalEvents} shipping ${
      summary.totalEvents === 1
        ? "event"
        : "events"
    }
  </text>
</svg>
`.trim();
}