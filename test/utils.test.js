import test from "node:test";
import assert from "node:assert/strict";

import { flattenEpisodes, matchClients } from "../src/utils.js";

test("matchClients supports multiple hints and deduplicates", () => {
  const clients = [
    { title: "Living Room TV", machineIdentifier: "A" },
    { title: "Bedroom TV", machineIdentifier: "B" },
    { title: "Office TV", machineIdentifier: "C" },
  ];

  const result = matchClients(clients, ["room", "office"]);

  assert.equal(result.unmatched.length, 0);
  assert.deepEqual(
    result.selected.map((client) => client.machineIdentifier).sort(),
    ["A", "B", "C"],
  );
});

test("matchClients reports unmatched hints", () => {
  const clients = [{ title: "Living Room", machineIdentifier: "A" }];
  const result = matchClients(clients, ["kitchen"]);
  assert.equal(result.selected.length, 0);
  assert.deepEqual(result.unmatched, ["kitchen"]);
});

test("flattenEpisodes separates direct episodes and shows", () => {
  const items = [
    { type: "episode", ratingKey: "1" },
    { type: "show", ratingKey: "200" },
    { type: "movie", ratingKey: "300" },
  ];

  const result = flattenEpisodes(items);

  assert.equal(result.episodes.length, 1);
  assert.deepEqual(result.showRatingKeys, ["200"]);
});
