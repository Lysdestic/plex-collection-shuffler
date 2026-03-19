import test from "node:test";
import assert from "node:assert/strict";

import { parseClientHints, readConfig } from "../src/config.js";

test("parseClientHints supports comma-separated values", () => {
  assert.deepEqual(parseClientHints("Living Room, Bedroom ,  Office", ""), [
    "Living Room",
    "Bedroom",
    "Office",
  ]);
});

test("readConfig accepts legacy PLEX_CLIENT", () => {
  const config = readConfig({
    PLEX_URL: "http://localhost:32400",
    PLEX_TOKEN: "abc",
    PLEX_CLIENT: "Living Room",
    PLEX_LIBRARY: "TV Shows",
    PLEX_COLLECTION: "Star Trek",
  });

  assert.equal(config.clientHints.length, 1);
  assert.equal(config.clientHints[0], "Living Room");
});

test("readConfig rejects empty client selection", () => {
  assert.throws(
    () =>
      readConfig({
        PLEX_URL: "http://localhost:32400",
        PLEX_TOKEN: "abc",
        PLEX_LIBRARY: "TV Shows",
        PLEX_COLLECTION: "Star Trek",
      }),
    /PLEX_CLIENTS \(or PLEX_CLIENT\)/,
  );
});

test("readConfig can disable shuffled continuous mode", () => {
  const config = readConfig({
    PLEX_URL: "http://localhost:32400",
    PLEX_TOKEN: "abc",
    PLEX_CLIENT: "Living Room",
    PLEX_LIBRARY: "TV Shows",
    PLEX_COLLECTION: "Star Trek",
    PLEX_SHUFFLE_CONTINUOUS: "false",
  });

  assert.equal(config.shuffleContinuous, false);
});
