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

// Detect if running on localhost (where direct API calls work)
// or on a deployed site (where we need a CORS proxy)
function isLocalhost(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
}

const CORS_PROXY = 'https://api.codetabs.com/v1/proxy/?quest=';

function buildProxiedUrl(baseUrl: string, path: string, params: Record<string, string>): string {
  const queryString = Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  const targetUrl = `${baseUrl}${path}?${queryString}`;
  // codetabs expects the URL with ? and & encoded as %3F and %26
  return CORS_PROXY + encodeURIComponent(targetUrl);
}

export const newsApiClient = axios.create({
  baseURL: NEWS_API_BASE_URL,
  timeout: 15_000,
});

newsApiClient.interceptors.request.use(config => {
  config.params = {...config.params, apiKey: newsApiKey};

  if (!isLocalhost() && config.baseURL) {
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

  if (!isLocalhost() && config.baseURL) {
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
