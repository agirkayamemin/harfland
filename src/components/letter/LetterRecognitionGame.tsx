// Harf Tanima Oyunu - 3 harf arasindan dogru olani sec
// Asama 2: "E harfini bul!"

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, SIZES, FONTS, SHADOW } from '../../constants/theme';
import { HintBubble } from '../../components/feedback/HintBubble';
import { Letter, ALPHABET } from '../../data/alphabet';
import { LETTER_EMOJI } from '../../data/letterEmoji';
import { useAudio } from '../../hooks/useAudio';

interface LetterRecognitionGameProps {
  letter: Letter;
  onComplete: (correct: boolean) => void;
}

// Rastgele 2 yanlis harf sec (dogru harften farkli)
function getDistractors(correctId: string): Letter[] {
  const others = ALPHABET.filter((l) => l.id !== correctId);
  const shuffled = others.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}

export function LetterRecognitionGame({ letter, onComplete }: LetterRecognitionGameProps) {
  const { playEffect, playLetterSound } = useAudio();
  const distractors = useMemo(() => getDistractors(letter.id), [letter.id]);
  const options = useMemo(() => {
    const all = [letter, ...distractors];
    return all.sort(() => Math.random() - 0.5);
  }, [letter, distractors]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => { clearTimeout(timerRef.current); }, []);

  const shakeX = useSharedValue(0);
  const successScale = useSharedValue(1);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const handleSelect = useCallback(
    (selected: Letter) => {
      setLastActivity(Date.now());
      if (selectedId !== null) return; // Zaten secildi

      setSelectedId(selected.id);

      if (selected.id === letter.id) {
        setIsCorrect(true);
        playEffect('success');
        successScale.value = withSequence(
          withSpring(1.2, { damping: 8 }),
          withSpring(1, { damping: 12 })
        );
        timerRef.current = setTimeout(() => onComplete(true), 800);
      } else {
        setIsCorrect(false);
        playEffect('wrong');
        shakeX.value = withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
        // Yanlis secimi sifirla, tekrar denesin
        timerRef.current = setTimeout(() => {
          setSelectedId(null);
          setIsCorrect(null);
        }, 600);
      }
    },
    [letter.id, selectedId, onComplete]
  );

  return (
    <View style={styles.container}>
      {/* Soru */}
      <Text style={styles.question}>
        <Text style={[styles.targetLetter, { color: letter.color }]}>{letter.uppercase}</Text>
        {' harfini bul!'}
      </Text>

      {/* Emoji ipucu */}
      <Text style={styles.emoji}>{LETTER_EMOJI[letter.id] ?? '❓'}</Text>
      <Text style={styles.wordHint}>{letter.exampleWord}</Text>

      {/* 3 secenekli kartlar */}
      <Animated.View style={[styles.optionsRow, shakeStyle]}>
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const isRight = isSelected && isCorrect === true;
          const isWrong = isSelected && isCorrect === false;

          return (
            <Pressable
              key={opt.id}
              style={[
                styles.optionCard,
                SHADOW.small,
                isRight && styles.optionCorrect,
                isWrong && styles.optionWrong,
              ]}
              onPress={() => handleSelect(opt)}
              accessibilityLabel={`${opt.uppercase} harfi`}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.optionLetter,
                  { color: isRight ? COLORS.success : isWrong ? COLORS.primary : opt.color },
                ]}
              >
                {opt.uppercase}
              </Text>
            </Pressable>
          );
        })}
      </Animated.View>

      {/* Geri bildirim */}
      {isCorrect === true && (
        <Text style={styles.feedbackCorrect} accessibilityLiveRegion="polite">Harika! Doğru buldun!</Text>
      )}
      {isCorrect === false && (
        <Text style={styles.feedbackWrong} accessibilityLiveRegion="polite">Tekrar dene!</Text>
      )}

      <HintBubble hint="Yukarıdaki harfi kartlarda bul!" activityTimestamp={lastActivity} />
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
  question: {
    fontSize: FONTS.sizeLg,
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
    textAlign: 'center',
  },
  targetLetter: {
    fontSize: FONTS.sizeXl,
    fontFamily: FONTS.familyBlack,
  },
  emoji: {
    fontSize: 64,
  },
  wordHint: {
    fontSize: FONTS.sizeMd,
    color: COLORS.textLight,
    fontFamily: FONTS.familyBold,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: SIZES.paddingMd,
    marginTop: SIZES.paddingLg,
  },
  optionCard: {
    width: 90,
    height: 90,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.border,
  },
  optionCorrect: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.successLight,
  },
  optionWrong: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFE0E0',
  },
  optionLetter: {
    fontSize: FONTS.sizeXxl,
    fontFamily: FONTS.familyBlack,
  },
  feedbackCorrect: {
    fontSize: FONTS.sizeMd,
    fontFamily: FONTS.familyBold,
    color: COLORS.successText,
    marginTop: SIZES.paddingSm,
  },
  feedbackWrong: {
    fontSize: FONTS.sizeMd,
    fontFamily: FONTS.familyBold,
    color: COLORS.warningText,
    marginTop: SIZES.paddingSm,
  },
});
