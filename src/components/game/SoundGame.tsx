// Ses Avcisi - Fonetik farkindalik oyunu
// Hedef harfle baslayan resmi/emojiyi bul
// minUnlockedLetters: 5

import { useState, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { COLORS, SIZES, FONTS, SHADOW } from '../../constants/theme';
import { ALPHABET, Letter } from '../../data/alphabet';
import { LETTER_EMOJI } from '../../data/letterEmoji';
import { useProgressStore } from '../../stores/progressStore';
import { useAudio } from '../../hooks/useAudio';

const ROUND_COUNT = 8;
const OPTIONS_COUNT = 4;

interface SoundGameProps {
  onGameEnd: (score: number, total: number) => void;
}

function getUnlockedLetters(): Letter[] {
  const progress = useProgressStore.getState().letterProgress;
  return ALPHABET.filter((l) => progress[l.id]?.unlocked);
}

interface RoundData {
  target: Letter;
  options: { letter: Letter; emoji: string }[];
  correctIndex: number;
}

function buildRounds(unlocked: Letter[]): RoundData[] {
  const shuffled = unlocked.sort(() => Math.random() - 0.5);
  const targets: Letter[] = [];
  for (let i = 0; i < ROUND_COUNT; i++) {
    targets.push(shuffled[i % shuffled.length]);
  }

  return targets.map((target) => {
    const targetEmoji = LETTER_EMOJI[target.id] ?? '❓';

    // Distractor secerken ayni emojiyi kullananlari filtrele (G/V ikisi de gemi)
    const distractors = unlocked
      .filter((l) => l.id !== target.id && LETTER_EMOJI[l.id] !== targetEmoji)
      .sort(() => Math.random() - 0.5)
      .slice(0, OPTIONS_COUNT - 1);

    const options = [
      { letter: target, emoji: targetEmoji },
      ...distractors.map((l) => ({ letter: l, emoji: LETTER_EMOJI[l.id] ?? '❓' })),
    ].sort(() => Math.random() - 0.5);

    const correctIndex = options.findIndex((o) => o.letter.id === target.id);

    return { target, options, correctIndex };
  });
}

export function SoundGame({ onGameEnd }: SoundGameProps) {
  const { playEffect, playLetterSound } = useAudio();
  const rounds = useMemo(() => {
    const unlocked = getUnlockedLetters();
    return buildRounds(unlocked);
  }, []);

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const scoreRef = useRef(0);

  const currentRound = rounds[round];

  const handleSelect = useCallback(
    (index: number) => {
      if (selectedIndex !== null || !currentRound) return;
      setSelectedIndex(index);

      if (index === currentRound.correctIndex) {
        setIsCorrect(true);
        playEffect('success');
        scoreRef.current += 1;
        setScore(scoreRef.current);
      } else {
        setIsCorrect(false);
        playEffect('wrong');
      }

      setTimeout(() => {
        const nextRound = round + 1;
        if (nextRound >= ROUND_COUNT) {
          onGameEnd(scoreRef.current, ROUND_COUNT);
        } else {
          setRound(nextRound);
          setSelectedIndex(null);
          setIsCorrect(null);
        }
      }, isCorrect === null && index === currentRound.correctIndex ? 1000 : 1200);
    },
    [selectedIndex, currentRound, round, onGameEnd]
  );

  if (!currentRound) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.scoreText}>{score}/{ROUND_COUNT}</Text>
        <Text style={styles.roundText}>{round + 1}/{ROUND_COUNT}</Text>
      </View>

      {/* Hedef harf badge */}
      <View style={[styles.targetBadge, SHADOW.medium, { borderColor: currentRound.target.color }]}>
        <Text style={[styles.targetLetter, { color: currentRound.target.color }]}>
          {currentRound.target.uppercase}
        </Text>
      </View>

      <Text style={styles.hint}>Bu harfle başlayan resmi bul!</Text>

      {/* 2x2 emoji grid */}
      <View style={styles.grid}>
        {currentRound.options.map((opt, i) => {
          const isSelected = selectedIndex === i;
          const isRight = isSelected && isCorrect === true;
          const isWrong = isSelected && isCorrect === false;
          // Yanlis secimden sonra dogru cevabi highlight et
          const isHighlighted = isCorrect === false && i === currentRound.correctIndex;

          return (
            <Pressable
              key={`${round}-${i}`}
              style={[
                styles.emojiCard,
                SHADOW.small,
                isRight && styles.cardCorrect,
                isWrong && styles.cardWrong,
                isHighlighted && styles.cardHighlighted,
              ]}
              onPress={() => handleSelect(i)}
              disabled={selectedIndex !== null}
            >
              <Text style={styles.emojiText}>{opt.emoji}</Text>
              {/* Dogru secimde kelime goster */}
              {(isRight || isHighlighted) && (
                <Text style={styles.wordLabel}>{opt.letter.exampleWord}</Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Geri bildirim */}
      {isCorrect === true && (
        <Text style={styles.feedbackCorrect}>Harika!</Text>
      )}
      {isCorrect === false && (
        <Text style={styles.feedbackWrong}>Tekrar dene!</Text>
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
  targetBadge: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: SIZES.radiusMd,
    borderWidth: 3,
    paddingVertical: SIZES.paddingMd,
    paddingHorizontal: SIZES.paddingXl,
  },
  targetLetter: {
    fontSize: FONTS.sizeXxl,
    fontWeight: FONTS.weightBlack,
  },
  hint: {
    fontSize: FONTS.sizeMd,
    color: COLORS.textLight,
    fontWeight: FONTS.weightMedium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SIZES.paddingMd,
    marginTop: SIZES.paddingMd,
    paddingHorizontal: SIZES.paddingMd,
  },
  emojiCard: {
    width: '44%',
    aspectRatio: 1,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.border,
  },
  cardCorrect: {
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.success,
  },
  cardWrong: {
    backgroundColor: COLORS.warningLight,
    borderColor: COLORS.warning,
  },
  cardHighlighted: {
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.success,
  },
  emojiText: {
    fontSize: 48,
  },
  wordLabel: {
    fontSize: FONTS.sizeSm,
    fontWeight: FONTS.weightBold,
    color: COLORS.success,
    marginTop: SIZES.paddingXs,
  },
  feedbackCorrect: {
    fontSize: FONTS.sizeLg,
    fontWeight: FONTS.weightBold,
    color: COLORS.success,
  },
  feedbackWrong: {
    fontSize: FONTS.sizeLg,
    fontWeight: FONTS.weightBold,
    color: COLORS.warning,
  },
});
