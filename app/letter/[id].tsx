// Harf Ogrenme Ekrani - 4 asamali ogrenme dongusu
// Asama 1: Tanitma | Asama 2: Tanima | Asama 3: Yazma | Asama 4: Pratik

import { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { COLORS, SIZES, FONTS, SHADOW, GROUP_COLORS_DARK } from '@/src/constants/theme';
import { getLetterById } from '@/src/data/alphabet';
import { LETTER_EMOJI } from '@/src/data/letterEmoji';
import { LetterRecognitionGame } from '@/src/components/letter/LetterRecognitionGame';
import { ConfettiAnimation } from '@/src/components/feedback/ConfettiAnimation';
import { useProgressStore } from '@/src/stores/progressStore';
import { useAudio } from '@/src/hooks/useAudio';
import { HintBubble } from '@/src/components/feedback/HintBubble';

type LearningStage = 'introduce' | 'recognize' | 'trace' | 'complete';

export default function LetterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const letter = getLetterById(id ?? '');
  const updateLetterStage = useProgressStore((s) => s.updateLetterStage);
  const letterProgress = useProgressStore((s) => s.letterProgress[id ?? '']);

  const { playLetterSound, playWordSound, playEffect } = useAudio();

  const [stage, setStage] = useState<LearningStage>('introduce');
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => { clearTimeout(timerRef.current); }, []);

  const letterScale = useSharedValue(0);

  const letterAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: letterScale.value }],
  }));

  // Harf belirme animasyonu + sesi cal
  useEffect(() => {
    letterScale.value = withSequence(
      withSpring(1.1, { damping: 8, stiffness: 150 }),
      withSpring(1, { damping: 12 })
    );
    if (letter) {
      timerRef.current = setTimeout(() => playLetterSound(letter.id), 400);
    }
  }, []);

  const stageIndex = stage === 'introduce' ? 0 : stage === 'recognize' ? 1 : stage === 'trace' ? 2 : 3;

  // Tanima oyunu tamamlandi
  const handleRecognitionComplete = useCallback(
    (correct: boolean) => {
      if (correct && letter) {
        if (letterProgress && letterProgress.stage < 2) {
          updateLetterStage(letter.id, 2);
        }
        timerRef.current = setTimeout(() => setStage('trace'), 500);
      }
    },
    [letter, letterProgress, updateLetterStage]
  );

  // Trace ekranina gidildi mi takip et
  const wentToTrace = useRef(false);

  // Trace ekranından donunce complete asamasina gec
  useFocusEffect(
    useCallback(() => {
      if (stage === 'trace' && wentToTrace.current) {
        setStage('complete');
      }
    }, [stage])
  );

  const handleTracePress = useCallback(() => {
    if (letter) {
      wentToTrace.current = true;
      router.push(`/trace/${letter.id}`);
    }
  }, [letter, router]);

  // Tamamla - tek store cagrisinda stage + mastery + unlock
  const handleComplete = useCallback(() => {
    if (letter) {
      setShowConfetti(true);
      playEffect('confetti');
      updateLetterStage(letter.id, 4, 80);
      timerRef.current = setTimeout(() => router.back(), 1500);
    }
  }, [letter, updateLetterStage, router, playEffect]);

  if (!letter) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Harf bulunamadı</Text>
      </View>
    );
  }

  const emoji = LETTER_EMOJI[letter.id] ?? '❓';

  return (
    <View style={[styles.container, { paddingTop: insets.top + SIZES.paddingMd }]}>
      <ConfettiAnimation visible={showConfetti} />

      {/* Ust bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Geri" accessibilityRole="button">
          <FontAwesome name="arrow-left" size={SIZES.iconMd} color={COLORS.text} />
        </Pressable>
        <Text style={[styles.title, { color: letter.color }]}>
          {letter.uppercase} Harfi
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Asama gostergesi */}
      <View style={styles.stageIndicator} accessible={true} accessibilityLabel={`Aşama ${stageIndex + 1}, 4 üzerinden`}>
        {['Tanıt', 'Bul', 'Yaz', 'Tamam'].map((label, i) => (
          <View key={label} style={styles.stageStep}>
            <View
              style={[
                styles.stageDot,
                i <= stageIndex && { backgroundColor: letter.color },
              ]}
            />
            <Text
              style={[
                styles.stageLabel,
                i === stageIndex && { color: letter.color, fontFamily: FONTS.familyBold },
              ]}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* Asama 1: Tanitma */}
      {stage === 'introduce' && (
        <ScrollView contentContainerStyle={styles.stageContent} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => { setLastActivity(Date.now()); playLetterSound(letter.id); }} accessibilityLabel={`${letter.uppercase} harfi`} accessibilityHint="Dokunarak harfin sesini dinle" accessibilityRole="button">
            <Animated.View style={[styles.letterDisplay, letterAnimStyle]}>
              <Text style={[styles.bigLetter, { color: letter.color }]}>
                {letter.uppercase}
              </Text>
              <Text style={[styles.smallLetter, { color: letter.color }]}>
                {letter.lowercase}
              </Text>
            </Animated.View>
          </Pressable>

          <Pressable
            style={[styles.wordCard, SHADOW.small, { borderColor: letter.color }]}
            onPress={() => { setLastActivity(Date.now()); playWordSound(letter.exampleImage); }}
            accessibilityLabel={`${letter.exampleWord}`}
            accessibilityHint="Dokunarak kelimeyi dinle"
            accessibilityRole="button"
          >
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.wordText}>{letter.exampleWord}</Text>
            <Text style={styles.wordHighlight}>
              {(() => {
                const word = letter.exampleWord;
                const upperWord = word.toLocaleUpperCase('tr-TR');
                const idx = upperWord.indexOf(letter.uppercase);
                if (idx < 0) return word;
                return (
                  <>
                    {word.slice(0, idx)}
                    <Text style={{ color: letter.color, fontFamily: FONTS.familyBlack }}>
                      {word.slice(idx, idx + letter.uppercase.length)}
                    </Text>
                    {word.slice(idx + letter.uppercase.length)}
                  </>
                );
              })()}
            </Text>
          </Pressable>

          <Text style={styles.infoText}>
            {letter.type === 'vowel' ? 'Bu bir sesli harf' : 'Bu bir sessiz harf'}
          </Text>

          <HintBubble hint="Harfe dokunarak sesini dinle, sonra Devam Et'e bas!" activityTimestamp={lastActivity} />

          <Pressable
            style={[styles.continueButton, { backgroundColor: GROUP_COLORS_DARK[letter.group] }]}
            onPress={() => { setLastActivity(Date.now()); setStage('recognize'); }}
            accessibilityLabel="Devam et"
            accessibilityRole="button"
          >
            <Text style={styles.continueButtonText}>Devam Et</Text>
            <FontAwesome name="arrow-right" size={SIZES.iconSm} color={COLORS.textWhite} />
          </Pressable>
        </ScrollView>
      )}

      {/* Asama 2: Tanima */}
      {stage === 'recognize' && (
        <LetterRecognitionGame letter={letter} onComplete={handleRecognitionComplete} />
      )}

      {/* Asama 3: Yazma */}
      {stage === 'trace' && (
        <View style={styles.stageContent}>
          <Text style={styles.stageTitle}>Şimdi yazalım!</Text>
          <Text style={styles.stageDesc}>
            Parmağınla {letter.uppercase} harfini çizmeyi dene
          </Text>

          <Text style={styles.bigEmoji}>{emoji}</Text>

          <Pressable
            style={[styles.traceButton, SHADOW.medium, { backgroundColor: GROUP_COLORS_DARK[letter.group] }]}
            onPress={handleTracePress}
            accessibilityLabel={`${letter.uppercase} harfini yaz`}
            accessibilityRole="button"
          >
            <FontAwesome name="pencil" size={SIZES.iconMd} color={COLORS.textWhite} />
            <Text style={styles.traceButtonText}>Harfi Yaz</Text>
          </Pressable>

          <Pressable
            style={styles.skipButton}
            onPress={() => setStage('complete')}
            accessibilityLabel="Atla"
            accessibilityRole="button"
          >
            <FontAwesome name="forward" size={SIZES.iconSm} color={letter.color} />
            <Text style={[styles.skipButtonText, { color: letter.color }]}>Atla</Text>
          </Pressable>
        </View>
      )}

      {/* Asama 4: Tamamlama */}
      {stage === 'complete' && (
        <View style={styles.stageContent}>
          <Text style={styles.completeTitle}>Tebrikler!</Text>
          <Text style={styles.completeDesc}>
            {letter.uppercase} harfini öğrendin!
          </Text>

          <View style={[styles.summaryCard, SHADOW.small]}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={[styles.summaryLetter, { color: letter.color }]}>
              {letter.uppercase}{letter.lowercase}
            </Text>
            <Text style={styles.summaryWord}>{letter.exampleWord}</Text>
          </View>

          <Pressable
            style={[styles.continueButton, { backgroundColor: COLORS.success }]}
            onPress={handleComplete}
            accessibilityLabel="Tamamla"
            accessibilityRole="button"
          >
            <FontAwesome name="check" size={SIZES.iconSm} color={COLORS.textWhite} />
            <Text style={styles.continueButtonText}>Tamam</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.paddingLg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.paddingSm,
  },
  backButton: {
    width: SIZES.touchableMin,
    height: SIZES.touchableMin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FONTS.sizeLg,
    fontFamily: FONTS.familyBold,
  },
  placeholder: {
    width: SIZES.touchableMin,
  },
  stageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SIZES.paddingLg,
    marginBottom: SIZES.paddingMd,
  },
  stageStep: {
    alignItems: 'center',
    gap: 4,
  },
  stageDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },
  stageLabel: {
    fontSize: FONTS.sizeXs,
    color: COLORS.textLight,
  },
  stageContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.paddingMd,
    paddingBottom: SIZES.paddingXl,
  },
  letterDisplay: {
    alignItems: 'center',
    marginBottom: SIZES.paddingMd,
  },
  bigLetter: {
    fontSize: FONTS.sizeHuge,
    fontFamily: FONTS.familyBlack,
  },
  smallLetter: {
    fontSize: FONTS.sizeXxl,
    fontFamily: FONTS.familyBold,
    opacity: 0.6,
  },
  wordCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.paddingLg,
    alignItems: 'center',
    gap: SIZES.paddingSm,
    borderWidth: 2,
    width: '100%',
  },
  emoji: {
    fontSize: 56,
  },
  wordText: {
    fontSize: FONTS.sizeXl,
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
  },
  wordHighlight: {
    fontSize: FONTS.sizeLg,
    color: COLORS.textLight,
  },
  infoText: {
    fontSize: FONTS.sizeSm,
    color: COLORS.textLight,
    fontFamily: FONTS.familyBold,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.paddingMd,
    paddingHorizontal: SIZES.paddingXl,
    gap: SIZES.paddingSm,
    minHeight: SIZES.touchableMin,
    width: '100%',
    marginTop: SIZES.paddingMd,
  },
  continueButtonText: {
    fontSize: FONTS.sizeMd,
    fontFamily: FONTS.familyBold,
    color: COLORS.textWhite,
  },
  stageTitle: {
    fontSize: FONTS.sizeXl,
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
  },
  stageDesc: {
    fontSize: FONTS.sizeMd,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  bigEmoji: {
    fontSize: 80,
    marginVertical: SIZES.paddingMd,
  },
  traceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radiusLg,
    paddingVertical: SIZES.paddingLg,
    gap: SIZES.paddingMd,
    width: '100%',
    minHeight: SIZES.touchableLarge,
  },
  traceButtonText: {
    fontSize: FONTS.sizeLg,
    fontFamily: FONTS.familyBold,
    color: COLORS.textWhite,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.paddingXs,
    paddingVertical: SIZES.paddingSm,
    minHeight: SIZES.touchableMin,
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: FONTS.sizeSm,
    fontFamily: FONTS.familyBold,
  },
  completeTitle: {
    fontSize: FONTS.sizeXl,
    fontFamily: FONTS.familyBlack,
    color: COLORS.successText,
  },
  completeDesc: {
    fontSize: FONTS.sizeMd,
    color: COLORS.textLight,
  },
  summaryCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.paddingLg,
    alignItems: 'center',
    gap: SIZES.paddingSm,
    width: '80%',
  },
  summaryLetter: {
    fontSize: FONTS.sizeXxl,
    fontFamily: FONTS.familyBlack,
  },
  summaryWord: {
    fontSize: FONTS.sizeLg,
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
  },
  errorText: {
    fontSize: FONTS.sizeMd,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 100,
  },
});
