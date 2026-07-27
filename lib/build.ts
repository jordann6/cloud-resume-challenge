import pkg from "../package.json";

// Server-only module: every deploy is a build, so these are evaluated once at
// build time and passed down as props. Keeps the HUD and footer from drifting
// into stale hardcoded strings.
const now = new Date();

/** Issue marker in the top-left HUD, e.g. "07 / 2026". */
export const buildVol = `${(now.getUTCMonth() + 1)
  .toString()
  .padStart(2, "0")} / ${now.getUTCFullYear()}`;

/** Design-system version, tracked by package.json (3.0.0 -> v3.0). */
export const siteVersion = `v${pkg.version.split(".").slice(0, 2).join(".")}`;

export const buildYear = now.getUTCFullYear();

/** "2026-07-27 16:20 UTC" — the honest last-deployed timestamp. */
export const deployedAt =
  now.toISOString().slice(0, 16).replace("T", " ") + " UTC";
