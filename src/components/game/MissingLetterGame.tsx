// Eksik Harf - Kelimede eksik harfi bul
// Ornek: _LMA -> E harfini sec

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { COLORS, SIZES, FONTS, SHADOW } from '../../constants/theme';
import { HintBubble } from '../../components/feedback/HintBubble';
import { ALPHABET, Letter } from '../../data/alphabet';
import { LETTER_EMOJI } from '../../data/letterEmoji';
import { useProgressStore } from '../../stores/progressStore';
import { useAudio } from '../../hooks/useAudio';

const ROUND_COUNT = 6;

interface MissingLetterGameProps {
  onGameEnd: (score: number, total: number) => void;
}

function getUnlockedLetters(): Letter[] {
  const progress = useProgressStore.getState().letterProgress;
  return ALPHABET.filter((l) => progress[l.id]?.unlocked);
}

function createQuestion(target: Letter, unlocked: Letter[]) {
  const word = target.exampleWord.toUpperCase();
  const emoji = LETTER_EMOJI[target.id] ?? '❓';

  // Hedef harfin kelime icindeki pozisyonunu bul
  const targetUpper = target.uppercase;
  const pos = word.indexOf(targetUpper);
  const display = pos >= 0
    ? word.slice(0, pos) + '_' + word.slice(pos + targetUpper.length)
    : '_' + word.slice(1);

  // 3 yanlis secenekle karistir (sadece acik harflerden)
  const others = unlocked.filter((l) => l.id !== target.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [target, ...others].sort(() => Math.random() - 0.5);

  return { word: display, answer: target.id, emoji, options };
}

export function MissingLetterGame({ onGameEnd }: MissingLetterGameProps) {
  const { playEffect } = useAudio();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const letters = useMemo(() => {
    const unlocked = getUnlockedLetters();
    return unlocked.sort(() => Math.random() - 0.5).slice(0, ROUND_COUNT);
  }, []);

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const scoreRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => { clearTimeout(timerRef.current); }, []);

  const allUnlocked = useMemo(() => getUnlockedLetters(), []);

  const question = useMemo(() => {
    if (round >= letters.length) return null;
    return createQuestion(letters[round], allUnlocked);
  }, [round, letters, allUnlocked]);

  const handleSelect = useCallback(
    (id: string) => {
      setLastActivity(Date.now());
      if (selectedId || !question) return;
      setSelectedId(id);

      if (id === question.answer) {
        setIsCorrect(true);
        playEffect('success');
        scoreRef.current += 1;
        setScore(scoreRef.current);
      } else {
        setIsCorrect(false);
        playEffect('wrong');
      }

      timerRef.current = setTimeout(() => {
        const nextRound = round + 1;
        if (nextRound >= letters.length) {
          onGameEnd(scoreRef.current, letters.length);
        } else {
          setRound(nextRound);
          setSelectedId(null);
          setIsCorrect(null);
        }
      }, 1000);
    },
    [selectedId, question, round, letters.length, onGameEnd]
  );

  if (!question) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.scoreText}>{score}/{letters.length}</Text>
        <Text style={styles.roundText}>{round + 1}/{letters.length}</Text>
      </View>

      {/* Emoji ve kelime */}
      <Text style={styles.emoji}>{question.emoji}</Text>
      <Text style={styles.word}>{question.word}</Text>
      <Text style={styles.hint}>Eksik harfi bul!</Text>

      {/* Secenekler */}
      <View style={styles.optionsRow}>
        {question.options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const isRight = isSelected && isCorrect === true;
          const isWrong = isSelected && isCorrect === false;

          return (
            <Pressable
              key={opt.id}
              style={[
                styles.option,
                SHADOW.small,
                isRight && styles.optionCorrect,
                isWrong && styles.optionWrong,
              ]}
              onPress={() => handleSelect(opt.id)}
              accessibilityLabel={`${opt.uppercase} harfi`}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.optionLetter,
                  { color: isRight ? COLORS.textWhite : isWrong ? COLORS.textWhite : opt.color },
                ]}
              >
                {opt.uppercase}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <HintBubble hint="Kelimede eksik olan harfi seç!" activityTimestamp={lastActivity} />

      {isCorrect === true && (
        <Text style={styles.feedbackCorrect} accessibilityLiveRegion="polite">Harika!</Text>
      )}
      {isCorrect === false && (
        <Text style={styles.feedbackWrong} accessibilityLiveRegion="polite">Tekrar dene!</Text>
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
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
  },
  roundText: {
    fontSize: FONTS.sizeSm,
    color: COLORS.textLight,
  },
  emoji: {
    fontSize: 72,
  },
  word: {
    fontSize: FONTS.sizeXxl,
    fontFamily: FONTS.familyBlack,
    color: COLORS.text,
    letterSpacing: 8,
  },
  hint: {
    fontSize: FONTS.sizeMd,
    color: COLORS.textLight,
    fontFamily: FONTS.familyBold,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: SIZES.paddingMd,
    marginTop: SIZES.paddingLg,
  },
  option: {
    width: 72,
    height: 72,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  optionCorrect: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  optionWrong: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionLetter: {
    fontSize: FONTS.sizeXl,
    fontFamily: FONTS.familyBlack,
  },
  feedbackCorrect: {
    fontSize: FONTS.sizeLg,
    fontFamily: FONTS.familyBold,
    color: COLORS.successText,
  },
  feedbackWrong: {
    fontSize: FONTS.sizeLg,
    fontFamily: FONTS.familyBold,
    color: COLORS.warningText,
  },
});
