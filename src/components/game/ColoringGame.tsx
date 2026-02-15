// Harf Boyama - Grid uzerinde harf hucrelerini boyama oyunu
// Motor beceri + harf sekli tanima
// minUnlockedLetters: 1

import { useState, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { COLORS, SIZES, FONTS, SHADOW } from '../../constants/theme';
import { ALPHABET, Letter } from '../../data/alphabet';
import { LETTER_EMOJI } from '../../data/letterEmoji';
import { getTracePathById } from '../../data/tracePaths';
import { parseSvgPathPoints, samplePathPoints } from '../../utils/traceValidator';
import { useProgressStore } from '../../stores/progressStore';

const ROUND_COUNT = 5;
const GRID_SIZE = 7;
const STROKE_THICKNESS = 1.8; // Grid birimlerinde kalinlik (komsulara yayilma)

interface ColoringGameProps {
  onGameEnd: (score: number, total: number) => void;
}

function getUnlockedLetters(): Letter[] {
  const progress = useProgressStore.getState().letterProgress;
  return ALPHABET.filter((l) => progress[l.id]?.unlocked);
}

// SVG path'lerden 7x7 grid olustur
function letterToGrid(letterId: string): boolean[][] {
  const grid: boolean[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(false)
  );

  const tracePath = getTracePathById(letterId);
  if (!tracePath) return grid;

  for (const stroke of tracePath.strokes) {
    const rawPoints = parseSvgPathPoints(stroke.d);
    const sampled = samplePathPoints(rawPoints, 60);

    for (const point of sampled) {
      // Normalize: trace paths 0-200 range -> 0-GRID_SIZE range
      const gx = (point.x / 200) * GRID_SIZE;
      const gy = (point.y / 200) * GRID_SIZE;

      // Merkez hucre + komsulari (kalin cizgi efekti)
      for (let dy = -STROKE_THICKNESS; dy <= STROKE_THICKNESS; dy += 0.5) {
        for (let dx = -STROKE_THICKNESS; dx <= STROKE_THICKNESS; dx += 0.5) {
          const cx = Math.floor(gx + dx);
          const cy = Math.floor(gy + dy);
          if (cx >= 0 && cx < GRID_SIZE && cy >= 0 && cy < GRID_SIZE) {
            // Daire icinde mi kontrol (kare degil, daire)
            if (dx * dx + dy * dy <= STROKE_THICKNESS * STROKE_THICKNESS) {
              grid[cy][cx] = true;
            }
          }
        }
      }
    }
  }

  return grid;
}

// Animasyonlu grid hucresi
interface CellProps {
  isLetterCell: boolean;
  painted: boolean;
  flashing: boolean;
  color: string;
  cellSize: number;
  onPress: () => void;
}

function Cell({ isLetterCell, painted, flashing, color, cellSize, onPress }: CellProps) {
  const scale = useSharedValue(1);
  const bgOpacity = useSharedValue(1);

  if (painted) {
    scale.value = withSpring(1, { damping: 8, stiffness: 250 });
    if (scale.value === 1) scale.value = 0.7;
  }

  if (flashing) {
    bgOpacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 400 })
    );
  }

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: painted ? scale.value : 1 }],
  }));

  let bgColor = isLetterCell ? '#D8D8D8' : '#E8E8E8';
  if (painted) bgColor = color;
  if (flashing) bgColor = COLORS.warningLight;

  return (
    <Animated.View style={animStyle}>
      <Pressable
        style={[
          styles.cell,
          {
            width: cellSize,
            height: cellSize,
            backgroundColor: bgColor,
          },
        ]}
        onPress={onPress}
      />
    </Animated.View>
  );
}

export function ColoringGame({ onGameEnd }: ColoringGameProps) {
  const letters = useMemo(() => {
    const unlocked = getUnlockedLetters();
    const shuffled = unlocked.sort(() => Math.random() - 0.5);
    const selected: Letter[] = [];
    for (let i = 0; i < ROUND_COUNT; i++) {
      selected.push(shuffled[i % shuffled.length]);
    }
    return selected;
  }, []);

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [gridWidth, setGridWidth] = useState(0);
  const [paintedCells, setPaintedCells] = useState<Set<string>>(new Set());
  const [flashingCell, setFlashingCell] = useState<string | null>(null);
  const [wrongTaps, setWrongTaps] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const scoreRef = useRef(0);

  const currentLetter = letters[round];
  const emoji = LETTER_EMOJI[currentLetter?.id] ?? '❓';

  const grid = useMemo(() => {
    if (!currentLetter) return [];
    return letterToGrid(currentLetter.id);
  }, [round, currentLetter]);

  const totalLetterCells = useMemo(() => {
    let count = 0;
    for (const row of grid) {
      for (const cell of row) {
        if (cell) count++;
      }
    }
    return count;
  }, [grid]);

  const cellSize = gridWidth > 0 ? Math.floor((gridWidth - (GRID_SIZE - 1) * 2) / GRID_SIZE) : 40;

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setGridWidth(e.nativeEvent.layout.width);
  }, []);

  const handleCellPress = useCallback(
    (row: number, col: number) => {
      const key = `${row}-${col}`;
      if (paintedCells.has(key) || feedback) return;

      const isLetterCell = grid[row]?.[col] ?? false;

      if (isLetterCell) {
        const newPainted = new Set(paintedCells);
        newPainted.add(key);
        setPaintedCells(newPainted);

        // Tum harf hucreleri boyandi mi?
        let allPainted = true;
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] && !newPainted.has(`${r}-${c}`)) {
              allPainted = false;
              break;
            }
          }
          if (!allPainted) break;
        }

        if (allPainted) {
          const roundScore = wrongTaps < totalLetterCells ? 1 : 0;
          scoreRef.current += roundScore;
          setScore(scoreRef.current);
          setFeedback('Harika!');

          setTimeout(() => {
            const nextRound = round + 1;
            if (nextRound >= ROUND_COUNT) {
              onGameEnd(scoreRef.current, ROUND_COUNT);
            } else {
              setRound(nextRound);
              setPaintedCells(new Set());
              setWrongTaps(0);
              setFlashingCell(null);
              setFeedback(null);
            }
          }, 1200);
        }
      } else {
        // Bos hucreye dokundu
        setWrongTaps((prev) => prev + 1);
        setFlashingCell(key);
        setTimeout(() => setFlashingCell(null), 600);
      }
    },
    [grid, paintedCells, wrongTaps, totalLetterCells, round, feedback, onGameEnd]
  );

  if (!currentLetter) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.scoreText}>{score}/{ROUND_COUNT}</Text>
        <Text style={styles.roundText}>{round + 1}/{ROUND_COUNT}</Text>
      </View>

      {/* Hedef harf + emoji */}
      <View style={styles.targetRow}>
        <Text style={[styles.targetLetter, { color: currentLetter.color }]}>
          {currentLetter.uppercase}
        </Text>
        <Text style={styles.targetEmoji}>{emoji}</Text>
      </View>
      <Text style={styles.hint}>{currentLetter.uppercase} harfini boya!</Text>

      {/* Grid */}
      <View style={styles.gridContainer} onLayout={handleLayout}>
        {gridWidth > 0 && grid.map((row, r) => (
          <View key={r} style={styles.gridRow}>
            {row.map((isLetter, c) => {
              const key = `${r}-${c}`;
              return (
                <Cell
                  key={key}
                  isLetterCell={isLetter}
                  painted={paintedCells.has(key)}
                  flashing={flashingCell === key}
                  color={currentLetter.color}
                  cellSize={cellSize}
                  onPress={() => handleCellPress(r, c)}
                />
              );
            })}
          </View>
        ))}
      </View>

      {/* Geri bildirim */}
      {feedback && (
        <Text style={styles.feedbackText}>{feedback}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: SIZES.paddingMd,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: SIZES.paddingMd,
  },
  scoreText: {
    fontSize: FONTS.sizeMd,
    fontWeight: FONTS.weightBold,
    color: COLORS.text,
  },
  roundText: {
    fontSize: FONTS.sizeSm,
    color: COLORS.textLight,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.paddingMd,
    marginTop: SIZES.paddingMd,
  },
  targetLetter: {
    fontSize: FONTS.sizeXxl,
    fontWeight: FONTS.weightBlack,
  },
  targetEmoji: {
    fontSize: 48,
  },
  hint: {
    fontSize: FONTS.sizeMd,
    color: COLORS.textLight,
    fontWeight: FONTS.weightMedium,
  },
  gridContainer: {
    width: '100%',
    paddingHorizontal: SIZES.paddingMd,
    gap: 2,
    marginTop: SIZES.paddingSm,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
  },
  cell: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  feedbackText: {
    fontSize: FONTS.sizeLg,
    fontWeight: FONTS.weightBold,
    color: COLORS.success,
    marginTop: SIZES.paddingSm,
  },
});
