// Harf Cizme Ekrani - SVG path + gesture handler ile parmak takibi
// Cocuk serbest cizer, "Kontrol Et" butonuyla degerlendirilir
import { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS, SIZES, FONTS, SHADOW } from '@/src/constants/theme';
import { getLetterById } from '@/src/data/alphabet';
import { getTracePathById } from '@/src/data/tracePaths';
import { LetterTraceCanvas, getDrawnStrokes, resetTracePoints } from '@/src/components/letter/LetterTraceCanvas';
import { validateTrace, parseSvgPathPoints, samplePathPoints, Point } from '@/src/utils/traceValidator';
import { ConfettiAnimation } from '@/src/components/feedback/ConfettiAnimation';
import { EncouragementText } from '@/src/components/feedback/EncouragementText';
import { HintBubble } from '@/src/components/feedback/HintBubble';
import { useSpacedRepetition } from '@/src/hooks/useSpacedRepetition';
import { useProgressStore } from '@/src/stores/progressStore';
import { useAudio } from '@/src/hooks/useAudio';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CANVAS_SIZE = Math.min(SCREEN_WIDTH - SIZES.paddingLg * 2, 320);

type TraceState = 'drawing' | 'success' | 'retry';

export default function TraceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { processAttempt } = useSpacedRepetition();
  const addLetterToSession = useProgressStore((s) => s.addLetterToSession);
  const addActivityToSession = useProgressStore((s) => s.addActivityToSession);

  const { playEffect } = useAudio();

  const letter = getLetterById(id ?? '');
  const tracePath = getTracePathById(id ?? '');

  const [traceState, setTraceState] = useState<TraceState>('drawing');
  const [score, setScore] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [startTime] = useState(Date.now());

  // Hedef noktalar: tum stroke'larin parse edilmis noktaları (koridor kontrolu icin)
  const targetPoints = useMemo(() => {
    if (!tracePath) return [];
    const points: Point[] = [];
    for (const stroke of tracePath.strokes) {
      points.push(...parseSvgPathPoints(stroke.d));
    }
    return samplePathPoints(points, 120);
  }, [tracePath]);

  // "Kontrol Et" butonuna basildiginda
  const handleCheck = useCallback(() => {
    if (!letter || !tracePath) return;

    const drawnStrokes = getDrawnStrokes();
    if (drawnStrokes.length === 0) return;

    setLastActivity(Date.now());
    setAttemptCount((prev) => prev + 1);

    const result = validateTrace(drawnStrokes, targetPoints);
    setScore(result.score);

    const responseTime = Date.now() - startTime;

    if (result.passed) {
      setTraceState('success');
      playEffect('star');
      processAttempt(letter.id, true, responseTime, result.score);
      addLetterToSession(letter.id);
      addActivityToSession();
    } else {
      setTraceState('retry');
      playEffect('hint');
      processAttempt(letter.id, false, responseTime, result.score);
    }
  }, [letter, tracePath, targetPoints, startTime, processAttempt, addLetterToSession, addActivityToSession]);

  // Tekrar dene
  const handleRetry = useCallback(() => {
    resetTracePoints();
    setTraceState('drawing');
    setScore(0);
    setLastActivity(Date.now());
  }, []);

  if (!letter || !tracePath) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Harf bulunamadı</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + SIZES.paddingMd }]}>
      {/* Konfeti */}
      <ConfettiAnimation visible={traceState === 'success'} />

      {/* Ust bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={SIZES.iconMd} color={COLORS.text} />
        </Pressable>
        <Text style={[styles.title, { color: letter.color }]}>
          {letter.uppercase} Harfini Yaz
        </Text>
        <View style={styles.attemptBadge}>
          <Text style={styles.attemptText}>{attemptCount}</Text>
        </View>
      </View>

      {/* Ipucu */}
      {traceState === 'drawing' && (
        <Text style={styles.strokeHint}>
          Parmaginla harfi ciz, bitince kontrol et!
        </Text>
      )}

      {/* Cizim tuvali */}
      <View style={styles.canvasWrapper}>
        <LetterTraceCanvas
          key={attemptCount}
          tracePath={tracePath}
          letterColor={letter.color}
          canvasSize={CANVAS_SIZE}
          disabled={traceState !== 'drawing'}
        />
      </View>

      {/* Kontrol Et butonu */}
      {traceState === 'drawing' && (
        <View style={styles.checkContainer}>
          <Pressable
            style={[styles.checkButton, SHADOW.medium, { backgroundColor: letter.color }]}
            onPress={handleCheck}
          >
            <FontAwesome name="check-circle" size={SIZES.iconMd} color={COLORS.textWhite} />
            <Text style={styles.checkButtonText}>Kontrol Et</Text>
          </Pressable>

          <HintBubble
            hint={`Parmaginla ${letter.uppercase} harfini ciz!`}
            activityTimestamp={lastActivity}
          />
        </View>
      )}

      {/* Sonuc - Basarili */}
      {traceState === 'success' && (
        <View style={styles.resultContainer}>
          <EncouragementText type="success" visible={true} />

          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.actionButton, { backgroundColor: letter.color }]}
              onPress={handleRetry}
            >
              <FontAwesome name="repeat" size={SIZES.iconSm} color={COLORS.textWhite} />
              <Text style={styles.actionButtonText}>Tekrar Yaz</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, { backgroundColor: COLORS.success }]}
              onPress={() => router.back()}
            >
              <FontAwesome name="check" size={SIZES.iconSm} color={COLORS.textWhite} />
              <Text style={styles.actionButtonText}>Devam Et</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Sonuc - Tekrar dene */}
      {traceState === 'retry' && (
        <View style={styles.resultContainer}>
          <EncouragementText type="encourage" visible={true} />

          <Pressable
            style={[styles.retryButton, SHADOW.small, { borderColor: letter.color }]}
            onPress={handleRetry}
          >
            <FontAwesome name="repeat" size={SIZES.iconMd} color={letter.color} />
            <Text style={[styles.retryButtonText, { color: letter.color }]}>Tekrar Dene</Text>
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
  attemptBadge: {
    width: SIZES.touchableMin / 2,
    height: SIZES.touchableMin / 2,
    borderRadius: SIZES.radiusRound,
    backgroundColor: COLORS.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attemptText: {
    fontSize: FONTS.sizeSm,
    fontWeight: FONTS.weightBold,
    color: COLORS.textLight,
  },
  strokeHint: {
    fontSize: FONTS.sizeSm,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SIZES.paddingSm,
  },
  canvasWrapper: {
    alignItems: 'center',
    marginVertical: SIZES.paddingSm,
  },
  checkContainer: {
    alignItems: 'center',
    gap: SIZES.paddingSm,
    marginTop: SIZES.paddingMd,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.paddingMd,
    paddingHorizontal: SIZES.paddingXl,
    gap: SIZES.paddingSm,
    minHeight: SIZES.touchableMin,
    width: '100%',
  },
  checkButtonText: {
    fontSize: FONTS.sizeLg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textWhite,
  },
  resultContainer: {
    alignItems: 'center',
    gap: SIZES.paddingSm,
    marginTop: SIZES.paddingMd,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SIZES.paddingMd,
    marginTop: SIZES.paddingMd,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.paddingMd,
    paddingHorizontal: SIZES.paddingLg,
    gap: SIZES.paddingSm,
    minHeight: SIZES.touchableMin,
    minWidth: 140,
  },
  actionButtonText: {
    fontSize: FONTS.sizeMd,
    fontWeight: FONTS.weightBold,
    color: COLORS.textWhite,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.paddingMd,
    paddingHorizontal: SIZES.paddingXl,
    gap: SIZES.paddingSm,
    borderWidth: 2,
    backgroundColor: COLORS.backgroundCard,
    minHeight: SIZES.touchableMin,
    marginTop: SIZES.paddingSm,
  },
  retryButtonText: {
    fontSize: FONTS.sizeMd,
    fontWeight: FONTS.weightBold,
  },
  errorText: {
    fontSize: FONTS.sizeMd,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 100,
  },
});
