interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  high: number;
  low: number;
  location: string;
}

let cachedWeather: {data: WeatherData; timestamp: number} | null = null;

export function clearWeatherCache() {
  cachedWeather = null;
}
const CACHE_DURATION_MS = 30 * 60 * 1000;

function mapWeatherCode(code: number): {condition: string; icon: string} {
  if (code === 0) return {condition: 'Clear', icon: '☀️'};
  if (code <= 3) return {condition: 'Partly Cloudy', icon: '⛅'};
  if (code <= 48) return {condition: 'Foggy', icon: '🌫️'};
  if (code <= 67) return {condition: 'Rain', icon: '🌧️'};
  if (code <= 77) return {condition: 'Snow', icon: '❄️'};
  if (code <= 82) return {condition: 'Showers', icon: '🌦️'};
  if (code <= 99) return {condition: 'Thunderstorm', icon: '⛈️'};
  return {condition: 'Unknown', icon: '🌡️'};
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10000,
      maximumAge: CACHE_DURATION_MS,
    });
  });
}

export async function fetchWeather(): Promise<WeatherData | null> {
  if (cachedWeather && Date.now() - cachedWeather.timestamp < CACHE_DURATION_MS) {
    return cachedWeather.data;
  }

  try {
    const position = await getPosition();
    const {latitude, longitude} = position.coords;

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min&timezone=auto&temperature_unit=fahrenheit`;
    const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;

    const [weatherRes, geoRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(geoUrl).catch(() => null),
    ]);
    const json = await weatherRes.json();

    let location = '';
    if (geoRes) {
      try {
        const geo = await geoRes.json();
        const city =
          geo.address?.city ||
          geo.address?.town ||
          geo.address?.village ||
          geo.address?.municipality ||
          geo.address?.hamlet ||
          geo.address?.suburb ||
          geo.address?.county ||
          '';
        const state = geo.address?.state || '';
        location = [city, state].filter(Boolean).join(', ');
      } catch {
        // ignore geocoding errors
      }
    }

    const {condition, icon} = mapWeatherCode(json.current.weathercode);
    const data: WeatherData = {
      temperature: Math.round(json.current.temperature_2m),
      condition,
      icon,
      high: Math.round(json.daily.temperature_2m_max[0]),
      low: Math.round(json.daily.temperature_2m_min[0]),
      location,
    };

    cachedWeather = {data, timestamp: Date.now()};
    return data;
  } catch {
    return null;
  }
}
