// Harfland - Tema Sabitleri
// Tum renk, boyut ve zamanlama degerleri buradan alinir.
// Hardcoded deger kullanmak yasaktir.
// Renk paleti: 3-5 yas cocuk arastirmalarina dayali (yuksek doygunluk, sicak tonlar)

export const COLORS = {
  // Ana renkler
  primary: '#4FC3F7',       // Canli mavi - ana renk
  primaryLight: '#B3E5FC',  // Acik gokyuzu mavisi
  primaryDark: '#0288D1',   // Koyu mavi
  secondary: '#FF8A65',     // Canli turuncu - CTA butonlar
  secondaryLight: '#FFCCBC', // Seftali
  secondaryDark: '#E64A19',  // Koyu turuncu

  // Vurgu renkleri
  accent: '#FFD54F',        // Sicak sari - odullar, vurgulama
  accentLight: '#FFF9C4',   // Krem sari
  purple: '#BA68C8',        // Mor - yaraticilik alanlari
  purpleLight: '#E1BEE7',   // Acik lavanta

  // Geri bildirim renkleri
  success: '#81C784',       // Yumusak yesil - dogru cevap
  successLight: '#C8E6C9',  // Mint yesili
  warning: '#FFA726',       // Yumusak turuncu - yanlis cevap (kirmizi yerine)
  warningLight: '#FFE0B2',  // Acik turuncu

  // Arka plan
  background: '#FFF8E1',    // Sicak beyaz (saf beyaz degil)
  backgroundCard: '#FFFFFF',
  backgroundDark: '#FFF3E0', // Sicak acik turuncu

  // Metin
  text: '#37474F',          // Yumusak koyu gri (saf siyah degil)
  textLight: '#78909C',     // Orta gri
  textWhite: '#FFFFFF',

  // Diger
  border: '#E0E0E0',
  shadow: '#00000020',
  overlay: '#00000050',
  locked: '#B0BEC5',
} as const;

// Her harf grubunun rengi (plan.md 3.1 - 8 pedagojik grup)
export const GROUP_COLORS = {
  1: '#EF5350', // Grup 1 - Kolay sesli (E, A, İ) - Kirmizi-pembe
  2: '#4FC3F7', // Grup 2 - Kolay sessiz (L, T, N) - Mavi
  3: '#FF8A65', // Grup 3 - Sesli devam (O, U) - Turuncu
  4: '#81C784', // Grup 4 - Sessiz devam (R, M, K) - Yesil
  5: '#FFD54F', // Grup 5 - Yeni sesli (Ö, Ü, I) - Sari
  6: '#BA68C8', // Grup 6 - Orta sessiz (S, D, B, Y) - Mor
  7: '#4DD0E1', // Grup 7 - Ileri sessiz (Z, Ç, Ş, P, G) - Turkuaz
  8: '#F06292', // Grup 8 - Zor harfler (C, H, F, V, Ğ, J) - Pembe
} as const;

// Maskot secenekleri
export const MASCOTS = {
  owl: { emoji: '🦉', name: 'Puhu', color: '#FF8A65' },
  cat: { emoji: '🐱', name: 'Minnak', color: '#BA68C8' },
  dog: { emoji: '🐶', name: 'Ponçik', color: '#4FC3F7' },
  panda: { emoji: '🐼', name: 'Bambu', color: '#81C784' },
  monkey: { emoji: '🐵', name: 'Ciki', color: '#FFD54F' },
} as const;

export type MascotId = keyof typeof MASCOTS;

// Boyutlar (dp) - cocuk UX: minimum 72dp dokunma alani
export const SIZES = {
  // Dokunma alanlari (3-5 yas icin minimum 72dp)
  touchableMin: 72,
  touchableDefault: 80,
  touchableLarge: 96,

  // Kart boyutlari
  letterCardSize: 100,
  gameCardWidth: 160,
  gameCardHeight: 120,

  // Padding / Margin
  paddingXs: 4,
  paddingSm: 8,
  paddingMd: 16,
  paddingLg: 24,
  paddingXl: 32,

  // Border radius
  radiusSm: 12,
  radiusMd: 20,
  radiusLg: 28,
  radiusRound: 999,

  // Ikon boyutlari
  iconSm: 24,
  iconMd: 32,
  iconLg: 48,
  iconXl: 64,

  // Harf cizim alani
  traceAreaSize: 280,
  traceStrokeWidth: 10,
  traceCorridorWidth: 40,
} as const;

// Font boyutlari - cocuk UX: buyuk ve kalin fontlar
export const FONTS = {
  sizeXs: 14,
  sizeSm: 18,
  sizeMd: 22,
  sizeLg: 30,
  sizeXl: 38,
  sizeXxl: 50,
  sizeDisplay: 72,
  sizeHuge: 120,

  weightRegular: '400' as const,
  weightMedium: '600' as const,
  weightBold: '700' as const,
  weightBlack: '900' as const,
} as const;

// Animasyon sureleri (ms)
export const ANIMATION = {
  fast: 200,
  normal: 500,
  slow: 1000,
  confetti: 2000,
  letterReveal: 800,
  starReward: 1200,
  hintDelay: 10000,
  sessionReminder: 1200000,
} as const;

// Golge stili - 3D gorunumlu butonlar icin
export const SHADOW = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
} as const;
