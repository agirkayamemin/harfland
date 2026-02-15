// Harf Listesi - 29 harfin grid gorunumu
import { StyleSheet, View, Text, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS, SIZES, FONTS, SHADOW } from '@/src/constants/theme';
import { ALPHABET, Letter } from '@/src/data/alphabet';
import { useLetterProgress } from '@/src/hooks/useLetterProgress';

function LetterGridItem({ letter }: { letter: Letter }) {
  const router = useRouter();
  const { isLetterUnlocked, getLetterStage } = useLetterProgress();

  const unlocked = isLetterUnlocked(letter.id);
  const stage = getLetterStage(letter.id);
  const completed = stage === 4;

  return (
    <Pressable
      style={[
        styles.letterCard,
        SHADOW.small,
        !unlocked && styles.letterCardLocked,
        completed && styles.letterCardCompleted,
        { borderColor: unlocked ? letter.color : COLORS.locked },
      ]}
      onPress={() => {
        if (unlocked) {
          router.push(`/letter/${letter.id}`);
        }
      }}
      disabled={!unlocked}
    >
      <Text
        style={[
          styles.letterText,
          { color: unlocked ? letter.color : COLORS.locked },
        ]}
      >
        {letter.uppercase}
      </Text>

      {/* Tamamlandi ikonu */}
      {completed && (
        <FontAwesome name="check-circle" size={14} color={COLORS.success} style={styles.checkIcon} />
      )}

      {/* Kilit ikonu */}
      {!unlocked && (
        <FontAwesome name="lock" size={12} color={COLORS.locked} style={styles.lockIcon} />
      )}
    </Pressable>
  );
}

export default function LettersScreen() {
  const insets = useSafeAreaInsets();
  const { unlockedCount } = useLetterProgress();

  // Pedagojik siraya gore sirala
  const sortedAlphabet = [...ALPHABET].sort((a, b) => a.order - b.order);

  return (
    <View style={[styles.container, { paddingTop: insets.top + SIZES.paddingMd }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Harfler</Text>
        <Text style={styles.subtitle}>{unlockedCount}/29 harf açık</Text>
      </View>

      <FlatList
        data={sortedAlphabet}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => <LetterGridItem letter={item} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.paddingMd,
  },
  header: {
    paddingHorizontal: SIZES.paddingSm,
    marginBottom: SIZES.paddingMd,
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
  grid: {
    paddingBottom: SIZES.paddingXl,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: SIZES.paddingSm,
  },
  letterCard: {
    flex: 1,
    maxWidth: '31%',
    aspectRatio: 1,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  letterCardLocked: {
    backgroundColor: COLORS.backgroundDark,
    opacity: 0.6,
  },
  letterText: {
    fontSize: FONTS.sizeXl,
    fontWeight: FONTS.weightBlack,
  },
  letterCardCompleted: {
    backgroundColor: '#F0FFF4',
  },
  checkIcon: {
    position: 'absolute',
    bottom: 6,
  },
  lockIcon: {
    position: 'absolute',
    bottom: 6,
  },
});
