// Harfland - Harf Cizim Dogrulama (Koridor Yontemi)
// Kalin gri rehber cizgi = koridor. Cizilen cizginin koridora degme orani kontrol edilir.
// Iki kontrol: (1) cizginin ne kadari koridorun icinde, (2) koridorun ne kadari cizilmis

import { SIZES } from '../constants/theme';

export interface Point {
  x: number;
  y: number;
}

export interface TraceResult {
  score: number;           // 0-100
  passed: boolean;
  insideRatio: number;     // 0-100 - cizilen noktalarin kaci koridor icinde
  coverageRatio: number;   // 0-100 - koridorun yuzde kaci cizilmis
  stars: number;           // 0-3
}

// --- Yardimci fonksiyonlar ---

function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// Bir noktanin bir nokta dizisine en yakin mesafesi
function nearestDistance(point: Point, points: Point[]): number {
  let min = Infinity;
  for (const p of points) {
    const d = distance(point, p);
    if (d < min) min = d;
  }
  return min;
}

// --- SVG Path Parser ---

function lerp(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function cubicBezier(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

interface SvgCommand {
  type: string;
  args: number[];
}

function parseSvgCommands(d: string): SvgCommand[] {
  const commands: SvgCommand[] = [];
  const regex = /([MLCAQSTHVZA])\s*([-\d.,\s]*)/gi;
  let match;
  while ((match = regex.exec(d)) !== null) {
    const type = match[1].toUpperCase();
    const argsStr = match[2].trim();
    const args = argsStr ? argsStr.match(/-?\d+\.?\d*/g)?.map(Number) || [] : [];
    commands.push({ type, args });
  }
  return commands;
}

const SAMPLES_PER_SEGMENT = 20;

// SVG path string'inden gercek noktalar uret
export function parseSvgPathPoints(d: string): Point[] {
  const commands = parseSvgCommands(d);
  const points: Point[] = [];
  let current: Point = { x: 0, y: 0 };

  for (const cmd of commands) {
    switch (cmd.type) {
      case 'M': {
        current = { x: cmd.args[0], y: cmd.args[1] };
        points.push({ ...current });
        for (let i = 2; i < cmd.args.length - 1; i += 2) {
          const next = { x: cmd.args[i], y: cmd.args[i + 1] };
          for (let t = 1; t <= SAMPLES_PER_SEGMENT; t++) {
            points.push(lerp(current, next, t / SAMPLES_PER_SEGMENT));
          }
          current = next;
        }
        break;
      }
      case 'L': {
        for (let i = 0; i < cmd.args.length - 1; i += 2) {
          const next = { x: cmd.args[i], y: cmd.args[i + 1] };
          for (let t = 1; t <= SAMPLES_PER_SEGMENT; t++) {
            points.push(lerp(current, next, t / SAMPLES_PER_SEGMENT));
          }
          current = next;
        }
        break;
      }
      case 'C': {
        for (let i = 0; i < cmd.args.length - 5; i += 6) {
          const cp1 = { x: cmd.args[i], y: cmd.args[i + 1] };
          const cp2 = { x: cmd.args[i + 2], y: cmd.args[i + 3] };
          const end = { x: cmd.args[i + 4], y: cmd.args[i + 5] };
          for (let t = 1; t <= SAMPLES_PER_SEGMENT; t++) {
            points.push(cubicBezier(current, cp1, cp2, end, t / SAMPLES_PER_SEGMENT));
          }
          current = end;
        }
        break;
      }
      case 'A': {
        if (cmd.args.length >= 7) {
          const end = { x: cmd.args[5], y: cmd.args[6] };
          points.push(end);
          current = end;
        }
        break;
      }
    }
  }
  return points;
}

// Noktalar dizisini esit aralikli ornekle
export function samplePathPoints(pathPoints: Point[], sampleCount: number): Point[] {
  if (pathPoints.length <= sampleCount) return pathPoints;
  const sampled: Point[] = [];
  const step = (pathPoints.length - 1) / (sampleCount - 1);
  for (let i = 0; i < sampleCount; i++) {
    const index = Math.round(i * step);
    sampled.push(pathPoints[Math.min(index, pathPoints.length - 1)]);
  }
  return sampled;
}

// --- Koridor Dogrulama ---

// Cizilen noktalarin yuzde kaci koridorun icinde?
function calculateInsideRatio(drawnPoints: Point[], targetPoints: Point[], halfWidth: number): number {
  if (drawnPoints.length === 0) return 0;
  let insideCount = 0;
  for (const drawn of drawnPoints) {
    if (nearestDistance(drawn, targetPoints) <= halfWidth) {
      insideCount++;
    }
  }
  return (insideCount / drawnPoints.length) * 100;
}

// Koridorun yuzde kaci cizilmis? (eksik parca var mi)
function calculateCoverageRatio(drawnPoints: Point[], targetPoints: Point[], halfWidth: number): number {
  if (targetPoints.length === 0) return 0;
  let coveredCount = 0;
  for (const target of targetPoints) {
    if (nearestDistance(target, drawnPoints) <= halfWidth) {
      coveredCount++;
    }
  }
  return (coveredCount / targetPoints.length) * 100;
}

// Ana dogrulama fonksiyonu
export function validateTrace(
  drawnStrokes: Point[][],
  targetPoints: Point[]
): TraceResult {
  const allDrawn = drawnStrokes.flat();

  if (allDrawn.length < 3) {
    return { score: 0, passed: false, insideRatio: 0, coverageRatio: 0, stars: 0 };
  }

  const halfWidth = SIZES.traceCorridorWidth / 2;

  const insideRatio = calculateInsideRatio(allDrawn, targetPoints, halfWidth);
  const coverageRatio = calculateCoverageRatio(allDrawn, targetPoints, halfWidth);

  // Skor: iki oranin ortalamasi
  const score = Math.round((insideRatio + coverageRatio) / 2);

  // Gecme kosulu: icinde kalma >= %75 VE kapsam >= %60
  const passed = insideRatio >= 75 && coverageRatio >= 60;

  // Yildiz hesabi (sadece gecince)
  let stars = 0;
  if (passed) {
    if (score >= 90) stars = 3;
    else if (score >= 80) stars = 2;
    else stars = 1;
  }

  return {
    score,
    passed,
    insideRatio: Math.round(insideRatio),
    coverageRatio: Math.round(coverageRatio),
    stars,
  };
}
