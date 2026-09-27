# Proof of Shipping

> Don't show how much you code. Show what you ship.

Proof of Shipping is a GitHub Action that generates a visual card from your real public GitHub shipping activity.

It currently tracks:

- Published releases
- Merged pull requests authored by you
- Your latest delivery
- Activity during a configurable time period

No external server.  
No account.  
No database.  
Your data stays inside GitHub.

## Example

![Proof of Shipping](./proof-of-shipping.svg)

## Add it to your GitHub profile

GitHub profile READMEs live in a special repository whose name matches your GitHub username.

For example:

```text
hamza-topo/hamza-topo
```

### 1. Add the card to your profile README

Add this line to your profile `README.md`:

```md
![Proof of Shipping](./proof-of-shipping.svg)
```

### 2. Create the workflow

Create this file:

```text
.github/workflows/proof-of-shipping.yml
```

Add:

```yaml
name: Proof of Shipping

on:
  workflow_dispatch:
  schedule:
    - cron: "0 6 * * *"

permissions:
  contents: write

jobs:
  update:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout profile repository
        uses: actions/checkout@v5

      - name: Generate Proof of Shipping
        uses: hamza-topo/proof-of-shipping@v1
        with:
          github-token: ${{ github.token }}
          period-days: "90"
          output-path: "proof-of-shipping.svg"
          theme: "dark"

      - name: Commit generated card
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

          git add proof-of-shipping.svg

          if git diff --cached --quiet; then
            echo "No card changes to commit"
          else
            git commit -m "chore: update proof of shipping card"
            git push
          fi
```

### 3. Run it once

Open:

**Actions → Proof of Shipping → Run workflow**

The Action will generate:

```text
proof-of-shipping.svg
```

Your profile README will then display the card automatically.

The scheduled workflow refreshes it every day.

## Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `github-token` | Yes | — | GitHub token used to read activity |
| `period-days` | No | `90` | Number of days to analyze |
| `output-path` | No | `proof-of-shipping.svg` | Path of the generated SVG |
| `theme` | No | `dark` | Card theme: `dark` or `light` |

## How it works

```text
Public GitHub activity
        ↓
Proof of Shipping
        ↓
Releases + merged pull requests
        ↓
SVG card
        ↓
GitHub profile README
```

## Privacy

Proof of Shipping is serverless by design.

It does not require:

- an external API server
- a database
- an external account
- OAuth login
- analytics tracking
- external storage

The Action runs inside GitHub Actions and generates the SVG directly inside your repository.

## Current limitations

Version 1 currently analyzes public repositories owned by the GitHub user.

Contributions made to repositories owned by other users or organizations are not included yet.

## Development

Install dependencies:

```bash
npm install
```

Run the full validation suite:

```bash
npm run check
```

The suite covers configuration, GitHub activity filtering, shipping summaries, SVG generation and XML validity.

## Status

Proof of Shipping is currently in its first public version.

Current signals:

- Releases
- Merged pull requests
- Latest delivery

More shipping signals can be added in future versions.

## License

[MIT License](./LICENSE)