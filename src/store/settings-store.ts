import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  refreshIntervalSeconds: number;
  liveScoresEnabled: boolean;
  weatherEnabled: boolean;
  language: string;
  setRefreshInterval: (seconds: number) => void;
  setLiveScoresEnabled: (enabled: boolean) => void;
  setWeatherEnabled: (enabled: boolean) => void;
  setLanguage: (language: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      refreshIntervalSeconds: 60,
      liveScoresEnabled: true,
      weatherEnabled: true,
      language: 'en',
      setRefreshInterval: (seconds: number) =>
        set({refreshIntervalSeconds: seconds}),
      setLiveScoresEnabled: (enabled: boolean) =>
        set({liveScoresEnabled: enabled}),
      setWeatherEnabled: (enabled: boolean) =>
        set({weatherEnabled: enabled}),
      setLanguage: (language: string) => set({language}),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
