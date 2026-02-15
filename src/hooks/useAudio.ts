// Harfland - Ses Hook'u
// Harf sesleri, kelime okumalari, efekt sesleri
// expo-av kullanir, settingsStore'daki ses ayarina bakar

import { useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import { useSettingsStore } from '../stores/settingsStore';

// Ses dosyalari haritasi (require ile static import)
// Gercek ses dosyalari eklendikce burasi guncellenir
const EFFECT_SOUNDS: Record<string, any> = {
  // success: require('../../assets/audio/success.mp3'),
  // hint: require('../../assets/audio/hint.mp3'),
  // tap: require('../../assets/audio/tap.mp3'),
  // wrong: require('../../assets/audio/wrong.mp3'),
  // star: require('../../assets/audio/star.mp3'),
  // confetti: require('../../assets/audio/confetti.mp3'),
};

export function useAudio() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const soundVolume = useSettingsStore((s) => s.soundVolume);

  // Onceki sesi temizle
  const cleanup = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch {
        // Ses zaten unload edilmis olabilir
      }
      soundRef.current = null;
    }
  }, []);

  // Genel ses calma fonksiyonu
  const playSound = useCallback(
    async (source: any) => {
      if (!soundEnabled || !source) return;

      await cleanup();

      try {
        const { sound } = await Audio.Sound.createAsync(source, {
          volume: soundVolume,
          shouldPlay: true,
        });
        soundRef.current = sound;

        // Bitince otomatik temizle
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
            soundRef.current = null;
          }
        });
      } catch {
        // Ses dosyasi bulunamadi veya calinamadi
      }
    },
    [soundEnabled, soundVolume, cleanup]
  );

  // Harf sesini cal
  const playLetterSound = useCallback(
    async (letterId: string) => {
      // Gercek ses dosyalari eklendikce:
      // const source = LETTER_SOUNDS[letterId];
      // await playSound(source);
    },
    [playSound]
  );

  // Kelime sesini cal
  const playWordSound = useCallback(
    async (word: string) => {
      // Gercek ses dosyalari eklendikce:
      // const source = WORD_SOUNDS[word];
      // await playSound(source);
    },
    [playSound]
  );

  // Efekt sesi cal
  const playEffect = useCallback(
    async (effect: 'success' | 'hint' | 'tap' | 'wrong' | 'star' | 'confetti') => {
      const source = EFFECT_SOUNDS[effect];
      if (source) {
        await playSound(source);
      }
    },
    [playSound]
  );

  // Tum sesleri durdur
  const stopAll = useCallback(async () => {
    await cleanup();
  }, [cleanup]);

  return {
    playLetterSound,
    playWordSound,
    playEffect,
    playSound,
    stopAll,
  };
}
