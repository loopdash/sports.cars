"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  orderPhotosExteriorFirst,
  firstExteriorIndexFromLabels,
  applyExteriorFirst,
  resolveExteriorIndex,
  createAnthropicClassifier,
  parseExteriorIndex,
  cacheKey,
} = require("./exterior-first.js");

const P = ["a.jpg", "b.jpg", "c.jpg", "d.jpg"]; // a=interior, b=exterior, ...

/* ---------- orderPhotosExteriorFirst ---------- */

test("moves the first exterior photo to the front, keeping the rest in order", () => {
  assert.deepEqual(orderPhotosExteriorFirst(P, 1), ["b.jpg", "a.jpg", "c.jpg", "d.jpg"]);
});

test("moves a later exterior photo to the front", () => {
  assert.deepEqual(orderPhotosExteriorFirst(P, 2), ["c.jpg", "a.jpg", "b.jpg", "d.jpg"]);
});

test("index 0 (already exterior-first) is unchanged", () => {
  assert.deepEqual(orderPhotosExteriorFirst(P, 0), P);
});

test("unknown index (-1) leaves the order untouched", () => {
  assert.deepEqual(orderPhotosExteriorFirst(P, -1), P);
});

test("out-of-range and non-integer indices leave the order untouched", () => {
  assert.deepEqual(orderPhotosExteriorFirst(P, 99), P);
  assert.deepEqual(orderPhotosExteriorFirst(P, 1.5), P);
  assert.deepEqual(orderPhotosExteriorFirst(P, null), P);
  assert.deepEqual(orderPhotosExteriorFirst(P, undefined), P);
});

test("does not mutate the input array", () => {
  const input = P.slice();
  orderPhotosExteriorFirst(input, 2);
  assert.deepEqual(input, P);
});

test("single-photo and empty and non-array inputs are safe", () => {
  assert.deepEqual(orderPhotosExteriorFirst(["only.jpg"], 3), ["only.jpg"]);
  assert.deepEqual(orderPhotosExteriorFirst([], 0), []);
  assert.deepEqual(orderPhotosExteriorFirst(null, 1), []);
});

/* ---------- firstExteriorIndexFromLabels ---------- */

test("finds the first exterior label, case-insensitively", () => {
  assert.equal(firstExteriorIndexFromLabels(["interior", "Exterior", "exterior"]), 1);
  assert.equal(firstExteriorIndexFromLabels(["EXTERIOR"]), 0);
});

test("returns -1 when no label is exterior or input is bad", () => {
  assert.equal(firstExteriorIndexFromLabels(["interior", "wheel"]), -1);
  assert.equal(firstExteriorIndexFromLabels([]), -1);
  assert.equal(firstExteriorIndexFromLabels(null), -1);
  assert.equal(firstExteriorIndexFromLabels([null, 3, "interior"]), -1);
});

/* ---------- applyExteriorFirst ---------- */

test("updates both the lead photo and the photos array", () => {
  const listing = { title: "car", photos: P.slice(), photo: "a.jpg" };
  const out = applyExteriorFirst(listing, 1);
  assert.equal(out.photo, "b.jpg");
  assert.deepEqual(out.photos, ["b.jpg", "a.jpg", "c.jpg", "d.jpg"]);
  assert.equal(out.title, "car"); // other fields preserved
});

test("does not mutate the input listing", () => {
  const listing = { photos: P.slice(), photo: "a.jpg" };
  applyExteriorFirst(listing, 2);
  assert.equal(listing.photo, "a.jpg");
  assert.deepEqual(listing.photos, P);
});

test("empty photos yields a null lead photo", () => {
  const out = applyExteriorFirst({ photos: [], photo: null }, 0);
  assert.equal(out.photo, null);
  assert.deepEqual(out.photos, []);
});

/* ---------- resolveExteriorIndex ---------- */

function memoryCache() {
  const store = new Map();
  return {
    store,
    get: (k) => store.get(k),
    set: (k, v) => void store.set(k, v),
  };
}

test("classifies on a cache miss, then caches the result", async () => {
  const cache = memoryCache();
  let calls = 0;
  const classify = async () => {
    calls++;
    return 1;
  };
  const idx = await resolveExteriorIndex({ vin: "VIN1", photos: P, cache, classify });
  assert.equal(idx, 1);
  assert.equal(calls, 1);
  assert.equal(cache.store.get(cacheKey("VIN1")), 1);
});

test("a cache hit skips the classifier entirely", async () => {
  const cache = memoryCache();
  cache.store.set(cacheKey("VIN1"), 2);
  let calls = 0;
  const classify = async () => {
    calls++;
    return 0;
  };
  const idx = await resolveExteriorIndex({ vin: "VIN1", photos: P, cache, classify });
  assert.equal(idx, 2);
  assert.equal(calls, 0);
});

test("caches a resolved index of 0 so we don't re-classify a lead-is-exterior car", async () => {
  const cache = memoryCache();
  const idx = await resolveExteriorIndex({
    vin: "VIN1",
    photos: P,
    cache,
    classify: async () => 0,
  });
  assert.equal(idx, 0);
  assert.equal(cache.store.get(cacheKey("VIN1")), 0);
});

test("classifier failure falls back to 0 and does NOT cache (so it retries)", async () => {
  const cache = memoryCache();
  const idx = await resolveExteriorIndex({
    vin: "VIN1",
    photos: P,
    cache,
    classify: async () => {
      throw new Error("network down");
    },
  });
  assert.equal(idx, 0);
  assert.equal(cache.store.has(cacheKey("VIN1")), false);
});

test("a nonsense classifier index (-1, out of range) falls back to 0", async () => {
  for (const bad of [-1, 99, null, 1.5]) {
    const idx = await resolveExteriorIndex({ photos: P, classify: async () => bad });
    assert.equal(idx, 0, `index ${bad} should fall back to 0`);
  }
});

test("only the first maxProbe photos are sent to the classifier", async () => {
  let seen = null;
  const many = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];
  await resolveExteriorIndex({
    photos: many,
    maxProbe: 3,
    classify: async (probe) => {
      seen = probe;
      return 0;
    },
  });
  assert.deepEqual(seen, ["0", "1", "2"]);
});

test("no vin means no caching, but classification still runs", async () => {
  const cache = memoryCache();
  const idx = await resolveExteriorIndex({ photos: P, cache, classify: async () => 1 });
  assert.equal(idx, 1);
  assert.equal(cache.store.size, 0);
});

test("zero or one photo short-circuits without classifying", async () => {
  let calls = 0;
  const classify = async () => {
    calls++;
    return 1;
  };
  assert.equal(await resolveExteriorIndex({ photos: [], classify }), 0);
  assert.equal(await resolveExteriorIndex({ photos: ["one.jpg"], classify }), 0);
  assert.equal(calls, 0);
});

/* ---------- parseExteriorIndex ---------- */

test("parses the index out of a structured-output response", () => {
  const data = { content: [{ type: "text", text: '{"first_exterior_index": 2}' }] };
  assert.equal(parseExteriorIndex(data), 2);
});

test("returns -1 for missing, malformed, or non-integer responses", () => {
  assert.equal(parseExteriorIndex({ content: [] }), -1);
  assert.equal(parseExteriorIndex({}), -1);
  assert.equal(parseExteriorIndex(null), -1);
  assert.equal(parseExteriorIndex({ content: [{ type: "text", text: "not json" }] }), -1);
  assert.equal(
    parseExteriorIndex({ content: [{ type: "text", text: '{"first_exterior_index": "x"}' }] }),
    -1,
  );
});

/* ---------- createAnthropicClassifier ---------- */

test("builds a well-formed request and returns the parsed index", async () => {
  let captured = null;
  const fakeFetch = async (url, options) => {
    captured = { url, options };
    return {
      ok: true,
      json: async () => ({ content: [{ type: "text", text: '{"first_exterior_index": 1}' }] }),
    };
  };
  const classify = createAnthropicClassifier({ apiKey: "sk-test", fetchImpl: fakeFetch });
  const idx = await classify(["a.jpg", "b.jpg"]);

  assert.equal(idx, 1);
  assert.equal(captured.url, "https://api.anthropic.com/v1/messages");
  assert.equal(captured.options.method, "POST");
  assert.equal(captured.options.headers["x-api-key"], "sk-test");
  assert.equal(captured.options.headers["anthropic-version"], "2023-06-01");

  const body = JSON.parse(captured.options.body);
  assert.equal(body.model, "claude-haiku-4-5");
  // Two image blocks (as URLs) + one text instruction.
  const content = body.messages[0].content;
  assert.equal(content.filter((b) => b.type === "image").length, 2);
  assert.equal(content[0].source.url, "a.jpg");
  assert.equal(body.output_config.format.type, "json_schema");
});

test("throws on a non-OK HTTP response so the caller can fall back", async () => {
  const fakeFetch = async () => ({ ok: false, status: 429, json: async () => ({}) });
  const classify = createAnthropicClassifier({ apiKey: "sk-test", fetchImpl: fakeFetch });
  await assert.rejects(() => classify(["a.jpg"]), /HTTP 429/);
});

test("requires an api key", () => {
  assert.throws(() => createAnthropicClassifier({ fetchImpl: async () => ({}) }), /apiKey/);
});

test("the Anthropic classifier plugs into resolveExteriorIndex end-to-end", async () => {
  const fakeFetch = async () => ({
    ok: true,
    json: async () => ({ content: [{ type: "text", text: '{"first_exterior_index": 2}' }] }),
  });
  const classify = createAnthropicClassifier({ apiKey: "sk-test", fetchImpl: fakeFetch });
  const cache = memoryCache();
  const idx = await resolveExteriorIndex({ vin: "VIN9", photos: P, cache, classify });
  assert.equal(idx, 2);
  assert.equal(cache.store.get(cacheKey("VIN9")), 2);

  // And the reorder applies cleanly on top of the resolved index.
  const out = applyExteriorFirst({ photos: P.slice(), photo: P[0] }, idx);
  assert.equal(out.photo, "c.jpg");
});
