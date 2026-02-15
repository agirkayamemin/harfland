// Harfland - Skor Hesaplama
// Skor -> yildiz cevirme, mastery kazanim hesabi

// Skoru yildiza cevir (1-3)
export function calculateStars(score: number): number {
  if (score >= 90) return 3;
  if (score >= 80) return 2;
  if (score >= 70) return 1;
  return 0;
}

// Mastery kazanim miktari hesapla
// Asama ilerledikce kazanim artar
export function calculateMasteryGain(
  stage: 1 | 2 | 3 | 4,
  score: number,
  correct: boolean
): number {
  if (!correct) {
    // Yanlis cevapta kucuk dusus (cocugu cezalandirmamak icin)
    return -3;
  }

  // Asama bazli carpan
  const stageMultiplier: Record<number, number> = {
    1: 1.0, // Tanitma - dusuk kazanim
    2: 1.5, // Tanima - orta kazanim
    3: 2.0, // Yazma - yuksek kazanim
    4: 2.5, // Pratik - en yuksek kazanim
  };

  const multiplier = stageMultiplier[stage] ?? 1.0;

  // Skor bazli baz kazanim
  let baseGain: number;
  if (score >= 90) baseGain = 8;
  else if (score >= 80) baseGain = 6;
  else if (score >= 70) baseGain = 4;
  else baseGain = 2;

  return Math.round(baseGain * multiplier);
}

// Asama ilerleme kontrolu
// Bir asamayi gecmek icin gereken kosullar
export function canAdvanceStage(
  currentStage: 1 | 2 | 3 | 4,
  masteryScore: number,
  consecutiveCorrect: number
): boolean {
  if (currentStage >= 4) return false; // Son asama

  switch (currentStage) {
    case 1: // Tanitma -> Tanima
      return consecutiveCorrect >= 1; // 1 kez dokundu/dinledi yeterli
    case 2: // Tanima -> Yazma
      return consecutiveCorrect >= 2 && masteryScore >= 30;
    case 3: // Yazma -> Pratik
      return consecutiveCorrect >= 2 && masteryScore >= 60;
    default:
      return false;
  }
}

// Harf kilidi acma kontrolu
// Bir sonraki harfi acmak icin mevcut harfin yeterli seviyede olmasi gerekir
export function canUnlockNextLetter(
  masteryScore: number,
  stage: 1 | 2 | 3 | 4
): boolean {
  return stage >= 3 && masteryScore >= 50;
}

// Oturum sonu ozet hesaplama
export interface SessionSummary {
  totalStars: number;
  lettersStudied: number;
  activitiesCompleted: number;
  bestScore: number;
  encouragement: string;
}

const ENCOURAGEMENTS = [
  'Harika bir is cikardin!',
  'Bugün cok güzel calistin!',
  'Süper! Her gün daha iyi oluyorsun!',
  'Aferin sana! Cok basarilisin!',
  'Tebrikler! Bugün cok sey ogrendin!',
];

export function calculateSessionSummary(
  starsEarned: number,
  lettersStudied: number,
  activitiesCompleted: number,
  scores: number[]
): SessionSummary {
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const encouragement = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];

  return {
    totalStars: starsEarned,
    lettersStudied,
    activitiesCompleted,
    bestScore,
    encouragement,
  };
}
