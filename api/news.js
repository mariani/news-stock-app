// NewsAPI proxy: the API key stays on the server (NEWS_API_KEY), never in the browser bundle.
const { proxyJson, getOnly, param } = require('./_lib/proxy');

const BASE = 'https://newsapi.org/v2';
const ALLOWED = {
  'top-headlines': ['category', 'country', 'language', 'q', 'pageSize', 'page'],
  everything: ['q', 'language', 'sortBy', 'pageSize', 'page', 'from', 'to', 'searchIn'],
};

module.exports = async function handler(req, res) {
  if (!getOnly(req, res)) return;

  const endpoint = param(req, 'endpoint', 30);
  if (!endpoint || !Object.prototype.hasOwnProperty.call(ALLOWED, endpoint)) {
    return res.status(400).json({ error: 'Unknown endpoint' });
  }
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'NEWS_API_KEY is not configured on the server' });

  const query = new URLSearchParams();
  for (const name of ALLOWED[endpoint]) {
    const value = param(req, name);
    if (value !== null) query.set(name, value);
  }
  query.set('apiKey', apiKey);

  return proxyJson(res, `${BASE}/${endpoint}?${query}`, { cacheSeconds: 600 });
};
