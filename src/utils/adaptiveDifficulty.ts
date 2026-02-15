// Harfland - Adaptif Zorluk Sistemi
// plan.md 3.4'teki algoritma
// Son 5 aktiviteyi analiz ederek zorluk ayarlar

import { ALPHABET, Letter } from '../data/alphabet';
import { LetterProgress } from '../stores/progressStore';

export interface ActivityResult {
  letterId: string;
  correct: boolean;
  responseTimeMs: number;
  score: number;
  timestamp: string;
}

export interface PerformanceAnalysis {
  accuracy: number;           // 0-100 dogruluk orani
  avgResponseTime: number;    // Ortalama cevap suresi (ms)
  trend: 'improving' | 'stable' | 'declining';
  recommendation: 'advance' | 'stay' | 'retreat';
}

// Son N aktiviteyi analiz et
export function analyzeRecentPerformance(
  results: ActivityResult[],
  count: number = 5
): PerformanceAnalysis {
  const recent = results.slice(-count);

  if (recent.length === 0) {
    return {
      accuracy: 0,
      avgResponseTime: 0,
      trend: 'stable',
      recommendation: 'stay',
    };
  }

  // Dogruluk orani
  const correctCount = recent.filter((r) => r.correct).length;
  const accuracy = Math.round((correctCount / recent.length) * 100);

  // Ortalama cevap suresi
  const avgResponseTime = Math.round(
    recent.reduce((sum, r) => sum + r.responseTimeMs, 0) / recent.length
  );

  // Trend: ilk yari vs ikinci yari karsilastirmasi
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (recent.length >= 4) {
    const mid = Math.floor(recent.length / 2);
    const firstHalf = recent.slice(0, mid);
    const secondHalf = recent.slice(mid);

    const firstAccuracy = firstHalf.filter((r) => r.correct).length / firstHalf.length;
    const secondAccuracy = secondHalf.filter((r) => r.correct).length / secondHalf.length;

    if (secondAccuracy - firstAccuracy > 0.2) trend = 'improving';
    else if (firstAccuracy - secondAccuracy > 0.2) trend = 'declining';
  }

  // Oneri: plan.md kurallari
  let recommendation: 'advance' | 'stay' | 'retreat';
  const consecutive = countConsecutiveCorrect(recent);

  if (accuracy >= 90 && consecutive >= 3) {
    recommendation = 'advance'; // %90+ ve 3 ardisik dogru -> ilerle
  } else if (accuracy < 50) {
    recommendation = 'retreat'; // %50 alti -> geri don
  } else {
    recommendation = 'stay'; // %50-90 arasi -> kaldir
  }

  return { accuracy, avgResponseTime, trend, recommendation };
}

// Ardisik dogru sayisi (sondan basla)
function countConsecutiveCorrect(results: ActivityResult[]): number {
  let count = 0;
  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i].correct) count++;
    else break;
  }
  return count;
}

// Oturum icerigi olustur: %80 bilinen + %20 yeni
// plan.md 3.4: Motivasyon dengesi
export function getSessionContent(
  letterProgress: Record<string, LetterProgress>,
  sessionSize: number = 5
): { known: Letter[]; newOrReview: Letter[] } {
  const today = new Date().toISOString().split('T')[0];

  // Bilinen harfler (mastery >= 60, acik)
  const knownLetters = ALPHABET.filter((l) => {
    const p = letterProgress[l.id];
    return p?.unlocked && p.masteryScore >= 60;
  });

  // Tekrar gereken harfler (nextReview <= bugun, mastery < 60)
  const reviewLetters = ALPHABET.filter((l) => {
    const p = letterProgress[l.id];
    return p?.unlocked && p.masteryScore < 60 && p.nextReview <= today;
  });

  // Yeni harfler (acik ama mastery 0)
  const newLetters = ALPHABET.filter((l) => {
    const p = letterProgress[l.id];
    return p?.unlocked && p.masteryScore === 0;
  });

  // %80 bilinen, %20 yeni/tekrar
  const knownCount = Math.max(1, Math.round(sessionSize * 0.8));
  const newCount = sessionSize - knownCount;

  // Bilinen harflerden rastgele sec
  const shuffledKnown = [...knownLetters].sort(() => Math.random() - 0.5);
  const selectedKnown = shuffledKnown.slice(0, knownCount);

  // Yeni/tekrar harflerden sec (tekrar oncelikli)
  const newOrReviewPool = [...reviewLetters, ...newLetters];
  const shuffledNew = newOrReviewPool.sort(() => Math.random() - 0.5);
  const selectedNew = shuffledNew.slice(0, newCount);

  // Bilinen yeterli degilse yeni ile doldur
  if (selectedKnown.length < knownCount && newOrReviewPool.length > newCount) {
    const extra = newOrReviewPool.slice(newCount, newCount + (knownCount - selectedKnown.length));
    selectedNew.push(...extra);
  }

  return {
    known: selectedKnown,
    newOrReview: selectedNew,
  };
}

// Harf grubundan bir sonraki gruba gecmeli mi
export function shouldAdvanceToNextGroup(
  currentGroup: number,
  letterProgress: Record<string, LetterProgress>
): boolean {
  // Bu gruptaki tum harfler acik ve mastery >= 50 mi
  const groupLetters = ALPHABET.filter((l) => l.group === currentGroup);

  return groupLetters.every((l) => {
    const p = letterProgress[l.id];
    return p?.unlocked && p.masteryScore >= 50 && p.stage >= 3;
  });
}

// Bir onceki gruba donmeli mi
export function shouldRetreatToPreviousGroup(
  currentGroup: number,
  letterProgress: Record<string, LetterProgress>,
  recentResults: ActivityResult[]
): boolean {
  if (currentGroup <= 1) return false;

  const performance = analyzeRecentPerformance(recentResults);
  return performance.recommendation === 'retreat';
}
