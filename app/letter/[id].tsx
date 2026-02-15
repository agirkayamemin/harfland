// Harf Ogrenme Ekrani - 4 asamali ogrenme dongusu
// Asama 1: Tanitma | Asama 2: Tanima | Asama 3: Yazma | Asama 4: Pratik

import { useState, useCallback, useRef } from 'react';
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
import { COLORS, SIZES, FONTS, SHADOW } from '@/src/constants/theme';
import { getLetterById } from '@/src/data/alphabet';
import { LETTER_EMOJI } from '@/src/data/letterEmoji';
import { LetterRecognitionGame } from '@/src/components/letter/LetterRecognitionGame';
import { ConfettiAnimation } from '@/src/components/feedback/ConfettiAnimation';
import { useProgressStore } from '@/src/stores/progressStore';

type LearningStage = 'introduce' | 'recognize' | 'trace' | 'complete';

export default function LetterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const letter = getLetterById(id ?? '');
  const updateLetterStage = useProgressStore((s) => s.updateLetterStage);
  const letterProgress = useProgressStore((s) => s.letterProgress[id ?? '']);

  const [stage, setStage] = useState<LearningStage>('introduce');
  const [showConfetti, setShowConfetti] = useState(false);

  const letterScale = useSharedValue(0);

  const letterAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: letterScale.value }],
  }));

  // Harf belirme animasyonu
  useState(() => {
    letterScale.value = withSequence(
      withSpring(1.1, { damping: 8, stiffness: 150 }),
      withSpring(1, { damping: 12 })
    );
  });

  const stageIndex = stage === 'introduce' ? 0 : stage === 'recognize' ? 1 : stage === 'trace' ? 2 : 3;

  // Tanima oyunu tamamlandi
  const handleRecognitionComplete = useCallback(
    (correct: boolean) => {
      if (correct && letter) {
        if (letterProgress && letterProgress.stage < 2) {
          updateLetterStage(letter.id, 2);
        }
        setTimeout(() => setStage('trace'), 500);
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
      updateLetterStage(letter.id, 4, 80);
      setTimeout(() => router.back(), 1500);
    }
  }, [letter, updateLetterStage, router]);

  if (!letter) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Harf bulunamadi</Text>
      </View>
    );
  }

  const emoji = LETTER_EMOJI[letter.id] ?? '❓';

  return (
    <View style={[styles.container, { paddingTop: insets.top + SIZES.paddingMd }]}>
      <ConfettiAnimation visible={showConfetti} />

      {/* Ust bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={SIZES.iconMd} color={COLORS.text} />
        </Pressable>
        <Text style={[styles.title, { color: letter.color }]}>
          {letter.uppercase} Harfi
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Asama gostergesi */}
      <View style={styles.stageIndicator}>
        {['Tanit', 'Bul', 'Yaz', 'Tamam'].map((label, i) => (
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
                i === stageIndex && { color: letter.color, fontWeight: FONTS.weightBold },
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
          <Animated.View style={[styles.letterDisplay, letterAnimStyle]}>
            <Text style={[styles.bigLetter, { color: letter.color }]}>
              {letter.uppercase}
            </Text>
            <Text style={[styles.smallLetter, { color: letter.color }]}>
              {letter.lowercase}
            </Text>
          </Animated.View>

          <View style={[styles.wordCard, SHADOW.small, { borderColor: letter.color }]}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.wordText}>{letter.exampleWord}</Text>
            <Text style={styles.wordHighlight}>
              <Text style={{ color: letter.color, fontWeight: FONTS.weightBlack }}>
                {letter.uppercase}
              </Text>
              {letter.exampleWord.slice(1)}
            </Text>
          </View>

          <Text style={styles.infoText}>
            {letter.type === 'vowel' ? 'Bu bir sesli harf' : 'Bu bir sessiz harf'}
          </Text>

          <Pressable
            style={[styles.continueButton, { backgroundColor: letter.color }]}
            onPress={() => setStage('recognize')}
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
          <Text style={styles.stageTitle}>Simdi yazalim!</Text>
          <Text style={styles.stageDesc}>
            Parmaginla {letter.uppercase} harfini cizmeyi dene
          </Text>

          <Text style={styles.bigEmoji}>{emoji}</Text>

          <Pressable
            style={[styles.traceButton, SHADOW.medium, { backgroundColor: letter.color }]}
            onPress={handleTracePress}
          >
            <FontAwesome name="pencil" size={SIZES.iconMd} color={COLORS.textWhite} />
            <Text style={styles.traceButtonText}>Harfi Yaz</Text>
          </Pressable>

          <Pressable
            style={styles.skipButton}
            onPress={() => setStage('complete')}
          >
            <Text style={[styles.skipButtonText, { color: letter.color }]}>Atla</Text>
          </Pressable>
        </View>
      )}

      {/* Asama 4: Tamamlama */}
      {stage === 'complete' && (
        <View style={styles.stageContent}>
          <Text style={styles.completeTitle}>Tebrikler!</Text>
          <Text style={styles.completeDesc}>
            {letter.uppercase} harfini ogrendin!
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
    fontWeight: FONTS.weightBold,
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
    fontWeight: FONTS.weightBlack,
  },
  smallLetter: {
    fontSize: FONTS.sizeXxl,
    fontWeight: FONTS.weightMedium,
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
    fontWeight: FONTS.weightBold,
    color: COLORS.text,
  },
  wordHighlight: {
    fontSize: FONTS.sizeLg,
    color: COLORS.textLight,
  },
  infoText: {
    fontSize: FONTS.sizeSm,
    color: COLORS.textLight,
    fontWeight: FONTS.weightMedium,
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
    fontWeight: FONTS.weightBold,
    color: COLORS.textWhite,
  },
  stageTitle: {
    fontSize: FONTS.sizeXl,
    fontWeight: FONTS.weightBold,
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
    fontWeight: FONTS.weightBold,
    color: COLORS.textWhite,
  },
  skipButton: {
    paddingVertical: SIZES.paddingSm,
    minHeight: SIZES.touchableMin,
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: FONTS.sizeSm,
    fontWeight: FONTS.weightMedium,
  },
  completeTitle: {
    fontSize: FONTS.sizeXl,
    fontWeight: FONTS.weightBlack,
    color: COLORS.success,
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
    fontWeight: FONTS.weightBlack,
  },
  summaryWord: {
    fontSize: FONTS.sizeLg,
    fontWeight: FONTS.weightBold,
    color: COLORS.text,
  },
  errorText: {
    fontSize: FONTS.sizeMd,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 100,
  },
});
