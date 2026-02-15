// Harfland - Harf Cizim Yollari
// Her harf icin SVG path tanimlari
// Cocuk parmaginla bu yollari takip ederek harf yazmayi ogrenir
// Koordinatlar 0-200 araliginda normalize edilmistir (traceAreaSize'a olceklenir)

export interface TraceStroke {
  d: string;                    // SVG path data
  direction: 'top-to-bottom' | 'bottom-to-top' | 'left-to-right' | 'right-to-left' | 'diagonal' | 'curve';
  startPoint: { x: number; y: number };
}

export interface TracePath {
  letterId: string;
  strokes: TraceStroke[];       // Birden fazla cizgi olabilir
  boundingBox: { width: number; height: number };
  difficulty: 'easy' | 'medium' | 'hard';
}

export const TRACE_PATHS: TracePath[] = [
  // --- GRUP 1: Kolay sesli ---
  {
    letterId: 'E',
    strokes: [
      { d: 'M 40,20 L 40,180', direction: 'top-to-bottom', startPoint: { x: 40, y: 20 } },
      { d: 'M 40,20 L 140,20', direction: 'left-to-right', startPoint: { x: 40, y: 20 } },
      { d: 'M 40,100 L 120,100', direction: 'left-to-right', startPoint: { x: 40, y: 100 } },
      { d: 'M 40,180 L 140,180', direction: 'left-to-right', startPoint: { x: 40, y: 180 } },
    ],
    boundingBox: { width: 140, height: 180 },
    difficulty: 'easy',
  },
  {
    letterId: 'A',
    strokes: [
      { d: 'M 20,180 L 100,20 L 180,180', direction: 'diagonal', startPoint: { x: 20, y: 180 } },
      { d: 'M 60,120 L 140,120', direction: 'left-to-right', startPoint: { x: 60, y: 120 } },
    ],
    boundingBox: { width: 180, height: 180 },
    difficulty: 'easy',
  },
  {
    letterId: 'İ',
    strokes: [
      { d: 'M 100,40 L 100,180', direction: 'top-to-bottom', startPoint: { x: 100, y: 40 } },
      { d: 'M 100,20 A 2,2 0 1,1 100,24', direction: 'curve', startPoint: { x: 100, y: 20 } },
    ],
    boundingBox: { width: 60, height: 180 },
    difficulty: 'easy',
  },

  // --- GRUP 2: Kolay sessiz ---
  {
    letterId: 'L',
    strokes: [
      { d: 'M 40,20 L 40,180', direction: 'top-to-bottom', startPoint: { x: 40, y: 20 } },
      { d: 'M 40,180 L 140,180', direction: 'left-to-right', startPoint: { x: 40, y: 180 } },
    ],
    boundingBox: { width: 140, height: 180 },
    difficulty: 'easy',
  },
  {
    letterId: 'T',
    strokes: [
      { d: 'M 20,20 L 180,20', direction: 'left-to-right', startPoint: { x: 20, y: 20 } },
      { d: 'M 100,20 L 100,180', direction: 'top-to-bottom', startPoint: { x: 100, y: 20 } },
    ],
    boundingBox: { width: 180, height: 180 },
    difficulty: 'easy',
  },
  {
    letterId: 'N',
    strokes: [
      { d: 'M 40,180 L 40,20', direction: 'bottom-to-top', startPoint: { x: 40, y: 180 } },
      { d: 'M 40,20 L 160,180', direction: 'diagonal', startPoint: { x: 40, y: 20 } },
      { d: 'M 160,180 L 160,20', direction: 'bottom-to-top', startPoint: { x: 160, y: 180 } },
    ],
    boundingBox: { width: 160, height: 180 },
    difficulty: 'medium',
  },

  // --- GRUP 3: Sesli devam ---
  {
    letterId: 'O',
    strokes: [
      { d: 'M 100,20 C 160,20 180,60 180,100 C 180,140 160,180 100,180 C 40,180 20,140 20,100 C 20,60 40,20 100,20', direction: 'curve', startPoint: { x: 100, y: 20 } },
    ],
    boundingBox: { width: 180, height: 180 },
    difficulty: 'medium',
  },
  {
    letterId: 'U',
    strokes: [
      { d: 'M 40,20 L 40,140 C 40,170 70,180 100,180 C 130,180 160,170 160,140 L 160,20', direction: 'curve', startPoint: { x: 40, y: 20 } },
    ],
    boundingBox: { width: 160, height: 180 },
    difficulty: 'medium',
  },

  // --- GRUP 4: Sessiz devam ---
  {
    letterId: 'R',
    strokes: [
      { d: 'M 40,180 L 40,20', direction: 'bottom-to-top', startPoint: { x: 40, y: 180 } },
      { d: 'M 40,20 L 120,20 C 150,20 160,50 160,65 C 160,80 150,100 120,100 L 40,100', direction: 'curve', startPoint: { x: 40, y: 20 } },
      { d: 'M 100,100 L 160,180', direction: 'diagonal', startPoint: { x: 100, y: 100 } },
    ],
    boundingBox: { width: 160, height: 180 },
    difficulty: 'hard',
  },
  {
    letterId: 'M',
    strokes: [
      { d: 'M 20,180 L 20,20', direction: 'bottom-to-top', startPoint: { x: 20, y: 180 } },
      { d: 'M 20,20 L 100,120', direction: 'diagonal', startPoint: { x: 20, y: 20 } },
      { d: 'M 100,120 L 180,20', direction: 'diagonal', startPoint: { x: 100, y: 120 } },
      { d: 'M 180,20 L 180,180', direction: 'top-to-bottom', startPoint: { x: 180, y: 20 } },
    ],
    boundingBox: { width: 180, height: 180 },
    difficulty: 'hard',
  },
  {
    letterId: 'K',
    strokes: [
      { d: 'M 40,20 L 40,180', direction: 'top-to-bottom', startPoint: { x: 40, y: 20 } },
      { d: 'M 150,20 L 40,100', direction: 'diagonal', startPoint: { x: 150, y: 20 } },
      { d: 'M 40,100 L 150,180', direction: 'diagonal', startPoint: { x: 40, y: 100 } },
    ],
    boundingBox: { width: 150, height: 180 },
    difficulty: 'medium',
  },

  // --- GRUP 5: Yeni sesli ---
  {
    letterId: 'Ö',
    strokes: [
      { d: 'M 100,40 C 160,40 180,80 180,120 C 180,160 160,180 100,180 C 40,180 20,160 20,120 C 20,80 40,40 100,40', direction: 'curve', startPoint: { x: 100, y: 40 } },
      { d: 'M 80,18 A 4,4 0 1,1 80,22', direction: 'curve', startPoint: { x: 80, y: 18 } },
      { d: 'M 120,18 A 4,4 0 1,1 120,22', direction: 'curve', startPoint: { x: 120, y: 18 } },
    ],
    boundingBox: { width: 180, height: 180 },
    difficulty: 'medium',
  },
  {
    letterId: 'Ü',
    strokes: [
      { d: 'M 40,40 L 40,140 C 40,170 70,180 100,180 C 130,180 160,170 160,140 L 160,40', direction: 'curve', startPoint: { x: 40, y: 40 } },
      { d: 'M 60,18 A 4,4 0 1,1 60,22', direction: 'curve', startPoint: { x: 60, y: 18 } },
      { d: 'M 140,18 A 4,4 0 1,1 140,22', direction: 'curve', startPoint: { x: 140, y: 18 } },
    ],
    boundingBox: { width: 160, height: 180 },
    difficulty: 'medium',
  },
  {
    letterId: 'I',
    strokes: [
      { d: 'M 100,20 L 100,180', direction: 'top-to-bottom', startPoint: { x: 100, y: 20 } },
    ],
    boundingBox: { width: 60, height: 180 },
    difficulty: 'easy',
  },

  // --- GRUP 6: Orta sessiz ---
  {
    letterId: 'S',
    strokes: [
      { d: 'M 150,50 C 150,20 100,20 80,20 C 40,20 20,40 20,65 C 20,90 40,100 100,110 C 160,120 180,130 180,155 C 180,180 150,180 120,180 C 80,180 50,180 50,155', direction: 'curve', startPoint: { x: 150, y: 50 } },
    ],
    boundingBox: { width: 180, height: 180 },
    difficulty: 'hard',
  },
  {
    letterId: 'D',
    strokes: [
      { d: 'M 40,20 L 40,180', direction: 'top-to-bottom', startPoint: { x: 40, y: 20 } },
      { d: 'M 40,20 L 100,20 C 160,20 180,60 180,100 C 180,140 160,180 100,180 L 40,180', direction: 'curve', startPoint: { x: 40, y: 20 } },
    ],
    boundingBox: { width: 180, height: 180 },
    difficulty: 'medium',
  },
  {
    letterId: 'B',
    strokes: [
      { d: 'M 40,20 L 40,180', direction: 'top-to-bottom', startPoint: { x: 40, y: 20 } },
      { d: 'M 40,20 L 110,20 C 150,20 160,45 160,60 C 160,75 150,90 120,95 L 40,100', direction: 'curve', startPoint: { x: 40, y: 20 } },
      { d: 'M 40,100 L 120,100 C 160,100 170,120 170,140 C 170,160 160,180 120,180 L 40,180', direction: 'curve', startPoint: { x: 40, y: 100 } },
    ],
    boundingBox: { width: 170, height: 180 },
    difficulty: 'hard',
  },
  {
    letterId: 'Y',
    strokes: [
      { d: 'M 20,20 L 100,100', direction: 'diagonal', startPoint: { x: 20, y: 20 } },
      { d: 'M 180,20 L 100,100', direction: 'diagonal', startPoint: { x: 180, y: 20 } },
      { d: 'M 100,100 L 100,180', direction: 'top-to-bottom', startPoint: { x: 100, y: 100 } },
    ],
    boundingBox: { width: 180, height: 180 },
    difficulty: 'medium',
  },

  // --- GRUP 7: Ileri sessiz ---
  {
    letterId: 'Z',
    strokes: [
      { d: 'M 20,20 L 180,20', direction: 'left-to-right', startPoint: { x: 20, y: 20 } },
      { d: 'M 180,20 L 20,180', direction: 'diagonal', startPoint: { x: 180, y: 20 } },
      { d: 'M 20,180 L 180,180', direction: 'left-to-right', startPoint: { x: 20, y: 180 } },
    ],
    boundingBox: { width: 180, height: 180 },
    difficulty: 'medium',
  },
  {
    letterId: 'Ç',
    strokes: [
      { d: 'M 170,60 C 170,20 130,20 100,20 C 60,20 30,40 30,100 C 30,160 60,180 100,180 C 130,180 170,180 170,140', direction: 'curve', startPoint: { x: 170, y: 60 } },
      { d: 'M 90,180 C 90,190 100,200 80,200', direction: 'curve', startPoint: { x: 90, y: 180 } },
    ],
    boundingBox: { width: 170, height: 200 },
    difficulty: 'hard',
  },
  {
    letterId: 'Ş',
    strokes: [
      { d: 'M 150,50 C 150,20 100,20 80,20 C 40,20 20,40 20,65 C 20,90 40,100 100,110 C 160,120 180,130 180,155 C 180,175 150,180 120,180 C 80,180 50,180 50,155', direction: 'curve', startPoint: { x: 150, y: 50 } },
      { d: 'M 90,180 C 90,190 100,200 80,200', direction: 'curve', startPoint: { x: 90, y: 180 } },
    ],
    boundingBox: { width: 180, height: 200 },
    difficulty: 'hard',
  },
  {
    letterId: 'P',
    strokes: [
      { d: 'M 40,180 L 40,20', direction: 'bottom-to-top', startPoint: { x: 40, y: 180 } },
      { d: 'M 40,20 L 120,20 C 160,20 170,45 170,65 C 170,85 160,100 120,100 L 40,100', direction: 'curve', startPoint: { x: 40, y: 20 } },
    ],
    boundingBox: { width: 170, height: 180 },
    difficulty: 'medium',
  },
  {
    letterId: 'G',
    strokes: [
      { d: 'M 170,60 C 170,20 130,20 100,20 C 60,20 30,40 30,100 C 30,160 60,180 100,180 C 140,180 170,170 170,130 L 170,100 L 120,100', direction: 'curve', startPoint: { x: 170, y: 60 } },
    ],
    boundingBox: { width: 170, height: 180 },
    difficulty: 'hard',
  },

  // --- GRUP 8: Zor harfler ---
  {
    letterId: 'C',
    strokes: [
      { d: 'M 170,60 C 170,20 130,20 100,20 C 60,20 30,40 30,100 C 30,160 60,180 100,180 C 130,180 170,180 170,140', direction: 'curve', startPoint: { x: 170, y: 60 } },
    ],
    boundingBox: { width: 170, height: 180 },
    difficulty: 'medium',
  },
  {
    letterId: 'H',
    strokes: [
      { d: 'M 40,20 L 40,180', direction: 'top-to-bottom', startPoint: { x: 40, y: 20 } },
      { d: 'M 40,100 L 160,100', direction: 'left-to-right', startPoint: { x: 40, y: 100 } },
      { d: 'M 160,20 L 160,180', direction: 'top-to-bottom', startPoint: { x: 160, y: 20 } },
    ],
    boundingBox: { width: 160, height: 180 },
    difficulty: 'medium',
  },
  {
    letterId: 'F',
    strokes: [
      { d: 'M 40,20 L 40,180', direction: 'top-to-bottom', startPoint: { x: 40, y: 20 } },
      { d: 'M 40,20 L 150,20', direction: 'left-to-right', startPoint: { x: 40, y: 20 } },
      { d: 'M 40,100 L 120,100', direction: 'left-to-right', startPoint: { x: 40, y: 100 } },
    ],
    boundingBox: { width: 150, height: 180 },
    difficulty: 'easy',
  },
  {
    letterId: 'V',
    strokes: [
      { d: 'M 20,20 L 100,180 L 180,20', direction: 'diagonal', startPoint: { x: 20, y: 20 } },
    ],
    boundingBox: { width: 180, height: 180 },
    difficulty: 'medium',
  },
  {
    letterId: 'Ğ',
    strokes: [
      { d: 'M 170,60 C 170,20 130,20 100,20 C 60,20 30,40 30,100 C 30,160 60,180 100,180 C 140,180 170,170 170,130 L 170,100 L 120,100', direction: 'curve', startPoint: { x: 170, y: 60 } },
      { d: 'M 70,8 C 90,16 110,16 130,8', direction: 'curve', startPoint: { x: 70, y: 8 } },
    ],
    boundingBox: { width: 170, height: 180 },
    difficulty: 'hard',
  },
  {
    letterId: 'J',
    strokes: [
      { d: 'M 140,20 L 140,140 C 140,170 110,180 80,180 C 50,180 30,170 30,150', direction: 'curve', startPoint: { x: 140, y: 20 } },
      { d: 'M 140,8 A 2,2 0 1,1 140,12', direction: 'curve', startPoint: { x: 140, y: 8 } },
    ],
    boundingBox: { width: 160, height: 180 },
    difficulty: 'medium',
  },
];

// Yardimci fonksiyon
export const getTracePathById = (letterId: string): TracePath | undefined =>
  TRACE_PATHS.find((tp) => tp.letterId === letterId);
