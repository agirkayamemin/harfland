// Harfland - Ilerleme Store'u
// Cocugun profili, harf ilerlemesi, oyun skorlari, gunluk oturum takibi
// Zustand + AsyncStorage ile offline persist
// Not: MMKV dev build yapildiginda geri eklenebilir (Expo Go'da calismaz)

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALPHABET, getLetterByOrder } from '../data/alphabet';

// Tipler
export interface ChildProfile {
  id: string;
  name: string;
  avatar: string;
  createdAt: string;
  totalStars: number;
  currentLevel: number;
}

export interface LetterProgress {
  letterId: string;
  stage: 1 | 2 | 3 | 4;
  masteryScore: number;
  attempts: number;
  correctAttempts: number;
  bestTraceScore: number;
  lastPracticed: string;
  nextReview: string;
  unlocked: boolean;
  easeFactor: number;
  consecutiveCorrect: number;
}

export interface GameScore {
  gameType: string;
  score: number;
  playedAt: string;
  duration: number;
}

export interface DailySession {
  date: string;
  totalMinutes: number;
  activitiesCompleted: number;
  starsEarned: number;
  lettersStudied: string[];
}

interface ProgressState {
  // Veri
  profile: ChildProfile | null;
  letterProgress: Record<string, LetterProgress>;
  gameScores: GameScore[];
  dailySessions: DailySession[];
  sessionStartTime: string | null;

  // Profil
  createProfile: (name: string, avatar: string) => void;
  updateProfile: (name: string, avatar: string) => void;

  // Harf ilerleme
  initializeLetterProgress: () => void;
  updateLetterStage: (letterId: string, stage: 1 | 2 | 3 | 4, masteryScore?: number) => void;
  recordAttempt: (letterId: string, correct: boolean, traceScore?: number) => void;
  updateMasteryScore: (letterId: string, score: number) => void;
  unlockLetter: (letterId: string) => void;
  updateReviewDate: (letterId: string, nextReview: string, easeFactor: number) => void;

  // Yildizlar
  addStars: (count: number) => void;

  // Oyun
  recordGameScore: (gameType: string, score: number, duration: number) => void;

  // Oturum
  startSession: () => void;
  endSession: () => void;
  addLetterToSession: (letterId: string) => void;
  addActivityToSession: () => void;

  // Sifirlama
  resetAllProgress: () => void;
}

// Ilk 3 harf acik baslar (Grup 1: E, A, İ)
const createInitialLetterProgress = (): Record<string, LetterProgress> => {
  const progress: Record<string, LetterProgress> = {};
  const today = new Date().toISOString().split('T')[0];

  ALPHABET.forEach((letter) => {
    progress[letter.id] = {
      letterId: letter.id,
      stage: 1,
      masteryScore: 0,
      attempts: 0,
      correctAttempts: 0,
      bestTraceScore: 0,
      lastPracticed: '',
      nextReview: today,
      unlocked: letter.order <= 3, // Ilk 3 harf acik (Grup 1: E, A, İ)
      easeFactor: 2.0,
      consecutiveCorrect: 0,
    };
  });

  return progress;
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      // Baslangic verileri
      profile: null,
      letterProgress: {},
      gameScores: [],
      dailySessions: [],
      sessionStartTime: null,

      // Profil olustur
      createProfile: (name, avatar) => {
        set({
          profile: {
            id: Date.now().toString(),
            name,
            avatar,
            createdAt: new Date().toISOString(),
            totalStars: 0,
            currentLevel: 1,
          },
        });
        get().initializeLetterProgress();
      },

      // Profil guncelle (ad ve maskot)
      updateProfile: (name, avatar) => {
        const profile = get().profile;
        if (!profile) return;
        set({ profile: { ...profile, name, avatar } });
      },

      // Harf ilerlemelerini baslat
      initializeLetterProgress: () => {
        set({ letterProgress: createInitialLetterProgress() });
      },

      // Harf asamasini guncelle (mastery de ayni anda guncellenebilir)
      updateLetterStage: (letterId, stage, masteryScore?: number) => {
        const current = get().letterProgress[letterId];
        if (!current) return;

        const updatedEntry = { ...current, stage };
        if (masteryScore !== undefined) {
          updatedEntry.masteryScore = Math.min(100, Math.max(0, masteryScore));
        }

        const updatedProgress = {
          ...get().letterProgress,
          [letterId]: updatedEntry,
        };

        // Stage 4 ise (tamamlandi), siradaki harfi ac
        if (stage === 4) {
          const letter = ALPHABET.find((l) => l.id === letterId);
          if (letter) {
            const nextLetter = getLetterByOrder(letter.order + 1);
            if (nextLetter && updatedProgress[nextLetter.id] && !updatedProgress[nextLetter.id].unlocked) {
              updatedProgress[nextLetter.id] = { ...updatedProgress[nextLetter.id], unlocked: true };
            }
          }
        }

        set({ letterProgress: updatedProgress });
      },

      // Deneme kaydet
      recordAttempt: (letterId, correct, traceScore) => {
        const current = get().letterProgress[letterId];
        if (!current) return;
        const today = new Date().toISOString().split('T')[0];

        set({
          letterProgress: {
            ...get().letterProgress,
            [letterId]: {
              ...current,
              attempts: current.attempts + 1,
              correctAttempts: correct ? current.correctAttempts + 1 : current.correctAttempts,
              consecutiveCorrect: correct ? current.consecutiveCorrect + 1 : 0,
              bestTraceScore: traceScore && traceScore > current.bestTraceScore
                ? traceScore
                : current.bestTraceScore,
              lastPracticed: today,
            },
          },
        });
      },

      // Ustalık skorunu guncelle
      updateMasteryScore: (letterId, score) => {
        const current = get().letterProgress[letterId];
        if (!current) return;
        set({
          letterProgress: {
            ...get().letterProgress,
            [letterId]: {
              ...current,
              masteryScore: Math.min(100, Math.max(0, score)),
            },
          },
        });
      },

      // Harf kilidini ac
      unlockLetter: (letterId) => {
        const current = get().letterProgress[letterId];
        if (!current) return;
        set({
          letterProgress: {
            ...get().letterProgress,
            [letterId]: { ...current, unlocked: true },
          },
        });
      },

      // Tekrar tarihini guncelle
      updateReviewDate: (letterId, nextReview, easeFactor) => {
        const current = get().letterProgress[letterId];
        if (!current) return;
        set({
          letterProgress: {
            ...get().letterProgress,
            [letterId]: { ...current, nextReview, easeFactor },
          },
        });
      },

      // Yildiz ekle
      addStars: (count) => {
        const profile = get().profile;
        if (!profile) return;
        set({
          profile: { ...profile, totalStars: profile.totalStars + count },
        });

        // Gunluk oturuma da ekle
        const today = new Date().toISOString().split('T')[0];
        const sessions = get().dailySessions;
        const todaySession = sessions.find((s) => s.date === today);
        if (todaySession) {
          set({
            dailySessions: sessions.map((s) =>
              s.date === today
                ? { ...s, starsEarned: s.starsEarned + count }
                : s
            ),
          });
        }
      },

      // Oyun skoru kaydet
      recordGameScore: (gameType, score, duration) => {
        const scores = [
          ...get().gameScores,
          {
            gameType,
            score,
            playedAt: new Date().toISOString(),
            duration,
          },
        ];
        // Son 100 skoru tut, eski kayitlari at
        set({ gameScores: scores.slice(-100) });
      },

      // Oturum baslat
      startSession: () => {
        const today = new Date().toISOString().split('T')[0];
        const sessions = get().dailySessions;
        const todaySession = sessions.find((s) => s.date === today);

        if (!todaySession) {
          set({
            dailySessions: [
              ...sessions,
              {
                date: today,
                totalMinutes: 0,
                activitiesCompleted: 0,
                starsEarned: 0,
                lettersStudied: [],
              },
            ],
          });
        }

        set({ sessionStartTime: new Date().toISOString() });
      },

      // Oturum bitir
      endSession: () => {
        const startTime = get().sessionStartTime;
        if (!startTime) return;

        const today = new Date().toISOString().split('T')[0];
        const minutesSpent = Math.round(
          (Date.now() - new Date(startTime).getTime()) / 60000
        );

        const sessions = get().dailySessions;
        set({
          dailySessions: sessions.map((s) =>
            s.date === today
              ? { ...s, totalMinutes: s.totalMinutes + minutesSpent }
              : s
          ),
          sessionStartTime: null,
        });
      },

      // Oturuma harf ekle
      addLetterToSession: (letterId) => {
        const today = new Date().toISOString().split('T')[0];
        const sessions = get().dailySessions;
        set({
          dailySessions: sessions.map((s) =>
            s.date === today && !s.lettersStudied.includes(letterId)
              ? { ...s, lettersStudied: [...s.lettersStudied, letterId] }
              : s
          ),
        });
      },

      // Oturuma aktivite ekle
      addActivityToSession: () => {
        const today = new Date().toISOString().split('T')[0];
        const sessions = get().dailySessions;
        set({
          dailySessions: sessions.map((s) =>
            s.date === today
              ? { ...s, activitiesCompleted: s.activitiesCompleted + 1 }
              : s
          ),
        });
      },

      // Tum ilerlemeyi sifirla (profil name/avatar/id/createdAt korunur)
      resetAllProgress: () => {
        const profile = get().profile;
        set({
          letterProgress: createInitialLetterProgress(),
          gameScores: [],
          dailySessions: [],
          sessionStartTime: null,
          profile: profile
            ? { ...profile, totalStars: 0, currentLevel: 1 }
            : null,
        });
      },
    }),
    {
      name: 'harfland-progress',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
