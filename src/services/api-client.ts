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
// or on a deployed site (where we need a CORS proxy for NewsAPI)
function isLocalhost(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
}

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export const newsApiClient = axios.create({
  baseURL: NEWS_API_BASE_URL,
  timeout: 15_000,
});

newsApiClient.interceptors.request.use(config => {
  config.params = {...config.params, apiKey: newsApiKey};

  // On deployed sites, route through CORS proxy
  if (!isLocalhost() && config.baseURL) {
    const params = new URLSearchParams(config.params).toString();
    const targetUrl = `${config.baseURL}${config.url}?${params}`;
    config.baseURL = '';
    config.url = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;
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

  // Alpha Vantage also needs CORS proxy on deployed sites
  if (!isLocalhost() && config.baseURL) {
    const params = new URLSearchParams(config.params).toString();
    const targetUrl = `${config.baseURL}${config.url}?${params}`;
    config.baseURL = '';
    config.url = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;
    config.params = {};
  }

  return config;
});
