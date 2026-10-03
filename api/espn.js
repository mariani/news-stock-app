// ESPN scoreboard proxy (no key needed; ESPN blocks cross-origin browser calls).
//
// ESPN's scoreboard now rejects date ranges (dates=YYYYMMDD-YYYYMMDD returns 400) and accepts only a
// single day, so a range is split into one request per day and the events are merged here.
const { proxyJson, getOnly, param } = require('./_lib/proxy');

const LEAGUES = new Set([
  'basketball/nba',
  'football/nfl',
  'baseball/mlb',
  'hockey/nhl',
  'soccer/eng.1',
  'soccer/eng.fa',
  'soccer/eng.league_cup',
  'soccer/uefa.champions',
  'soccer/uefa.europa',
  'soccer/usa.1',
]);
const SINGLE = /^\d{8}$/;
const RANGE = /^(\d{8})-(\d{8})$/;
const MAX_DAYS = 8;
const BASE = 'https://site.api.espn.com/apis/site/v2/sports';

// Today's games change by the minute; the days after it barely change, so they are cached far longer.
const TODAY_TTL_MS = 30 * 1000;
const FUTURE_TTL_MS = 10 * 60 * 1000;
const dayCache = new Map();

function toDate(yyyymmdd) {
  return new Date(Date.UTC(+yyyymmdd.slice(0, 4), +yyyymmdd.slice(4, 6) - 1, +yyyymmdd.slice(6, 8)));
}
function fmt(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}
function expandRange(start, end) {
  const days = [];
  for (let d = toDate(start); fmt(d) <= end && days.length <= MAX_DAYS; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(fmt(d));
  }
  return days;
}

async function fetchDay(league, day) {
  const key = `${league}:${day}`;
  const hit = dayCache.get(key);
  if (hit && Date.now() - hit.at < hit.ttl) return hit.events;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`${BASE}/${league}/scoreboard?dates=${day}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`ESPN ${res.status}`);
    const data = await res.json();
    const events = data.events || [];
    const ttl = day <= fmt(new Date()) ? TODAY_TTL_MS : FUTURE_TTL_MS;
    dayCache.set(key, { at: Date.now(), ttl, events });
    return events;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = async function handler(req, res) {
  if (!getOnly(req, res)) return;

  const league = param(req, 'league', 40);
  if (!league || !LEAGUES.has(league)) return res.status(400).json({ error: 'Unknown league' });
  const dates = param(req, 'dates', 17);

  const range = dates && RANGE.exec(dates);
  if (range) {
    const days = expandRange(range[1], range[2]);
    if (days.length > MAX_DAYS) return res.status(400).json({ error: `Range is limited to ${MAX_DAYS} days` });
    const settled = await Promise.allSettled(days.map(day => fetchDay(league, day)));
    const ok = settled.filter(s => s.status === 'fulfilled');
    if (ok.length === 0) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(502).json({ error: 'ESPN request failed' });
    }
    const byId = new Map();
    for (const s of ok) for (const event of s.value) byId.set(event.id, event);
    res.setHeader('Cache-Control', 'public, s-maxage=30');
    return res.status(200).json({ events: [...byId.values()] });
  }

  if (dates !== null && !SINGLE.test(dates)) return res.status(400).json({ error: 'Invalid dates' });
  const url = `${BASE}/${league}/scoreboard${dates ? `?dates=${dates}` : ''}`;
  return proxyJson(res, url, { cacheSeconds: 30 });
};
