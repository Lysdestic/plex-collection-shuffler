# TODO

## Interactive Setup

- [ ] Add optional `--non-interactive` mode for CI/server environments.
- [x] Support selecting all clients with `*` at the clients prompt.
- [ ] Persist last successful setup choices separately from `.env.example`.
- [ ] Add setup unit tests for numeric, range, and mixed client input.

## Playback and Reliability

- [ ] Add retry/backoff around collection and episode fetch operations.
- [ ] Improve error output when library or collection names are close matches.
- [ ] Add optional dry-run mode to validate config and discovered targets only.

## Project Maintenance

- [ ] Add a changelog file and start tracking user-facing changes.
- [ ] Add a smoke test script that validates `.env` and required Plex connectivity.
- [ ] Add npm script aliases for common flows (`setup`, `start`, `test`).
