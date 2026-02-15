// Hafiza Kartlari - Harf-kelime eslestirme hafiza oyunu
// 12 kart (6 cift), her cift: harf + emoji

import { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, SIZES, FONTS, SHADOW } from '../../constants/theme';
import { ALPHABET, Letter } from '../../data/alphabet';
import { useProgressStore } from '../../stores/progressStore';

const PAIRS = 6;
const COLS = 3;

interface MemoryGameProps {
  onGameEnd: (score: number, total: number) => void;
}

interface Card {
  id: string;
  letterId: string;
  display: string;
  color: string;
}

function getGameCards(): Card[] {
  const progress = useProgressStore.getState().letterProgress;
  const unlocked = ALPHABET.filter((l) => progress[l.id]?.unlocked);
  const shuffled = unlocked.sort(() => Math.random() - 0.5);
  // En az PAIRS kadar harf yoksa olanlari kullan
  const selected = shuffled.slice(0, Math.min(PAIRS, shuffled.length));

  const cards: Card[] = [];
  selected.forEach((letter, i) => {
    // Ayni harften 2 kart (ikiz cift)
    cards.push({
      id: `${letter.id}-a`,
      letterId: letter.id,
      display: letter.uppercase,
      color: letter.color,
    });
    cards.push({
      id: `${letter.id}-b`,
      letterId: letter.id,
      display: letter.uppercase,
      color: letter.color,
    });
  });

  return cards.sort(() => Math.random() - 0.5);
}

interface MemoryCardProps {
  card: Card;
  faceUp: boolean;
  matched: boolean;
  onFlip: () => void;
}

function MemoryCard({ card, faceUp, matched, onFlip }: MemoryCardProps) {
  return (
    <Pressable
      style={[
        styles.card,
        SHADOW.small,
        faceUp && { borderColor: card.color },
        matched && styles.cardMatched,
      ]}
      onPress={onFlip}
      disabled={faceUp || matched}
    >
      {faceUp || matched ? (
        <Text style={[styles.cardContent, { color: card.color }]}>
          {card.display}
        </Text>
      ) : (
        <Text style={styles.cardBack}>?</Text>
      )}
    </Pressable>
  );
}

export function MemoryGame({ onGameEnd }: MemoryGameProps) {
  const cards = useMemo(() => getGameCards(), []);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const handleFlip = useCallback(
    (index: number) => {
      if (locked || flipped.includes(index)) return;

      const newFlipped = [...flipped, index];
      setFlipped(newFlipped);

      if (newFlipped.length === 2) {
        setMoves((prev) => prev + 1);
        setLocked(true);

        const card1 = cards[newFlipped[0]];
        const card2 = cards[newFlipped[1]];

        if (card1.letterId === card2.letterId) {
          // Eslesti
          const newMatched = new Set(matched);
          newMatched.add(card1.id);
          newMatched.add(card2.id);
          setMatched(newMatched);
          setFlipped([]);
          setLocked(false);

          // Tum kartlar eslestirildi mi
          if (newMatched.size === cards.length) {
            setTimeout(() => {
              const score = Math.max(0, 100 - (moves * 5));
              onGameEnd(score, 100);
            }, 500);
          }
        } else {
          // Eslesmedi, geri cevir
          setTimeout(() => {
            setFlipped([]);
            setLocked(false);
          }, 800);
        }
      }
    },
    [flipped, matched, locked, cards, moves, onGameEnd]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.movesText}>Hamle: {moves}</Text>
        <Text style={styles.pairsText}>
          {matched.size / 2}/{PAIRS} eslesme
        </Text>
      </View>

      <View style={styles.grid}>
        {cards.map((card, i) => (
          <MemoryCard
            key={card.id}
            card={card}
            faceUp={flipped.includes(i)}
            matched={matched.has(card.id)}
            onFlip={() => handleFlip(i)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: SIZES.paddingMd,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.paddingSm,
  },
  movesText: {
    fontSize: FONTS.sizeMd,
    fontWeight: FONTS.weightBold,
    color: COLORS.text,
  },
  pairsText: {
    fontSize: FONTS.sizeMd,
    fontWeight: FONTS.weightBold,
    color: COLORS.success,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SIZES.paddingSm,
  },
  card: {
    width: '28%',
    aspectRatio: 1,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.border,
  },
  cardMatched: {
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.success,
    opacity: 0.7,
  },
  cardContent: {
    fontSize: FONTS.sizeXl,
    fontWeight: FONTS.weightBlack,
    color: COLORS.text,
  },
  cardBack: {
    fontSize: FONTS.sizeXl,
    fontWeight: FONTS.weightBlack,
    color: COLORS.border,
  },
});
