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

export const newsApiClient = axios.create({
  baseURL: NEWS_API_BASE_URL,
  timeout: 10_000,
});

newsApiClient.interceptors.request.use(config => {
  config.params = {...config.params, apiKey: newsApiKey};
  return config;
});

export const alphaVantageClient = axios.create({
  baseURL: ALPHA_VANTAGE_BASE_URL,
  timeout: 10_000,
});

alphaVantageClient.interceptors.request.use(config => {
  config.params = {...config.params, apikey: alphaVantageApiKey};
  return config;
});
