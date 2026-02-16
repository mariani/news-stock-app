import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  refreshIntervalSeconds: number;
  liveScoresEnabled: boolean;
  setRefreshInterval: (seconds: number) => void;
  setLiveScoresEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      refreshIntervalSeconds: 60,
      liveScoresEnabled: true,
      setRefreshInterval: (seconds: number) =>
        set({refreshIntervalSeconds: seconds}),
      setLiveScoresEnabled: (enabled: boolean) =>
        set({liveScoresEnabled: enabled}),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
