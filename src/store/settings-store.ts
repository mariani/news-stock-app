import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  refreshIntervalSeconds: number;
  setRefreshInterval: (seconds: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      refreshIntervalSeconds: 60,
      setRefreshInterval: (seconds: number) =>
        set({refreshIntervalSeconds: seconds}),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
