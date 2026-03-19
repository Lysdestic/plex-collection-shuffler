export function parseClientHints(rawClients, rawClient) {
  const source = rawClients || rawClient || "";
  return source
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBoolean(value, defaultValue) {
  if (value == null || value === "") return defaultValue;
  const normalized = String(value).trim().toLowerCase();
  return !["0", "false", "no", "off"].includes(normalized);
}

export function readConfig(env = process.env) {
  const config = {
    plexUrl: (env.PLEX_URL || "").trim().replace(/\/$/, ""),
    plexToken: (env.PLEX_TOKEN || "").trim(),
    library: (env.PLEX_LIBRARY || "").trim(),
    collection: (env.PLEX_COLLECTION || "").trim(),
    clientHints: parseClientHints(env.PLEX_CLIENTS, env.PLEX_CLIENT),
    shuffleContinuous: parseBoolean(env.PLEX_SHUFFLE_CONTINUOUS, true),
  };

  const missing = [];
  if (!config.plexUrl) missing.push("PLEX_URL");
  if (!config.plexToken) missing.push("PLEX_TOKEN");
  if (!config.library) missing.push("PLEX_LIBRARY");
  if (!config.collection) missing.push("PLEX_COLLECTION");
  if (config.clientHints.length === 0) missing.push("PLEX_CLIENTS (or PLEX_CLIENT)");

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return config;
}
