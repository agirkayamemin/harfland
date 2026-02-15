// Harf Treni oyunu kelime bankasi
// Her kelime, icerdigi harflerin tamami acik oldugunda oynanabilir
// Harfler ALPHABET id'lerine gore (buyuk harf, Turkce karakter)

export interface TrainWord {
  word: string;   // Buyuk harf, Turkce karakter (ALPHABET id formatinda)
  emoji: string;
}

export const TRAIN_WORDS: TrainWord[] = [
  // 2 harf (E, A, İ, L, T, N ile yazilabilir)
  { word: 'AL', emoji: '🔴' },
  { word: 'EL', emoji: '✋' },
  { word: 'AT', emoji: '🐴' },
  { word: 'ET', emoji: '🥩' },
  { word: 'İL', emoji: '🏙️' },
  { word: 'AN', emoji: '🕐' },
  { word: 'EN', emoji: '📏' },
  // 3 harf (E, A, İ, L, T, N)
  { word: 'NET', emoji: '✨' },
  { word: 'NAL', emoji: '🧲' },
  { word: 'TEN', emoji: '👋' },
  { word: 'İLİ', emoji: '🗺️' },
  { word: 'AİT', emoji: '🏷️' },
  // 4 harf (E, A, İ, L, T, N)
  { word: 'LALE', emoji: '🌷' },
  { word: 'ALET', emoji: '🔧' },
  { word: 'ELLI', emoji: '5️⃣' },
  // Daha fazla harf acildikca (O, U)
  { word: 'OT', emoji: '🌿' },
  { word: 'UN', emoji: '🫓' },
  { word: 'ULU', emoji: '🦅' },
  { word: 'TON', emoji: '⚖️' },
  { word: 'TUL', emoji: '🧵' },
  { word: 'ONA', emoji: '👉' },
  // R, M, K eklendikten sonra
  { word: 'KOL', emoji: '💪' },
  { word: 'KUM', emoji: '🏖️' },
  { word: 'TUR', emoji: '🗺️' },
  { word: 'MAL', emoji: '📦' },
  { word: 'TOP', emoji: '⚽' },
  { word: 'KAR', emoji: '❄️' },
  { word: 'MOR', emoji: '💜' },
  { word: 'ARM', emoji: '🐝' },
  { word: 'ELMA', emoji: '🍎' },
  { word: 'KALE', emoji: '🏰' },
  { word: 'MASA', emoji: '🪑' },
  { word: 'KURT', emoji: '🐺' },
  { word: 'KRAL', emoji: '👑' },
  { word: 'ORMAN', emoji: '🌲' },
  // Ö, Ü, I eklendikten sonra
  { word: 'KÖK', emoji: '🌱' },
  { word: 'TÜR', emoji: '📋' },
  { word: 'KIR', emoji: '🌾' },
  // S, D, B, Y eklendikten sonra
  { word: 'SU', emoji: '💧' },
  { word: 'DAL', emoji: '🌿' },
  { word: 'BAL', emoji: '🍯' },
  { word: 'YOL', emoji: '🛤️' },
  { word: 'DEN', emoji: '🌊' },
  { word: 'BİR', emoji: '1️⃣' },
  { word: 'SOL', emoji: '⬅️' },
  { word: 'ARABA', emoji: '🚗' },
  { word: 'BALIK', emoji: '🐟' },
  { word: 'BULUT', emoji: '☁️' },
  { word: 'SABUN', emoji: '🧼' },
  // Z, Ç, Ş, P, G eklendikten sonra
  { word: 'GÖL', emoji: '🏞️' },
  { word: 'ÇAM', emoji: '🌲' },
  { word: 'PİL', emoji: '🔋' },
  { word: 'GÜL', emoji: '🌹' },
  { word: 'ŞAL', emoji: '🧣' },
  { word: 'ZİL', emoji: '🔔' },
  // C, H, F, V, Ğ, J eklendikten sonra
  { word: 'FİL', emoji: '🐘' },
  { word: 'CAN', emoji: '❤️' },
  { word: 'HAL', emoji: '🧶' },
  { word: 'VAN', emoji: '🏔️' },
];
