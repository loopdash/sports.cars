"use strict";

/*
 * exterior-first
 * --------------
 * MarketCheck returns a listing's photos in the order the dealer uploaded
 * them, with no tag for which shot is the exterior. When a dealer leads with
 * an interior or a detail shot, the gallery inherits it and the listing opens
 * on something that isn't the car.
 *
 * This module picks the first exterior photo and moves it to the front. The
 * vision call that decides "exterior vs interior" is injected, so every part
 * of the pipeline around it — reordering, the VIN cache, the fall-back on
 * failure, and the Anthropic request/response shape — is deterministic and
 * unit-tested. Zero dependencies, to match the rest of the proxy.
 */

/**
 * Move the first exterior photo to the front, preserving the relative order of
 * every other photo. Pure — never mutates the input.
 *
 * @param {string[]} photos  Ordered photo URLs from MarketCheck.
 * @param {number}   index   Index of the first exterior photo. Anything that
 *                           isn't a valid, non-leading index (unknown, 0, out
 *                           of range, non-integer) leaves the order untouched.
 * @returns {string[]} A new array.
 */
function orderPhotosExteriorFirst(photos, index) {
  if (!Array.isArray(photos)) return [];
  if (photos.length <= 1) return photos.slice();
  if (!Number.isInteger(index) || index <= 0 || index >= photos.length) {
    return photos.slice();
  }
  const lead = photos[index];
  return [lead, ...photos.slice(0, index), ...photos.slice(index + 1)];
}

/**
 * Given per-photo labels, return the index of the first exterior shot, or -1
 * if none are labelled exterior. Labels are matched case-insensitively so the
 * classifier can return "Exterior" or "exterior".
 *
 * @param {Array<string|null|undefined>} labels
 * @returns {number}
 */
function firstExteriorIndexFromLabels(labels) {
  if (!Array.isArray(labels)) return -1;
  for (let i = 0; i < labels.length; i++) {
    if (typeof labels[i] === "string" && labels[i].toLowerCase() === "exterior") {
      return i;
    }
  }
  return -1;
}

/**
 * Apply an exterior-first ordering to a normalized listing, updating both the
 * lead `photo` and the `photos` array. Pure — returns a new object.
 *
 * @param {object} listing  A normalized listing ({ photo, photos, ... }).
 * @param {number} index    First exterior index (see orderPhotosExteriorFirst).
 * @returns {object}
 */
function applyExteriorFirst(listing, index) {
  const photos = orderPhotosExteriorFirst(listing.photos, index);
  return { ...listing, photos, photo: photos[0] || null };
}

/**
 * Resolve the first-exterior index for a listing, caching the result by VIN so
 * a car is only classified once. The classifier runs only on a cache miss, and
 * only ever sees the first `maxProbe` photos (cost control — exteriors almost
 * always appear early). Any classifier failure falls back to index 0 (the
 * original MarketCheck order) and is not cached, so it can be retried later.
 *
 * @param {object}   opts
 * @param {string}   [opts.vin]      Cache key. Omit to skip caching.
 * @param {string[]} opts.photos
 * @param {object}   [opts.cache]    { get(key), set(key, value) } — may be async.
 * @param {Function} opts.classify   async (photos) => index (>=0, or -1/null).
 * @param {number}   [opts.maxProbe] Max photos to classify. Default 6.
 * @returns {Promise<number>} A usable lead index (>= 0).
 */
async function resolveExteriorIndex(opts) {
  const { vin, photos, cache, classify, maxProbe = 6 } = opts || {};
  if (!Array.isArray(photos) || photos.length <= 1) return 0;

  if (vin && cache) {
    const cached = await cache.get(cacheKey(vin));
    if (Number.isInteger(cached)) return cached;
  }

  let index = 0;
  try {
    const probe = photos.slice(0, Math.max(1, maxProbe));
    const result = await classify(probe);
    // A -1/null/undefined "no exterior found" answer keeps the original order.
    if (Number.isInteger(result) && result > 0 && result < photos.length) {
      index = result;
    }
    if (vin && cache) await cache.set(cacheKey(vin), index);
  } catch (err) {
    // Never let a classification failure break the listing — lead with the
    // dealer's first photo, and leave the cache empty so we retry next time.
    return 0;
  }
  return index;
}

function cacheKey(vin) {
  return `sc_exterior_idx_${vin}`;
}

/**
 * Build a classifier backed by Claude vision. Returns an async function that
 * takes photo URLs and resolves to the index of the first exterior shot (or -1
 * if none). `fetchImpl` and everything network-facing is injected so the
 * request/response handling can be tested without a live call.
 *
 * Uses Haiku — exterior-vs-interior needs no heavy reasoning — with a strict
 * JSON schema so the answer parses deterministically.
 *
 * @param {object}   opts
 * @param {string}   opts.apiKey
 * @param {string}   [opts.model]      Default "claude-haiku-4-5".
 * @param {Function} [opts.fetchImpl]  Defaults to global fetch.
 * @returns {(photos: string[]) => Promise<number>}
 */
function createAnthropicClassifier(opts) {
  const { apiKey, model = "claude-haiku-4-5", fetchImpl } = opts || {};
  const doFetch = fetchImpl || (typeof fetch !== "undefined" ? fetch : null);
  if (!apiKey) throw new Error("createAnthropicClassifier: apiKey is required");
  if (!doFetch) throw new Error("createAnthropicClassifier: no fetch available");

  return async function classify(photos) {
    const images = photos.map((url) => ({
      type: "image",
      source: { type: "url", url },
    }));
    const body = {
      model,
      max_tokens: 128,
      messages: [
        {
          role: "user",
          content: [
            ...images,
            {
              type: "text",
              text:
                "These are photos of one used car, in order. Return the " +
                "0-based index of the first photo that is an EXTERIOR shot of " +
                "the whole car (not an interior, engine, wheel, or detail " +
                "shot). If none are exterior shots, return -1.",
            },
          ],
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: { first_exterior_index: { type: "integer" } },
            required: ["first_exterior_index"],
          },
        },
      },
    };

    const res = await doFetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`anthropic classify failed: HTTP ${res.status}`);
    }
    const data = await res.json();
    return parseExteriorIndex(data);
  };
}

/**
 * Pull the first-exterior index out of a Messages API response. Reads the JSON
 * from the first text block (structured-output shape). Returns -1 when the
 * response is missing, malformed, or reports no exterior. Exported for testing.
 *
 * @param {object} data  A parsed /v1/messages response body.
 * @returns {number}
 */
function parseExteriorIndex(data) {
  const blocks = (data && data.content) || [];
  const textBlock = blocks.find((b) => b && b.type === "text");
  if (!textBlock || typeof textBlock.text !== "string") return -1;
  let parsed;
  try {
    parsed = JSON.parse(textBlock.text);
  } catch (err) {
    return -1;
  }
  const idx = parsed && parsed.first_exterior_index;
  return Number.isInteger(idx) ? idx : -1;
}

module.exports = {
  orderPhotosExteriorFirst,
  firstExteriorIndexFromLabels,
  applyExteriorFirst,
  resolveExteriorIndex,
  createAnthropicClassifier,
  parseExteriorIndex,
  cacheKey,
};
