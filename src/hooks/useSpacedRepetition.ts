// Harfland - Aralikli Tekrar Hook'u
// Basitlestirilmis SM-2 varyanti (3-5 yas icin)
// plan.md 3.3'teki algoritma

import { useCallback } from 'react';
import { useProgressStore, LetterProgress } from '../stores/progressStore';

// Tekrar araliklari (gun)
const REVIEW_INTERVALS = [1, 3, 7];

// easeFactor sinirlari
const MIN_EASE_FACTOR = 1.3;
const MAX_EASE_FACTOR = 2.5;
const DEFAULT_EASE_FACTOR = 2.0;

// Performans kalitesi (0-5 arasi, SM-2 benzeri)
// 0-2: basarisiz, 3: zor ama dogru, 4: dogru, 5: kolay ve hizli
type ResponseQuality = 0 | 1 | 2 | 3 | 4 | 5;

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function useSpacedRepetition() {
  const letterProgress = useProgressStore((s) => s.letterProgress);
  const updateReviewDate = useProgressStore((s) => s.updateReviewDate);
  const recordAttempt = useProgressStore((s) => s.recordAttempt);
  const updateMasteryScore = useProgressStore((s) => s.updateMasteryScore);

  // Cevap kalitesini hesapla
  const calculateResponseQuality = useCallback(
    (correct: boolean, responseTimeMs: number, traceScore?: number): ResponseQuality => {
      if (!correct) {
        // Yanlis cevap
        if (responseTimeMs < 2000) return 1; // Hizli yanlis (dikkatsizlik)
        return 0; // Yavas yanlis (bilmiyor)
      }

      // Dogru cevap
      if (traceScore !== undefined) {
        // Cizim skoru varsa ona gore
        if (traceScore >= 90) return 5;
        if (traceScore >= 80) return 4;
        return 3;
      }

      // Sure bazli
      if (responseTimeMs < 3000) return 5; // Hizli dogru
      if (responseTimeMs < 6000) return 4; // Normal dogru
      return 3; // Yavas ama dogru
    },
    []
  );

  // Sonraki tekrar tarihini hesapla
  const calculateNextReview = useCallback(
    (progress: LetterProgress, quality: ResponseQuality): { nextReview: string; easeFactor: number } => {
      const today = new Date().toISOString().split('T')[0];
      let newEaseFactor = progress.easeFactor;

      if (quality >= 3) {
        // Basarili cevap
        // easeFactor'u ayarla
        newEaseFactor = progress.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        newEaseFactor = Math.max(MIN_EASE_FACTOR, Math.min(MAX_EASE_FACTOR, newEaseFactor));

        const consecutive = progress.consecutiveCorrect + 1;

        let intervalDays: number;
        if (consecutive <= REVIEW_INTERVALS.length) {
          // Sabit araliklar: 1, 3, 7 gun
          intervalDays = REVIEW_INTERVALS[consecutive - 1];
        } else {
          // Sonraki araliklar: onceki * easeFactor
          const lastInterval = REVIEW_INTERVALS[REVIEW_INTERVALS.length - 1];
          const extraSteps = consecutive - REVIEW_INTERVALS.length;
          intervalDays = Math.round(lastInterval * Math.pow(newEaseFactor, extraSteps));
        }

        return {
          nextReview: addDays(today, intervalDays),
          easeFactor: newEaseFactor,
        };
      } else {
        // Basarisiz cevap - easeFactor dusur, yarin tekrar et
        newEaseFactor = Math.max(MIN_EASE_FACTOR, progress.easeFactor - 0.2);
        return {
          nextReview: addDays(today, 1),
          easeFactor: newEaseFactor,
        };
      }
    },
    []
  );

  // Bir denemeyi isle (ana fonksiyon)
  const processAttempt = useCallback(
    (
      letterId: string,
      correct: boolean,
      responseTimeMs: number,
      traceScore?: number
    ) => {
      const progress = letterProgress[letterId];
      if (!progress) return;

      // Cevap kalitesini hesapla
      const quality = calculateResponseQuality(correct, responseTimeMs, traceScore);

      // Denemeyi kaydet
      recordAttempt(letterId, correct, traceScore);

      // Sonraki tekrar tarihini hesapla
      const { nextReview, easeFactor } = calculateNextReview(progress, quality);
      updateReviewDate(letterId, nextReview, easeFactor);

      // Mastery skorunu guncelle
      const masteryDelta = correct ? (quality >= 4 ? 10 : 5) : -5;
      const newMastery = Math.min(100, Math.max(0, progress.masteryScore + masteryDelta));
      updateMasteryScore(letterId, newMastery);

      return { quality, nextReview, easeFactor, newMastery };
    },
    [letterProgress, calculateResponseQuality, calculateNextReview, recordAttempt, updateReviewDate, updateMasteryScore]
  );

  // Bugun tekrar edilecek harfleri getir (tarihe gore sirali)
  const getReviewQueue = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];

    return Object.values(letterProgress)
      .filter((p) => p.unlocked && p.masteryScore > 0 && p.nextReview <= today)
      .sort((a, b) => {
        // Oncelik: dusuk easeFactor (zorlananlar) once
        if (a.easeFactor !== b.easeFactor) return a.easeFactor - b.easeFactor;
        // Sonra: dusuk mastery once
        return a.masteryScore - b.masteryScore;
      });
  }, [letterProgress]);

  return {
    processAttempt,
    getReviewQueue,
    calculateResponseQuality,
  };
}
