// Harfland - Ayarlar Store'u
// Ses, muzik, zorluk, oturum hatirlatici ayarlari
// Zustand + AsyncStorage ile offline persist
// Not: MMKV dev build yapildiginda geri eklenebilir (Expo Go'da calismaz)

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DifficultyMode = 'auto' | 'easy' | 'hard';

interface SettingsState {
  // Ses ayarlari
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;

  // Zorluk
  difficulty: DifficultyMode;

  // Oturum
  sessionReminderMinutes: number;
  sessionReminderEnabled: boolean;

  // Ebeveyn kapisi
  parentGateUnlocked: boolean;

  // Aksiyonlar
  toggleSound: () => void;
  toggleMusic: () => void;
  setSoundVolume: (volume: number) => void;
  setDifficulty: (mode: DifficultyMode) => void;
  setSessionReminderMinutes: (minutes: number) => void;
  toggleSessionReminder: () => void;
  unlockParentGate: () => void;
  lockParentGate: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Varsayilan degerler
      soundEnabled: true,
      musicEnabled: true,
      soundVolume: 0.8,
      difficulty: 'auto',
      sessionReminderMinutes: 20,
      sessionReminderEnabled: true,
      parentGateUnlocked: false,

      // Ses
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),
      setSoundVolume: (volume) => set({ soundVolume: Math.min(1, Math.max(0, volume)) }),

      // Zorluk
      setDifficulty: (mode) => set({ difficulty: mode }),

      // Oturum hatirlatici
      setSessionReminderMinutes: (minutes) => set({ sessionReminderMinutes: minutes }),
      toggleSessionReminder: () => set((s) => ({ sessionReminderEnabled: !s.sessionReminderEnabled })),

      // Ebeveyn kapisi
      unlockParentGate: () => set({ parentGateUnlocked: true }),
      lockParentGate: () => set({ parentGateUnlocked: false }),
    }),
    {
      name: 'harfland-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
