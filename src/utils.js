export function normalize(value) {
  return (value || "").trim().toLowerCase();
}

export function matchClients(clients, hints) {
  const selected = new Map();
  const unmatched = [];

  for (const hint of hints) {
    const normalizedHint = normalize(hint);
    const matches = clients.filter((client) => normalize(client.title).includes(normalizedHint));
    if (matches.length === 0) {
      unmatched.push(hint);
      continue;
    }

    for (const match of matches) {
      selected.set(match.machineIdentifier, match);
    }
  }

  return {
    selected: [...selected.values()],
    unmatched,
  };
}

export function flattenEpisodes(items) {
  const episodes = [];
  const showRatingKeys = [];

  for (const item of items) {
    if (item.type === "episode") {
      episodes.push(item);
    } else if (item.type === "show" && item.ratingKey) {
      showRatingKeys.push(item.ratingKey);
    }
  }

  return { episodes, showRatingKeys };
}

export function pickRandom(items) {
  if (!items || items.length === 0) {
    throw new Error("Cannot pick from an empty list");
  }
  return items[Math.floor(Math.random() * items.length)];
}
