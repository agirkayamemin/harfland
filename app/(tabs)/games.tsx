// Oyunlar - Mini oyun listesi
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS, SIZES, FONTS, SHADOW } from '@/src/constants/theme';
import { useLetterProgress } from '@/src/hooks/useLetterProgress';

interface GameInfo {
  type: string;
  title: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  description: string;
  minUnlockedLetters: number; // Oyunun acilmasi icin gereken minimum acik harf
}

const GAMES: GameInfo[] = [
  {
    type: 'balloon',
    title: 'Harf Balonu',
    icon: 'certificate',
    color: '#FF6B6B',
    description: 'Söylenen harfi patla!',
    minUnlockedLetters: 3,
  },
  {
    type: 'memory',
    title: 'Hafıza Kartları',
    icon: 'th-large',
    color: '#4ECDC4',
    description: 'Harf ve resmi eşleştir',
    minUnlockedLetters: 4,
  },
  {
    type: 'missing',
    title: 'Eksik Harf',
    icon: 'puzzle-piece',
    color: '#45B7D1',
    description: 'Kelimeye doğru harfi koy',
    minUnlockedLetters: 6,
  },
  {
    type: 'train',
    title: 'Harf Treni',
    icon: 'train',
    color: '#96CEB4',
    description: 'Harfleri sırala, kelime yap',
    minUnlockedLetters: 6,
  },
  {
    type: 'sound',
    title: 'Ses Avcısı',
    icon: 'music',
    color: '#DDA0DD',
    description: 'Sese uygun resmi bul',
    minUnlockedLetters: 5,
  },
];

function GameCard({ game, unlocked }: { game: GameInfo; unlocked: boolean }) {
  const router = useRouter();

  return (
    <Pressable
      style={[
        styles.gameCard,
        SHADOW.small,
        !unlocked && styles.gameCardLocked,
      ]}
      onPress={() => {
        if (unlocked) {
          router.push(`/game/${game.type}`);
        }
      }}
      disabled={!unlocked}
    >
      <View style={[styles.gameIconContainer, { backgroundColor: unlocked ? game.color : COLORS.locked }]}>
        <FontAwesome
          name={unlocked ? game.icon : 'lock'}
          size={SIZES.iconLg}
          color={COLORS.textWhite}
        />
      </View>
      <View style={styles.gameTextContainer}>
        <Text style={[styles.gameTitle, !unlocked && styles.gameTextLocked]}>
          {game.title}
        </Text>
        <Text style={[styles.gameDescription, !unlocked && styles.gameTextLocked]}>
          {unlocked ? game.description : `${game.minUnlockedLetters} harf öğren`}
        </Text>
      </View>
      <FontAwesome
        name="chevron-right"
        size={SIZES.iconSm}
        color={unlocked ? COLORS.textLight : COLORS.locked}
      />
    </Pressable>
  );
}

export default function GamesScreen() {
  const insets = useSafeAreaInsets();
  const { unlockedCount } = useLetterProgress();

  return (
    <View style={[styles.container, { paddingTop: insets.top + SIZES.paddingMd }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Oyunlar</Text>
        <Text style={styles.subtitle}>Oynayarak öğren!</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {GAMES.map((game) => (
          <GameCard
            key={game.type}
            game={game}
            unlocked={unlockedCount >= game.minUnlockedLetters}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.paddingLg,
  },
  header: {
    marginBottom: SIZES.paddingLg,
  },
  title: {
    fontSize: FONTS.sizeXl,
    fontWeight: FONTS.weightBold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONTS.sizeSm,
    color: COLORS.textLight,
  },
  list: {
    gap: SIZES.paddingMd,
    paddingBottom: SIZES.paddingXl,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.paddingMd,
    gap: SIZES.paddingMd,
    minHeight: SIZES.touchableLarge,
  },
  gameCardLocked: {
    opacity: 0.5,
  },
  gameIconContainer: {
    width: SIZES.touchableMin,
    height: SIZES.touchableMin,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameTextContainer: {
    flex: 1,
    gap: SIZES.paddingXs,
  },
  gameTitle: {
    fontSize: FONTS.sizeMd,
    fontWeight: FONTS.weightBold,
    color: COLORS.text,
  },
  gameDescription: {
    fontSize: FONTS.sizeSm,
    color: COLORS.textLight,
  },
  gameTextLocked: {
    color: COLORS.locked,
  },
});
