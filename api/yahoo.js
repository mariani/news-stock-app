// Yahoo Finance chart proxy (no key needed; Yahoo just doesn't allow browser cross-origin calls).
const { proxyJson, getOnly, param } = require('./_lib/proxy');

const RANGES = new Set(['1d', '5d', '1mo']);
const SYMBOL = /^[A-Za-z0-9.^=-]{1,15}$/;
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (compatible; news-stock-app)', Accept: 'application/json' };

module.exports = async function handler(req, res) {
  if (!getOnly(req, res)) return;

  const symbol = param(req, 'symbol', 15);
  const range = param(req, 'range', 5) || '1d';
  if (!symbol || !SYMBOL.test(symbol)) return res.status(400).json({ error: 'Invalid symbol' });
  if (!RANGES.has(range)) return res.status(400).json({ error: 'Invalid range' });

  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=${range}`;
  return proxyJson(res, url, { headers: HEADERS, cacheSeconds: 30 });
};
