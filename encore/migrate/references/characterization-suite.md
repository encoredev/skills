# Building the characterization suite

The suite replays HTTP scenarios against a base URL and compares each response with one recorded from the source. These rules come from suites that worked; most of them prevent a recording that the source itself cannot pass twice.

## Layout

```
migration/characterization/
  package.json        own dependencies, so the suite stays out of the app's build
  vitest.config.ts    (or a Go test package, or .hurl files)
  harness.ts          request helper, record and verify modes, normalizers
  deviations.ts       one entry per decided deviation: D1, D2, ...
  scenarios/          one file per area (users, articles, comments, ...)
  recordings/         recorded responses, one JSON file per scenario
```

Exclude `migration/**` from the app's own test config so that `encore test` does not pick the suite up. In Go, give `migration/characterization` its own `go.mod` instead; `encore test ./...` then skips it.

## Modes

Drive the suite with environment variables:

- `CHAR_BASE_URL`: the target. Do not name it `BASE_URL` in Vitest; Vite overwrites it.
- `CHAR_RECORD=1`: run against the source and write the recordings.
- `CHAR_TARGET=source`: verify against the raw recordings. The suite must pass this way against the source.
- `CHAR_TARGET=encore` (default): apply the listed deviations to each recording first, then verify. The suite must pass this way against the Encore app.

A step names the deviations that apply to it, for example `step("favorite unknown article", req, ["D3"])`. A deviation is a function from the recorded response and the request to the expected response (`D3: (r, req) => ({ ...r, status: 404 })`), so the suite always states the decided behavior and its target stays 100%. When the expected response differs per step, let the step state it under the deviation's ID.

A deviation that changes whether a write happens (a 500 that becomes a success, a create that becomes a redirect) changes the data that later steps read. Give such steps data that no later step reads.

## Data

- Each run creates a unique run ID. Put it in every generated value (usernames, emails, titles) so that runs never collide, and keep it out of step labels and recording keys so that recordings stay stable.
- Each scenario creates the data it reads through the API.
- Endpoints that list everything (all tags, all articles) also return other scenarios' data. Filter their responses down to items that carry the current run ID and scenario before comparing. When such an endpoint paginates, request the page that holds the newest items (read the total count, then set the offset), or the run's items fall off the first page once the database fills up.

## Normalizing

Compare status, the parsed and normalized body, and the headers clients rely on. Never compare raw bytes: Encore indents JSON locally. Compare `Content-Type` by media type, without parameters such as `charset`. Normalize:

- generated IDs, tokens, and timestamps, replacing them with placeholders (keep the raw values for later steps, such as a token for the next request). Number timestamp placeholders per object, not per response, because two records can share a millisecond in one run and not the next;
- collections the source returns in no defined order, sorting them before comparing.

## Proving the recording

After recording, run `CHAR_TARGET=source` against the source twice, with data already in the database. Anything that differs between those runs needs normalizing; a query without `ORDER BY` is the usual cause. The suite is ready when both runs pass. After changing any step's request, re-record from a fresh source database and repeat both runs.
