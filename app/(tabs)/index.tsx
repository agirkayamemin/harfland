// Ana Sayfa - Karsilama, bugunun harfi, ilerleme, baslama butonu
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS, SIZES, FONTS, SHADOW, MASCOTS, MascotId } from '@/src/constants/theme';
import { useProgressStore } from '@/src/stores/progressStore';
import { useLetterProgress } from '@/src/hooks/useLetterProgress';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useProgressStore((s) => s.profile);
  const { nextLetterToLearn, lettersForReview, overallProgress, completedCount } =
    useLetterProgress();

  const displayName = profile?.name ?? 'Küçük Öğrenci';
  const avatarKey = (profile?.avatar ?? 'owl') as MascotId;
  const mascot = MASCOTS[avatarKey] ?? MASCOTS.owl;

  return (
    <View style={[styles.container, { paddingTop: insets.top + SIZES.paddingLg }]}>
      {/* Karsilama */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Merhaba,</Text>
            <Text style={styles.name}>{displayName}!</Text>
          </View>
          <Pressable onPress={() => router.push('/onboarding?edit=1')}>
            <Text style={styles.headerMascot}>{mascot.emoji}</Text>
          </Pressable>
        </View>
      </View>

      {/* Ilerleme */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, SHADOW.small]}>
          <FontAwesome name="font" size={SIZES.iconLg} color={COLORS.primary} />
          <Text style={styles.statNumber}>{completedCount}/29</Text>
          <Text style={styles.statLabel}>Harf</Text>
        </View>
        <View style={[styles.statCard, SHADOW.small]}>
          <FontAwesome name="line-chart" size={SIZES.iconLg} color={COLORS.secondary} />
          <Text style={styles.statNumber}>%{overallProgress}</Text>
          <Text style={styles.statLabel}>İlerleme</Text>
        </View>
      </View>

      {/* Bugunun harfi */}
      {nextLetterToLearn && (
        <Pressable
          style={[styles.todayCard, SHADOW.medium, { borderLeftColor: nextLetterToLearn.color }]}
          onPress={() => router.push(`/letter/${nextLetterToLearn.id}`)}
        >
          <View style={styles.todayLeft}>
            <Text style={styles.todayLabel}>Bugünün Harfi</Text>
            <Text style={[styles.todayLetter, { color: nextLetterToLearn.color }]}>
              {nextLetterToLearn.uppercase}
            </Text>
          </View>
          <View style={styles.todayRight}>
            <Text style={styles.todayWord}>{nextLetterToLearn.exampleWord}</Text>
            <FontAwesome name="arrow-right" size={SIZES.iconSm} color={COLORS.textLight} />
          </View>
        </Pressable>
      )}

      {/* Tekrar hatirlatma */}
      {lettersForReview.length > 0 && (
        <Pressable
          style={[styles.reviewCard, SHADOW.small]}
          onPress={() => {
            const firstReview = lettersForReview[0];
            router.push(`/letter/${firstReview.id}`);
          }}
        >
          <FontAwesome name="refresh" size={SIZES.iconMd} color={COLORS.warning} />
          <View style={styles.reviewTextContainer}>
            <Text style={styles.reviewTitle}>Tekrar Zamanı!</Text>
            <Text style={styles.reviewSubtitle}>
              {lettersForReview.length} harf tekrar bekliyor
            </Text>
          </View>
          <FontAwesome name="chevron-right" size={SIZES.iconSm} color={COLORS.textLight} />
        </Pressable>
      )}

      {/* Ana buton */}
      <Pressable
        style={[styles.mainButton, SHADOW.medium]}
        onPress={() => {
          if (nextLetterToLearn) {
            router.push(`/letter/${nextLetterToLearn.id}`);
          } else {
            router.push('/(tabs)/letters');
          }
        }}
      >
        <FontAwesome name="play-circle" size={SIZES.iconXl} color={COLORS.textWhite} />
        <Text style={styles.mainButtonText}>Öğrenmeye Başla!</Text>
      </Pressable>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerMascot: {
    fontSize: 48,
  },
  greeting: {
    fontSize: FONTS.sizeLg,
    color: COLORS.textLight,
    fontWeight: FONTS.weightMedium,
  },
  name: {
    fontSize: FONTS.sizeXl,
    color: COLORS.text,
    fontWeight: FONTS.weightBold,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.paddingLg,
    gap: SIZES.paddingSm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.paddingMd,
    alignItems: 'center',
    gap: SIZES.paddingXs,
  },
  statNumber: {
    fontSize: FONTS.sizeLg,
    fontWeight: FONTS.weightBold,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONTS.sizeXs,
    color: COLORS.textLight,
  },
  todayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.paddingLg,
    marginBottom: SIZES.paddingMd,
    borderLeftWidth: 6,
    minHeight: SIZES.touchableDefault,
  },
  todayLeft: {
    gap: SIZES.paddingXs,
  },
  todayLabel: {
    fontSize: FONTS.sizeSm,
    color: COLORS.textLight,
  },
  todayLetter: {
    fontSize: FONTS.sizeXxl,
    fontWeight: FONTS.weightBlack,
  },
  todayRight: {
    alignItems: 'center',
    gap: SIZES.paddingSm,
  },
  todayWord: {
    fontSize: FONTS.sizeMd,
    color: COLORS.text,
    fontWeight: FONTS.weightMedium,
  },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.paddingMd,
    marginBottom: SIZES.paddingLg,
    gap: SIZES.paddingMd,
    minHeight: SIZES.touchableMin,
  },
  reviewTextContainer: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: FONTS.sizeMd,
    fontWeight: FONTS.weightBold,
    color: COLORS.text,
  },
  reviewSubtitle: {
    fontSize: FONTS.sizeSm,
    color: COLORS.textLight,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusLg,
    paddingVertical: SIZES.paddingLg,
    paddingHorizontal: SIZES.paddingXl,
    gap: SIZES.paddingMd,
    marginTop: 'auto',
    marginBottom: SIZES.paddingXl,
    minHeight: SIZES.touchableLarge,
  },
  mainButtonText: {
    fontSize: FONTS.sizeLg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textWhite,
  },
});
