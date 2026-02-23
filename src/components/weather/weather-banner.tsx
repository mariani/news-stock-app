import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSettingsStore} from '@/store/settings-store';
import {fetchWeather} from '@/services/weather-service';
import {colors, spacing, fontSize} from '@/constants/theme';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  high: number;
  low: number;
  location: string;
}

export function WeatherBanner() {
  const weatherEnabled = useSettingsStore(s => s.weatherEnabled);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    if (!weatherEnabled) return;
    fetchWeather().then(setWeather);
  }, [weatherEnabled]);

  if (!weatherEnabled || !weather) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{weather.icon}</Text>
      <Text style={styles.temp}>{weather.temperature}°F</Text>
      <View style={styles.details}>
        <Text style={styles.condition}>{weather.condition}</Text>
        {weather.location ? (
          <Text style={styles.location}>{weather.location}</Text>
        ) : null}
      </View>
      <Text style={styles.hiLo}>
        H:{weather.high}° L:{weather.low}°
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  icon: {
    fontSize: fontSize.xl,
    marginRight: spacing.sm,
  },
  temp: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginRight: spacing.md,
  },
  details: {
    flex: 1,
  },
  condition: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  location: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  hiLo: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
