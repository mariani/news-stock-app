// Shared by the /api functions. Files starting with "_" are not exposed as routes on Vercel.
const TIMEOUT_MS = 10000;

/**
 * Fetches `url` and relays the JSON to the browser. `cacheSeconds` sets a CDN cache (s-maxage) with no
 * stale-while-revalidate, so the CDN never serves data older than that. It also keeps the upstream
 * request count low (NewsAPI's free plan allows only 100 per day).
 */
async function proxyJson(res, url, { headers = {}, cacheSeconds = 0 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const upstream = await fetch(url, { headers, signal: controller.signal });
    const body = await upstream.text();
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
    if (upstream.ok && cacheSeconds > 0) {
      res.setHeader('Cache-Control', `public, s-maxage=${cacheSeconds}`);
    } else {
      res.setHeader('Cache-Control', 'no-store');
    }
    // Pass client-style errors (bad key, rate limit) through; hide upstream server failures as a 502.
    const status = upstream.ok ? 200 : upstream.status >= 500 ? 502 : upstream.status;
    res.status(status).send(body);
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    res.status(504).json({ error: 'Upstream request failed or timed out' });
  } finally {
    clearTimeout(timer);
  }
}

function getOnly(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return false;
  }
  return true;
}

// A query value as a short string, or null. (Repeated params arrive as arrays; take the first.)
function param(req, name, maxLength = 200) {
  const raw = req.query ? req.query[name] : undefined;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string' || value.length === 0 || value.length > maxLength) return null;
  return value;
}

module.exports = { proxyJson, getOnly, param };
