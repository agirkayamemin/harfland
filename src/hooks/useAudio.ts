// Harfland - Ses Hook'u
// Harf sesleri, kelime okumalari, efekt sesleri
// expo-av kullanir, settingsStore'daki ses ayarina bakar

import { useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import { useSettingsStore } from '../stores/settingsStore';

// Harf ses dosyalari (alphabet.ts audioFile alanlariyla uyumlu)
const LETTER_SOUNDS: Record<string, any> = {
  E: require('../../assets/audio/letters/e.mp3'),
  A: require('../../assets/audio/letters/a.mp3'),
  'İ': require('../../assets/audio/letters/i.mp3'),
  L: require('../../assets/audio/letters/l.mp3'),
  T: require('../../assets/audio/letters/t.mp3'),
  N: require('../../assets/audio/letters/n.mp3'),
  O: require('../../assets/audio/letters/o.mp3'),
  U: require('../../assets/audio/letters/u.mp3'),
  R: require('../../assets/audio/letters/r.mp3'),
  M: require('../../assets/audio/letters/m.mp3'),
  K: require('../../assets/audio/letters/k.mp3'),
  'Ö': require('../../assets/audio/letters/oe.mp3'),
  'Ü': require('../../assets/audio/letters/ue.mp3'),
  I: require('../../assets/audio/letters/i_dotless.mp3'),
  S: require('../../assets/audio/letters/s.mp3'),
  D: require('../../assets/audio/letters/d.mp3'),
  B: require('../../assets/audio/letters/b.mp3'),
  Y: require('../../assets/audio/letters/y.mp3'),
  Z: require('../../assets/audio/letters/z.mp3'),
  'Ç': require('../../assets/audio/letters/ce.mp3'),
  'Ş': require('../../assets/audio/letters/se.mp3'),
  P: require('../../assets/audio/letters/p.mp3'),
  G: require('../../assets/audio/letters/g.mp3'),
  C: require('../../assets/audio/letters/c.mp3'),
  H: require('../../assets/audio/letters/h.mp3'),
  F: require('../../assets/audio/letters/f.mp3'),
  V: require('../../assets/audio/letters/v.mp3'),
  'Ğ': require('../../assets/audio/letters/gh.mp3'),
  J: require('../../assets/audio/letters/j.mp3'),
};

// Kelime ses dosyalari (alphabet.ts wordAudioFile alanlariyla uyumlu)
const WORD_SOUNDS: Record<string, any> = {
  elma: require('../../assets/audio/words/elma.mp3'),
  ari: require('../../assets/audio/words/ari.mp3'),
  inek: require('../../assets/audio/words/inek.mp3'),
  lale: require('../../assets/audio/words/lale.mp3'),
  top: require('../../assets/audio/words/top.mp3'),
  nar: require('../../assets/audio/words/nar.mp3'),
  orman: require('../../assets/audio/words/orman.mp3'),
  ucak: require('../../assets/audio/words/ucak.mp3'),
  robot: require('../../assets/audio/words/robot.mp3'),
  masa: require('../../assets/audio/words/masa.mp3'),
  kedi: require('../../assets/audio/words/kedi.mp3'),
  ordek: require('../../assets/audio/words/ordek.mp3'),
  uzum: require('../../assets/audio/words/uzum.mp3'),
  irmak: require('../../assets/audio/words/irmak.mp3'),
  sincap: require('../../assets/audio/words/sincap.mp3'),
  dondurma: require('../../assets/audio/words/dondurma.mp3'),
  balon: require('../../assets/audio/words/balon.mp3'),
  yildiz: require('../../assets/audio/words/yildiz.mp3'),
  zurafa: require('../../assets/audio/words/zurafa.mp3'),
  cicek: require('../../assets/audio/words/cicek.mp3'),
  semsiye: require('../../assets/audio/words/semsiye.mp3'),
  papagan: require('../../assets/audio/words/papagan.mp3'),
  gemi: require('../../assets/audio/words/gemi.mp3'),
  ceylan: require('../../assets/audio/words/ceylan.mp3'),
  havuc: require('../../assets/audio/words/havuc.mp3'),
  fil: require('../../assets/audio/words/fil.mp3'),
  vapur: require('../../assets/audio/words/vapur.mp3'),
  dag: require('../../assets/audio/words/dag.mp3'),
  jilet: require('../../assets/audio/words/jilet.mp3'),
};

// Efekt ses dosyalari
const EFFECT_SOUNDS: Record<string, any> = {
  success: require('../../assets/audio/effects/success.mp3'),
  hint: require('../../assets/audio/effects/hint.mp3'),
  tap: require('../../assets/audio/effects/tap.mp3'),
  wrong: require('../../assets/audio/effects/wrong.mp3'),
  star: require('../../assets/audio/effects/star.mp3'),
  confetti: require('../../assets/audio/effects/confetti.mp3'),
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

  // Harf sesini cal (letterId: 'E', 'A', 'İ', ...)
  const playLetterSound = useCallback(
    async (letterId: string) => {
      const source = LETTER_SOUNDS[letterId];
      if (source) {
        await playSound(source);
      }
    },
    [playSound]
  );

  // Kelime sesini cal (word: 'elma', 'ari', ...)
  const playWordSound = useCallback(
    async (word: string) => {
      const key = word.toLowerCase();
      const source = WORD_SOUNDS[key];
      if (source) {
        await playSound(source);
      }
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
