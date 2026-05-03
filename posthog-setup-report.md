<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into elpr.is, a Swedish electricity price visualization app built with Next.js (Pages Router).

**Changes made:**

- **`instrumentation-client.js`** (new) — Initializes PostHog on the client side using the recommended Next.js 15.3+ pattern. Configured with a reverse proxy (`/ingest`) for reliable event delivery and exception capture enabled.
- **`next.config.js`** — Added reverse proxy rewrites routing `/ingest/*` to the EU PostHog ingestion endpoint, plus `skipTrailingSlashRedirect: true` for PostHog API compatibility.
- **`components/Chart.js`** — Added `posthog.capture()` calls in all four user interaction handlers.
- **`.env.local`** — Created with `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` (EU region).

| Event | Description | File |
|-------|-------------|------|
| `area_toggled` | User toggles an electricity price area (SE1–SE4) on or off. Properties: `area`, `enabled`, `selected_areas`. | `components/Chart.js` |
| `show_now_toggled` | User toggles the "Just nu" current time marker on the chart. Properties: `enabled`. | `components/Chart.js` |
| `show_average_toggled` | User toggles the "Snitt graf" chart average line. Properties: `enabled`. | `components/Chart.js` |
| `show_average_30d_toggled` | User toggles the "Snitt 30 dagar" 30-day average line. Properties: `enabled`. | `components/Chart.js` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics:** https://eu.posthog.com/project/171384/dashboard/657486
- **Area toggles over time** (daily trend): https://eu.posthog.com/project/171384/insights/pVTfAFHf
- **Most toggled areas** (SE1–SE4 breakdown): https://eu.posthog.com/project/171384/insights/UPYHKUDR
- **Chart overlay toggles** (Just nu / Snitt graf / Snitt 30 dagar): https://eu.posthog.com/project/171384/insights/IAgoJr0I
- **Unique users interacting with chart** (DAU per event): https://eu.posthog.com/project/171384/insights/vjmDNLip
- **Area enable vs disable ratio** (adds vs removes): https://eu.posthog.com/project/171384/insights/6uQLt0Z4

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
