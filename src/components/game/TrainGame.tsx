// Harf Treni - Kelime olusturma oyunu
// Cocuk harflere sirayla dokunarak vagonu doldurur
// minUnlockedLetters: 6

import { useState, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, SIZES, FONTS, SHADOW } from '../../constants/theme';
import { ALPHABET, Letter } from '../../data/alphabet';
import { TRAIN_WORDS, TrainWord } from '../../data/trainWords';
import { useProgressStore } from '../../stores/progressStore';

const ROUND_COUNT = 6;
const DISTRACTOR_COUNT = 2;

interface TrainGameProps {
  onGameEnd: (score: number, total: number) => void;
}

function getUnlockedLetters(): Letter[] {
  const progress = useProgressStore.getState().letterProgress;
  return ALPHABET.filter((l) => progress[l.id]?.unlocked);
}

function getPlayableWords(unlockedIds: Set<string>): TrainWord[] {
  return TRAIN_WORDS.filter((tw) => {
    const chars = tw.word.split('');
    return chars.every((ch) => unlockedIds.has(ch));
  });
}

function pickDistractors(wordLetters: string[], unlockedIds: Set<string>, count: number): string[] {
  const wordSet = new Set(wordLetters);
  const available = Array.from(unlockedIds).filter((id) => !wordSet.has(id));
  const shuffled = available.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

interface WagonProps {
  letter: string | null;
  color: string;
  index: number;
  filled: boolean;
}

function Wagon({ letter, color, filled }: WagonProps) {
  const scale = useSharedValue(filled ? 0.5 : 1);

  if (filled) {
    scale.value = withSpring(1, { damping: 8, stiffness: 200 });
  }

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.wagon,
        SHADOW.small,
        filled
          ? { borderColor: color, backgroundColor: COLORS.backgroundCard }
          : { borderColor: COLORS.border, backgroundColor: COLORS.backgroundDark },
        animStyle,
      ]}
    >
      <Text style={[styles.wagonLetter, { color: filled ? color : 'transparent' }]}>
        {letter ?? ''}
      </Text>
    </Animated.View>
  );
}

interface LetterButtonProps {
  letter: string;
  color: string;
  used: boolean;
  wrong: boolean;
  onPress: () => void;
}

function LetterButton({ letter, color, used, wrong, onPress }: LetterButtonProps) {
  const shakeX = useSharedValue(0);

  if (wrong) {
    shakeX.value = withSpring(0, { damping: 3, stiffness: 400 });
    shakeX.value = 8;
  }

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        style={[
          styles.letterButton,
          SHADOW.small,
          used && styles.letterButtonUsed,
        ]}
        onPress={onPress}
        disabled={used}
      >
        <Text style={[styles.letterButtonText, { color: used ? COLORS.textLight : color }]}>
          {letter}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function TrainGame({ onGameEnd }: TrainGameProps) {
  const unlockedLetters = useMemo(() => getUnlockedLetters(), []);
  const unlockedIds = useMemo(() => new Set(unlockedLetters.map((l) => l.id)), [unlockedLetters]);

  const rounds = useMemo(() => {
    const playable = getPlayableWords(unlockedIds);
    if (playable.length === 0) return [];
    const shuffled = playable.sort(() => Math.random() - 0.5);
    const selected: TrainWord[] = [];
    for (let i = 0; i < ROUND_COUNT; i++) {
      selected.push(shuffled[i % shuffled.length]);
    }
    return selected;
  }, [unlockedIds]);

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [filledCount, setFilledCount] = useState(0);
  const [wrongTaps, setWrongTaps] = useState(0);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const scoreRef = useRef(0);

  const currentWord = rounds[round];

  const letterOptions = useMemo(() => {
    if (!currentWord) return [];
    const wordChars = currentWord.word.split('');
    const distractors = pickDistractors(wordChars, unlockedIds, DISTRACTOR_COUNT);
    const all = [...wordChars, ...distractors];
    return all.sort(() => Math.random() - 0.5);
  }, [round, currentWord, unlockedIds]);

  // Harf rengi bul
  const getLetterColor = useCallback((ch: string): string => {
    const letter = ALPHABET.find((l) => l.id === ch);
    return letter?.color ?? COLORS.text;
  }, []);

  const handleLetterPress = useCallback(
    (index: number) => {
      if (!currentWord || usedIndices.has(index)) return;

      const pressed = letterOptions[index];
      const expected = currentWord.word[filledCount];

      if (pressed === expected) {
        // Dogru harf
        const newUsed = new Set(usedIndices);
        newUsed.add(index);
        setUsedIndices(newUsed);
        const newFilled = filledCount + 1;
        setFilledCount(newFilled);

        if (newFilled === currentWord.word.length) {
          // Round bitti
          const roundScore = wrongTaps < 3 ? 1 : 0;
          scoreRef.current += roundScore;
          setScore(scoreRef.current);
          setFeedback('Harika!');

          setTimeout(() => {
            const nextRound = round + 1;
            if (nextRound >= ROUND_COUNT) {
              onGameEnd(scoreRef.current, ROUND_COUNT);
            } else {
              setRound(nextRound);
              setFilledCount(0);
              setWrongTaps(0);
              setUsedIndices(new Set());
              setWrongIndex(null);
              setFeedback(null);
            }
          }, 1200);
        }
      } else {
        // Yanlis harf
        setWrongTaps((prev) => prev + 1);
        setWrongIndex(index);
        setFeedback('Tekrar dene!');
        setTimeout(() => {
          setWrongIndex(null);
          setFeedback(null);
        }, 600);
      }
    },
    [currentWord, filledCount, wrongTaps, usedIndices, letterOptions, round, onGameEnd]
  );

  if (!currentWord || rounds.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Yeterli kelime yok!</Text>
      </View>
    );
  }

  const wordChars = currentWord.word.split('');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.scoreText}>{score}/{ROUND_COUNT}</Text>
        <Text style={styles.roundText}>{round + 1}/{ROUND_COUNT}</Text>
      </View>

      {/* Emoji + kelime referans */}
      <Text style={styles.emoji}>{currentWord.emoji}</Text>
      <Text style={styles.wordRef}>{currentWord.word}</Text>

      {/* Vagonlar */}
      <View style={styles.wagonRow}>
        {wordChars.map((ch, i) => (
          <Wagon
            key={`${round}-${i}`}
            letter={i < filledCount ? ch : null}
            color={getLetterColor(ch)}
            index={i}
            filled={i < filledCount}
          />
        ))}
      </View>

      {/* Harf butonlari */}
      <View style={styles.lettersRow}>
        {letterOptions.map((ch, i) => (
          <LetterButton
            key={`${round}-btn-${i}`}
            letter={ch}
            color={getLetterColor(ch)}
            used={usedIndices.has(i)}
            wrong={wrongIndex === i}
            onPress={() => handleLetterPress(i)}
          />
        ))}
      </View>

      {/* Geri bildirim */}
      {feedback && (
        <View style={styles.feedbackOverlay}>
          <Text
            style={[
              styles.feedbackText,
              { color: feedback === 'Harika!' ? COLORS.success : COLORS.warning },
            ]}
          >
            {feedback}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.paddingMd,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: SIZES.paddingMd,
    position: 'absolute',
    top: 0,
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
  emoji: {
    fontSize: 64,
  },
  wordRef: {
    fontSize: FONTS.sizeLg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textLight,
    letterSpacing: 6,
  },
  wagonRow: {
    flexDirection: 'row',
    gap: SIZES.paddingSm,
    marginTop: SIZES.paddingMd,
  },
  wagon: {
    width: 64,
    height: 72,
    borderRadius: SIZES.radiusSm,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wagonLetter: {
    fontSize: FONTS.sizeXl,
    fontWeight: FONTS.weightBlack,
  },
  lettersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SIZES.paddingSm,
    marginTop: SIZES.paddingLg,
    paddingHorizontal: SIZES.paddingMd,
  },
  letterButton: {
    width: 72,
    height: 72,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  letterButtonUsed: {
    opacity: 0.3,
  },
  letterButtonText: {
    fontSize: FONTS.sizeXl,
    fontWeight: FONTS.weightBlack,
  },
  emptyText: {
    fontSize: FONTS.sizeMd,
    color: COLORS.textLight,
  },
  feedbackOverlay: {
    position: 'absolute',
    bottom: SIZES.paddingXl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: FONTS.sizeLg,
    fontWeight: FONTS.weightBlack,
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: SIZES.paddingXl,
    paddingVertical: SIZES.paddingMd,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
  },
});
