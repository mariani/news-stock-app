import axios from 'axios';
import {NEWS_API_BASE_URL, ALPHA_VANTAGE_BASE_URL} from '@/constants/api';

// API keys are read at runtime so they can be swapped without rebuilding
let newsApiKey = '';
let alphaVantageApiKey = '';

export function setNewsApiKey(key: string) {
  newsApiKey = key;
}

export function setAlphaVantageApiKey(key: string) {
  alphaVantageApiKey = key;
}

// Use the CORS proxy whenever running in a web browser (including localhost).
// React Native native has no CORS restrictions so it skips the proxy.
function needsProxy(): boolean {
  return typeof window !== 'undefined' && window.location != null;
}

export const CORS_PROXY = 'https://api.codetabs.com/v1/proxy/?quest=';

function buildProxiedUrl(baseUrl: string, path: string, params: Record<string, string>): string {
  // codetabs expects the base URL unencoded, but ? and & encoded as %3F and %26
  const queryString = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}%3D${encodeURIComponent(v)}`)
    .join('%26');
  return `${CORS_PROXY}${baseUrl}${path}%3F${queryString}`;
}

export const newsApiClient = axios.create({
  baseURL: NEWS_API_BASE_URL,
  timeout: 15_000,
});

newsApiClient.interceptors.request.use(config => {
  config.params = {...config.params, apiKey: newsApiKey};

  if (needsProxy() && config.baseURL) {
    const fullUrl = buildProxiedUrl(
      config.baseURL,
      config.url ?? '',
      config.params,
    );
    config.baseURL = '';
    config.url = fullUrl;
    config.params = {};
  }

  return config;
});

export const alphaVantageClient = axios.create({
  baseURL: ALPHA_VANTAGE_BASE_URL,
  timeout: 15_000,
});

alphaVantageClient.interceptors.request.use(config => {
  config.params = {...config.params, apikey: alphaVantageApiKey};

  if (needsProxy() && config.baseURL) {
    const fullUrl = buildProxiedUrl(
      config.baseURL,
      config.url ?? '',
      {...config.params, _t: Date.now().toString()},
    );
    config.baseURL = '';
    config.url = fullUrl;
    config.params = {};
  }

  return config;
});
