import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN, {
  api_host: "/ingest",
  ui_host: "https://eu.posthog.com",
  defaults: "2026-01-30",
  // Netlify proxying can corrupt gzip-js payloads to /ingest; send plain JSON instead.
  disable_compression: true,
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
});
