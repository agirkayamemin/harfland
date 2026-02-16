// Harf Boyama - Grid uzerinde harf seklini boya
// tracePaths'den 7x7 boolean grid olusturur, cocuk dogru kareleri boyar
// minUnlockedLetters: 4

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { COLORS, SIZES, FONTS, SHADOW } from '../../constants/theme';
import { HintBubble } from '../../components/feedback/HintBubble';
import { ALPHABET, Letter } from '../../data/alphabet';
import { TRACE_PATHS } from '../../data/tracePaths';
import { parseSvgPathPoints } from '../../utils/traceValidator';
import { useProgressStore } from '../../stores/progressStore';
import { useAudio } from '../../hooks/useAudio';

const ROUND_COUNT = 5;
const GRID_SIZE = 7;
const STROKE_THICKNESS = 1.2; // Grid hucresi birimi cinsinden kalinlik

interface ColoringGameProps {
  onGameEnd: (score: number, total: number) => void;
}

function getUnlockedLetters(): Letter[] {
  const progress = useProgressStore.getState().letterProgress;
  return ALPHABET.filter((l) => progress[l.id]?.unlocked);
}

/** Iki nokta arasinda ara noktalar olustur */
function interpolatePoints(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  step: number
): { x: number; y: number }[] {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const count = Math.ceil(dist / step);
  const result: { x: number; y: number }[] = [];
  for (let i = 0; i <= count; i++) {
    const t = count > 0 ? i / count : 0;
    result.push({ x: p1.x + dx * t, y: p1.y + dy * t });
  }
  return result;
}

/** tracePaths'den 7x7 boolean grid olustur */
function letterToGrid(letterId: string): boolean[][] {
  const tracePath = TRACE_PATHS.find((tp) => tp.letterId === letterId);
  if (!tracePath) {
    return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
  }

  const grid: boolean[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(false)
  );

  const cellSize = 200 / GRID_SIZE; // tracePaths 0-200 koordinat kullanir

  for (const stroke of tracePath.strokes) {
    const points = parseSvgPathPoints(stroke.d);
    // Ardisik noktalar arasinda interpolasyon yap
    for (let i = 0; i < points.length - 1; i++) {
      const samples = interpolatePoints(points[i], points[i + 1], cellSize / 2);
      for (const pt of samples) {
        // Kalinlik icin komsu hucrelere de boya
        for (let dy = -STROKE_THICKNESS; dy <= STROKE_THICKNESS; dy += 0.5) {
          for (let dx = -STROKE_THICKNESS; dx <= STROKE_THICKNESS; dx += 0.5) {
            const col = Math.floor((pt.x + dx * cellSize * 0.3) / cellSize);
            const row = Math.floor((pt.y + dy * cellSize * 0.3) / cellSize);
            if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
              grid[row][col] = true;
            }
          }
        }
      }
    }
  }

  return grid;
}

interface RoundData {
  letter: Letter;
  targetGrid: boolean[][];
  color: string;
}

function buildRounds(unlocked: Letter[]): RoundData[] {
  const shuffled = [...unlocked].sort(() => Math.random() - 0.5);
  const rounds: RoundData[] = [];

  for (let i = 0; i < ROUND_COUNT && i < shuffled.length; i++) {
    const letter = shuffled[i];
    rounds.push({
      letter,
      targetGrid: letterToGrid(letter.id),
      color: letter.color,
    });
  }

  return rounds;
}

export function ColoringGame({ onGameEnd }: ColoringGameProps) {
  const { playEffect } = useAudio();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const rounds = useMemo(() => {
    const unlocked = getUnlockedLetters();
    return buildRounds(unlocked);
  }, []);

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [painted, setPainted] = useState<boolean[][]>(() =>
    Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false))
  );
  const [showResult, setShowResult] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => { clearTimeout(timerRef.current); }, []);

  const currentRound = rounds[round];

  const targetCount = useMemo(() => {
    if (!currentRound) return 0;
    return currentRound.targetGrid.flat().filter(Boolean).length;
  }, [currentRound]);

  const handleCellPress = useCallback(
    (row: number, col: number) => {
      setLastActivity(Date.now());
      if (showResult || !currentRound) return;
      if (painted[row][col]) return; // Zaten boyali

      const newPainted = painted.map((r) => [...r]);
      newPainted[row][col] = true;
      setPainted(newPainted);

      if (currentRound.targetGrid[row][col]) {
        playEffect('tap');
      }

      // Tum hedef hucreler boyandi mi kontrol et
      const paintedTargetCount = currentRound.targetGrid.reduce(
        (acc, gridRow, r) =>
          acc +
          gridRow.reduce(
            (sum, isTarget, c) => sum + (isTarget && newPainted[r][c] ? 1 : 0),
            0
          ),
        0
      );

      if (paintedTargetCount >= targetCount) {
        // Round tamamlandi
        playEffect('success');
        setShowResult(true);

        // Yanlis boyanan hucre sayisi
        const wrongCount = newPainted.flat().filter((p, i) => {
          const r = Math.floor(i / GRID_SIZE);
          const c = i % GRID_SIZE;
          return p && !currentRound.targetGrid[r][c];
        }).length;

        // Puan: hedef hucrelerin hepsini boyadi, az yanlis = yuksek puan
        const accuracy = Math.max(0, 1 - wrongCount / Math.max(targetCount, 1));
        const roundScore = accuracy >= 0.5 ? 1 : 0;

        const newScore = score + roundScore;
        setScore(newScore);

        timerRef.current = setTimeout(() => {
          const nextRound = round + 1;
          if (nextRound >= rounds.length) {
            onGameEnd(newScore, rounds.length);
          } else {
            setRound(nextRound);
            setPainted(
              Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false))
            );
            setShowResult(false);
          }
        }, 1200);
      }
    },
    [painted, currentRound, showResult, targetCount, round, score, rounds.length, onGameEnd]
  );

  if (!currentRound) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.scoreText}>
          {score}/{rounds.length}
        </Text>
        <Text style={styles.roundText}>
          {round + 1}/{rounds.length}
        </Text>
      </View>

      {/* Hedef harf */}
      <Text style={[styles.targetLetter, { color: currentRound.color }]}>
        {currentRound.letter.uppercase}
      </Text>
      <Text style={styles.hint}>Harfi boya!</Text>

      {/* Grid */}
      <View style={styles.gridContainer}>
        {currentRound.targetGrid.map((row, r) => (
          <View key={r} style={styles.gridRow}>
            {row.map((isTarget, c) => {
              const isPainted = painted[r][c];
              const isCorrectPaint = isPainted && isTarget;
              const isWrongPaint = isPainted && !isTarget;

              return (
                <Pressable
                  key={`${r}-${c}`}
                  style={[
                    styles.cell,
                    isCorrectPaint && { backgroundColor: currentRound.color },
                    isWrongPaint && { backgroundColor: COLORS.warningLight },
                    showResult && isTarget && !isPainted && {
                      backgroundColor: currentRound.color,
                      opacity: 0.3,
                    },
                  ]}
                  onPress={() => handleCellPress(r, c)}
                  accessibilityLabel={`Satır ${r + 1}, sütun ${c + 1}`}
                  accessibilityRole="button"
                />
              );
            })}
          </View>
        ))}
      </View>

      <HintBubble hint="Harfin içindeki karelere dokunarak boya!" activityTimestamp={lastActivity} />

      {/* Geri bildirim */}
      {showResult && <Text style={styles.feedbackText}>Harika!</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: SIZES.paddingSm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: SIZES.paddingMd,
  },
  scoreText: {
    fontSize: FONTS.sizeMd,
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
  },
  roundText: {
    fontSize: FONTS.sizeSm,
    color: COLORS.textLight,
  },
  targetLetter: {
    fontSize: FONTS.sizeDisplay,
    fontFamily: FONTS.familyBlack,
  },
  hint: {
    fontSize: FONTS.sizeMd,
    color: COLORS.textLight,
    fontFamily: FONTS.familyBold,
  },
  gridContainer: {
    gap: 3,
    padding: SIZES.paddingSm,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: SIZES.radiusMd,
    ...SHADOW.small,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 3,
  },
  cell: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: COLORS.backgroundDark,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  feedbackText: {
    fontSize: FONTS.sizeLg,
    fontFamily: FONTS.familyBold,
    color: COLORS.successText,
    marginTop: SIZES.paddingSm,
  },
});
