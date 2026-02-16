// Mini Oyun Ekrani - Oyun tiplerine gore dogru componenti yukle
import { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS, SIZES, FONTS, SHADOW } from '@/src/constants/theme';
import { BalloonGame } from '@/src/components/game/BalloonGame';
import { MemoryGame } from '@/src/components/game/MemoryGame';
import { MissingLetterGame } from '@/src/components/game/MissingLetterGame';
import { TrainGame } from '@/src/components/game/TrainGame';
import { SoundGame } from '@/src/components/game/SoundGame';
import { ColoringGame } from '@/src/components/game/ColoringGame';
import { ConfettiAnimation } from '@/src/components/feedback/ConfettiAnimation';
import { useProgressStore } from '@/src/stores/progressStore';

const GAME_TITLES: Record<string, string> = {
  balloon: 'Harf Balonu',
  memory: 'Hafıza Kartları',
  missing: 'Eksik Harf',
  train: 'Harf Treni',
  sound: 'Ses Avcısı',
  coloring: 'Harf Boyama',
};

type GameState = 'playing' | 'result';

export default function GameScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const recordGameScore = useProgressStore((s) => s.recordGameScore);

  const [gameState, setGameState] = useState<GameState>('playing');
  const [finalScore, setFinalScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [startTime] = useState(Date.now());

  const title = GAME_TITLES[type ?? ''] ?? 'Oyun';

  const handleGameEnd = useCallback(
    (score: number, total: number) => {
      setFinalScore(score);
      setTotalScore(total);

      const duration = Math.round((Date.now() - startTime) / 1000);
      recordGameScore(type ?? '', score, duration);

      setGameState('result');
    },
    [type, startTime, recordGameScore]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + SIZES.paddingMd }]}>
      <ConfettiAnimation visible={gameState === 'result' && finalScore > 0} />

      {/* Ust bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Geri" accessibilityRole="button">
          <FontAwesome name="arrow-left" size={SIZES.iconMd} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Oyun alani */}
      {gameState === 'playing' && (
        <>
          {type === 'balloon' && <BalloonGame onGameEnd={handleGameEnd} />}
          {type === 'memory' && <MemoryGame onGameEnd={handleGameEnd} />}
          {type === 'missing' && <MissingLetterGame onGameEnd={handleGameEnd} />}
          {type === 'train' && <TrainGame onGameEnd={handleGameEnd} />}
          {type === 'sound' && <SoundGame onGameEnd={handleGameEnd} />}
          {type === 'coloring' && <ColoringGame onGameEnd={handleGameEnd} />}
        </>
      )}

      {/* Sonuc ekrani */}
      {gameState === 'result' && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle} accessibilityLiveRegion="polite">
            {totalScore > 0 && finalScore / totalScore >= 0.7 ? 'Harika!' : totalScore > 0 && finalScore / totalScore >= 0.5 ? 'İyi!' : 'Devam et!'}
          </Text>

          <Text style={styles.resultScore}>
            {finalScore} / {totalScore}
          </Text>

          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
              onPress={() => {
                setGameState('playing');
                setFinalScore(0);
                setTotalScore(0);
              }}
              accessibilityLabel="Tekrar oyna"
              accessibilityRole="button"
            >
              <FontAwesome name="repeat" size={SIZES.iconSm} color={COLORS.textWhite} />
              <Text style={styles.actionButtonText}>Tekrar Oyna</Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, { backgroundColor: COLORS.success }]}
              onPress={() => router.back()}
              accessibilityLabel="Tamam"
              accessibilityRole="button"
            >
              <FontAwesome name="check" size={SIZES.iconSm} color={COLORS.textWhite} />
              <Text style={styles.actionButtonText}>Tamam</Text>
            </Pressable>
          </View>
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
    marginBottom: SIZES.paddingMd,
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
    color: COLORS.text,
  },
  placeholder: {
    width: SIZES.touchableMin,
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.paddingMd,
  },
  resultTitle: {
    fontSize: FONTS.sizeXl,
    fontFamily: FONTS.familyBlack,
    color: COLORS.text,
  },
  resultScore: {
    fontSize: FONTS.sizeXxl,
    fontFamily: FONTS.familyBold,
    color: COLORS.textLight,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SIZES.paddingMd,
    marginTop: SIZES.paddingLg,
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
    fontFamily: FONTS.familyBold,
    color: COLORS.textWhite,
  },
});
