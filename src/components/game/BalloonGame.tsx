// Harf Balonu - Balonlar asagidan yukari cikip rastgele konumlara yerlesiyor
// Her turda 6 balon, dogru olanina dokun

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { COLORS, SIZES, FONTS, SHADOW } from '../../constants/theme';
import { ALPHABET, Letter } from '../../data/alphabet';
import { useProgressStore } from '../../stores/progressStore';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const BALLOON_SIZE = 80;
const ROUND_COUNT = 8;
const BALLOONS_PER_ROUND = 6;

const BALLOON_COLORS = ['#EF5350', '#4FC3F7', '#FF8A65', '#81C784', '#FFD54F', '#BA68C8'];

interface BalloonGameProps {
  onGameEnd: (score: number, total: number) => void;
}

function getUnlockedLetters(): Letter[] {
  const progress = useProgressStore.getState().letterProgress;
  return ALPHABET.filter((l) => progress[l.id]?.unlocked);
}

function pickRoundLetters(target: Letter): Letter[] {
  const others = ALPHABET.filter((l) => l.id !== target.id);
  const shuffled = others.sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, BALLOONS_PER_ROUND - 1);
  const all = [target, ...distractors].sort(() => Math.random() - 0.5);
  return all;
}

// Balonlar icin ust uste binmeyen rastgele pozisyonlar hesapla
// 3 sutun x 2 satir grid tabanli + rastgele offset
function generatePositions(count: number, areaWidth: number, areaHeight: number) {
  const cols = 3;
  const rows = Math.ceil(count / cols);
  const cellW = (areaWidth - BALLOON_SIZE) / cols;
  const cellH = Math.min((areaHeight - BALLOON_SIZE) / rows, 160);
  const startY = (areaHeight - cellH * rows - BALLOON_SIZE) / 2;

  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    // Grid merkezi + rastgele sapma (cellW/4 kadar)
    const jitterX = (Math.random() - 0.5) * cellW * 0.4;
    const jitterY = (Math.random() - 0.5) * cellH * 0.3;
    const x = Math.max(0, Math.min(areaWidth - BALLOON_SIZE, col * cellW + cellW / 2 - BALLOON_SIZE / 2 + jitterX));
    const y = Math.max(0, startY + row * cellH + cellH / 2 - BALLOON_SIZE / 2 + jitterY);
    positions.push({ x, y });
  }
  return positions;
}

interface BalloonProps {
  letter: Letter;
  index: number;
  targetX: number;
  targetY: number;
  onPop: (id: string) => void;
  popped: boolean;
  color: string;
}

function Balloon({ letter, index, targetX, targetY, onPop, popped, color }: BalloonProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Asagidan hedef pozisyona yuksel, sirayla
    translateY.value = withDelay(
      index * 150,
      withTiming(targetY, {
        duration: 800 + Math.random() * 400,
        easing: Easing.out(Easing.back(1.2)),
      })
    );
  }, []);

  useEffect(() => {
    if (popped) {
      scale.value = withSpring(1.6, { damping: 4 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [popped]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.balloonWrapper, { left: targetX }, animStyle]}>
      <Pressable
        style={[styles.balloon, SHADOW.medium, { backgroundColor: color }]}
        onPress={() => onPop(letter.id)}
      >
        <Text style={styles.balloonLetter}>{letter.uppercase}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function BalloonGame({ onGameEnd }: BalloonGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState<Letter | null>(null);
  const [balloons, setBalloons] = useState<Letter[]>([]);
  const [poppedId, setPoppedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [areaSize, setAreaSize] = useState({ width: SCREEN_WIDTH - 48, height: SCREEN_HEIGHT * 0.6 });
  const roundRef = useRef(0);

  // Her round icin yeni pozisyonlar
  const positions = useMemo(
    () => generatePositions(BALLOONS_PER_ROUND, areaSize.width, areaSize.height),
    [round, areaSize]
  );

  const startRound = useCallback(() => {
    const letters = getUnlockedLetters();
    if (letters.length < 3) return;

    const targetLetter = letters[Math.floor(Math.random() * letters.length)];
    setTarget(targetLetter);
    setBalloons(pickRoundLetters(targetLetter));
    setPoppedId(null);
    setFeedback(null);
  }, []);

  useEffect(() => {
    startRound();
  }, [round]);

  const handlePop = useCallback(
    (id: string) => {
      if (poppedId) return;
      setPoppedId(id);

      if (id === target?.id) {
        setFeedback('correct');
        setScore((prev) => prev + 1);
      } else {
        setFeedback('wrong');
      }

      setTimeout(() => {
        roundRef.current += 1;
        if (roundRef.current >= ROUND_COUNT) {
          const finalScore = id === target?.id ? score + 1 : score;
          onGameEnd(finalScore, ROUND_COUNT);
        } else {
          setRound((prev) => prev + 1);
        }
      }, 1200);
    },
    [target, poppedId, score, onGameEnd]
  );

  if (!target) return null;

  return (
    <View style={styles.container}>
      {/* Skor ve hedef */}
      <View style={styles.header}>
        <Text style={styles.scoreText}>{score}/{ROUND_COUNT}</Text>
        <View style={[styles.targetBadge, SHADOW.small]}>
          <Text style={styles.targetText}>
            <Text style={[styles.targetLetter, { color: target.color }]}>{target.uppercase}</Text>
            {' harfini bul!'}
          </Text>
        </View>
        <Text style={styles.roundText}>{round + 1}/{ROUND_COUNT}</Text>
      </View>

      {/* Balonlar */}
      <View
        style={styles.balloonArea}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setAreaSize({ width, height });
        }}
      >
        {balloons.map((letter, i) => (
          <Balloon
            key={`${round}-${letter.id}-${i}`}
            letter={letter}
            index={i}
            targetX={positions[i]?.x ?? 0}
            targetY={positions[i]?.y ?? 0}
            onPop={handlePop}
            popped={poppedId === letter.id}
            color={BALLOON_COLORS[i % BALLOON_COLORS.length]}
          />
        ))}
      </View>

      {/* Geri bildirim */}
      {feedback === 'correct' && (
        <View style={styles.feedbackOverlay}>
          <Text style={[styles.feedbackText, { color: COLORS.success }]}>Dogru!</Text>
        </View>
      )}
      {feedback === 'wrong' && (
        <View style={styles.feedbackOverlay}>
          <Text style={[styles.feedbackText, { color: COLORS.warning }]}>Tekrar dene!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.paddingMd,
    paddingVertical: SIZES.paddingSm,
  },
  scoreText: {
    fontSize: FONTS.sizeMd,
    fontWeight: FONTS.weightBold,
    color: COLORS.text,
  },
  targetBadge: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.paddingSm,
    paddingHorizontal: SIZES.paddingMd,
  },
  targetText: {
    fontSize: FONTS.sizeMd,
    fontWeight: FONTS.weightBold,
    color: COLORS.text,
  },
  targetLetter: {
    fontSize: FONTS.sizeLg,
    fontWeight: FONTS.weightBlack,
  },
  roundText: {
    fontSize: FONTS.sizeSm,
    color: COLORS.textLight,
  },
  balloonArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  balloonWrapper: {
    position: 'absolute',
    top: 0,
  },
  balloon: {
    width: BALLOON_SIZE,
    height: BALLOON_SIZE,
    borderRadius: BALLOON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balloonLetter: {
    fontSize: FONTS.sizeLg,
    fontWeight: FONTS.weightBlack,
    color: COLORS.textWhite,
  },
  feedbackOverlay: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: FONTS.sizeXl,
    fontWeight: FONTS.weightBlack,
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: SIZES.paddingXl,
    paddingVertical: SIZES.paddingMd,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
  },
});
