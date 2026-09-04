# Load test — 50k requests

**Question it answers:** does high request volume hammer the MarketCheck API?
**Answer: no.** The proxy's 60-second server-side cache means request volume
does not scale upstream calls — only unique queries (once per 60s) reach
MarketCheck.

## Result (`result-50k.json`)
50,000 requests @ 100 concurrency against the caching proxy:

| Metric | Value |
|---|---|
| Requests | 50,000 |
| Duration | 2.2 s |
| Throughput | ~22,600 req/s |
| Errors | 0 |
| Latency p50 / p95 / p99 | 3 / 9 / 12 ms |
| **MarketCheck calls during the 50k burst** | **0** |
| MarketCheck calls total (warm-up) | 6 |

The 6 upstream calls populated the cache from the handful of unique queries;
all 50,000 subsequent requests were served from cache — **zero** additional
MarketCheck calls. So 50k users cost ≈ (unique queries ÷ 60s), not 50k API hits.

## Method
`.context/loadtest-local.mjs` drives the dependency-free Node proxy
(`server/marketcheck-proxy.js`) — the reference implementation of the exact
60s-cache architecture used by the WordPress PHP proxy (`inc/marketcheck.php`).
Both expose an `upstream_calls` counter (Node: `/api/health`; WP:
`/wp-json/sportscars/v1/health`) so the cache-shielding is measurable in prod.

## Why not fire 50k at WP Engine staging
Staging is a shared, throttled box with the password gate in front — a 50k
burst there would trip its protections and isn't representative (a quick
controlled run measured ~6 req/s). Production throughput comes from WP Engine's
edge cache + CDN, not the origin. The upstream-calls counter is the metric that
actually matters for the "won't this hammer MarketCheck?" question, and it's
provable in production via the health endpoint.
