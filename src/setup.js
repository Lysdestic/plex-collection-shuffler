import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import dotenv from "dotenv";

const ENV_PATH = path.resolve(process.cwd(), ".env");
const EXAMPLE_ENV_PATH = path.resolve(process.cwd(), ".env.example");

const TRUE_VALUES = new Set(["1", "true", "yes", "y", "on"]);
const FALSE_VALUES = new Set(["0", "false", "no", "n", "off"]);

async function loadEnvValues(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return dotenv.parse(raw);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return {};
    }
    throw error;
  }
}

function parseBooleanInput(value, fallback = "true") {
  const normalized = String(value ?? fallback).trim().toLowerCase();
  if (TRUE_VALUES.has(normalized)) return "true";
  if (FALSE_VALUES.has(normalized)) return "false";
  return null;
}

function buildEnvFile(values) {
  return [
    `PLEX_URL=${values.PLEX_URL}`,
    `PLEX_TOKEN=${values.PLEX_TOKEN}`,
    "",
    "# Comma-separated partial names. Example simulcast:",
    "# PLEX_CLIENTS=Living Room,Bedroom",
    `PLEX_CLIENTS=${values.PLEX_CLIENTS}`,
    "",
    `PLEX_LIBRARY=${values.PLEX_LIBRARY}`,
    `PLEX_COLLECTION=${values.PLEX_COLLECTION}`,
    "",
    "# Optional: set false to use legacy single-episode queue behavior.",
    `PLEX_SHUFFLE_CONTINUOUS=${values.PLEX_SHUFFLE_CONTINUOUS}`,
    "",
  ].join("\n");
}

async function promptNonEmpty(rl, label, fallback = "") {
  while (true) {
    const suffix = fallback ? ` [${fallback}]` : "";
    const answer = (await rl.question(`${label}${suffix}: `)).trim();
    const value = answer || fallback;
    if (value) return value;
    console.log(`${label} is required.`);
  }
}

async function promptBoolean(rl, label, fallback = "true") {
  while (true) {
    const current = fallback === "false" ? "false" : "true";
    const answer = await rl.question(`${label} (${current}) [true/false]: `);
    const parsed = parseBooleanInput(answer || fallback, fallback);
    if (parsed) return parsed;
    console.log("Please enter true or false.");
  }
}

async function main() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("Interactive setup requires a TTY terminal.");
  }

  const [existingValues, exampleValues] = await Promise.all([
    loadEnvValues(ENV_PATH),
    loadEnvValues(EXAMPLE_ENV_PATH),
  ]);

  const defaults = {
    PLEX_URL: existingValues.PLEX_URL || exampleValues.PLEX_URL || "http://host:32400",
    PLEX_TOKEN: existingValues.PLEX_TOKEN || exampleValues.PLEX_TOKEN || "",
    PLEX_CLIENTS:
      existingValues.PLEX_CLIENTS ||
      existingValues.PLEX_CLIENT ||
      exampleValues.PLEX_CLIENTS ||
      "Living Room",
    PLEX_LIBRARY: existingValues.PLEX_LIBRARY || exampleValues.PLEX_LIBRARY || "TV Shows",
    PLEX_COLLECTION: existingValues.PLEX_COLLECTION || exampleValues.PLEX_COLLECTION || "",
    PLEX_SHUFFLE_CONTINUOUS:
      parseBooleanInput(existingValues.PLEX_SHUFFLE_CONTINUOUS, "true") ||
      parseBooleanInput(exampleValues.PLEX_SHUFFLE_CONTINUOUS, "true") ||
      "true",
  };

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    console.log("Plex Episode Shuffler interactive setup");
    console.log("Press Enter to accept a default value.");
    console.log("");

    const values = {
      PLEX_URL: await promptNonEmpty(rl, "Plex server URL", defaults.PLEX_URL),
      PLEX_TOKEN: await promptNonEmpty(rl, "Plex token", defaults.PLEX_TOKEN),
      PLEX_CLIENTS: await promptNonEmpty(rl, "Plex clients (comma-separated)", defaults.PLEX_CLIENTS),
      PLEX_LIBRARY: await promptNonEmpty(rl, "Plex library title", defaults.PLEX_LIBRARY),
      PLEX_COLLECTION: await promptNonEmpty(rl, "Plex collection title", defaults.PLEX_COLLECTION),
      PLEX_SHUFFLE_CONTINUOUS: await promptBoolean(
        rl,
        "Use shuffled continuous play queue",
        defaults.PLEX_SHUFFLE_CONTINUOUS,
      ),
    };

    const confirmation = await rl.question(`Write configuration to ${ENV_PATH}? [Y/n]: `);
    const normalized = confirmation.trim().toLowerCase();
    if (normalized && normalized !== "y" && normalized !== "yes") {
      console.log("Cancelled. No changes were written.");
      return;
    }

    await fs.writeFile(ENV_PATH, buildEnvFile(values), "utf8");
    console.log(`Saved ${ENV_PATH}`);
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(`Setup error: ${error.message}`);
  process.exitCode = 1;
});
