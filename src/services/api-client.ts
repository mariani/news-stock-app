import axios from 'axios';
import {NEWS_API_BASE_URL} from '@/constants/api';

// Native apps call NewsAPI directly with a key from react-native-config. The web build never holds a
// key: it calls our own /api/news function, which adds the key on the server.
let newsApiKey = '';

export function setNewsApiKey(key: string) {
  newsApiKey = key;
}

export function isWeb(): boolean {
  return typeof window !== 'undefined' && window.location != null;
}

export const newsApiClient = axios.create({
  baseURL: NEWS_API_BASE_URL,
  timeout: 15_000,
});

newsApiClient.interceptors.request.use(config => {
  if (isWeb()) {
    const endpoint = (config.url ?? '').replace(/^\//, '');
    config.baseURL = '';
    config.url = '/api/news';
    config.params = {endpoint, ...config.params};
  } else {
    config.params = {...config.params, apiKey: newsApiKey};
  }
  return config;
});
