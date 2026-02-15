// Harfland - Harf Ilerleme Hook'u
// Harf durumu sorgulama: asama, kilit, siradaki harf, tekrar listesi

import { useMemo } from 'react';
import { useProgressStore } from '../stores/progressStore';
import { ALPHABET } from '../data/alphabet';

export function useLetterProgress() {
  const letterProgress = useProgressStore((s) => s.letterProgress);

  // Harfin mevcut asamasi (1-4)
  const getLetterStage = (letterId: string): number => {
    return letterProgress[letterId]?.stage ?? 1;
  };

  // Harf acik mi
  const isLetterUnlocked = (letterId: string): boolean => {
    return letterProgress[letterId]?.unlocked ?? false;
  };

  // Harfin ustalik skoru (0-100)
  const getLetterMastery = (letterId: string): number => {
    return letterProgress[letterId]?.masteryScore ?? 0;
  };

  // Siradaki ogrenilecek harf (acik olup henuz tamamlanmamis veya ilk kilitli)
  const nextLetterToLearn = useMemo(() => {
    // Once acik olup stage < 4 olan harfleri bul (ogretme sirasina gore)
    const sortedAlphabet = [...ALPHABET].sort((a, b) => a.order - b.order);

    const inProgress = sortedAlphabet.find((letter) => {
      const progress = letterProgress[letter.id];
      return progress?.unlocked && progress.stage < 4;
    });

    if (inProgress) return inProgress;

    // Hepsi tamamlandiysa ilk kilitli harfi dondur
    const firstLocked = sortedAlphabet.find((letter) => {
      return !letterProgress[letter.id]?.unlocked;
    });

    return firstLocked ?? null;
  }, [letterProgress]);

  // Bugun tekrar edilmesi gereken harfler
  const lettersForReview = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    return ALPHABET.filter((letter) => {
      const progress = letterProgress[letter.id];
      if (!progress?.unlocked) return false;
      if (progress.masteryScore === 0) return false;
      return progress.nextReview <= today;
    }).sort((a, b) => {
      // Oncelik: dusuk mastery skoru olan once
      const aScore = letterProgress[a.id]?.masteryScore ?? 0;
      const bScore = letterProgress[b.id]?.masteryScore ?? 0;
      return aScore - bScore;
    });
  }, [letterProgress]);

  // Acik harflerin sayisi
  const unlockedCount = useMemo(() => {
    return ALPHABET.filter((l) => letterProgress[l.id]?.unlocked).length;
  }, [letterProgress]);

  // Tamamlanan harflerin sayisi (stage 4)
  const completedCount = useMemo(() => {
    return ALPHABET.filter((l) => {
      const p = letterProgress[l.id];
      return p?.stage === 4;
    }).length;
  }, [letterProgress]);

  // Toplam ilerleme yuzdesi
  const overallProgress = useMemo(() => {
    if (ALPHABET.length === 0) return 0;
    const totalMastery = ALPHABET.reduce((sum, l) => {
      return sum + (letterProgress[l.id]?.masteryScore ?? 0);
    }, 0);
    return Math.round(totalMastery / ALPHABET.length);
  }, [letterProgress]);

  return {
    getLetterStage,
    isLetterUnlocked,
    getLetterMastery,
    nextLetterToLearn,
    lettersForReview,
    unlockedCount,
    completedCount,
    overallProgress,
  };
}
