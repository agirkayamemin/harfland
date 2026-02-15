// Profil - Cocuk avatari, yildizlar, ilerleme, ebeveyn ayarlari
import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS, SIZES, FONTS, SHADOW, GROUP_COLORS, MASCOTS, MascotId } from '@/src/constants/theme';
import { useProgressStore } from '@/src/stores/progressStore';
import { useSettingsStore, DifficultyMode } from '@/src/stores/settingsStore';
import { useLetterProgress } from '@/src/hooks/useLetterProgress';
import { TOTAL_GROUPS } from '@/src/data/alphabet';
import { ParentGateModal } from '@/src/components/ui/ParentGateModal';

// Basit ilerleme cubugu componenti
function ProgressBar({ progress, color }: { progress: number; color: string }) {
  return (
    <View style={styles.progressBarBg}>
      <View
        style={[
          styles.progressBarFill,
          { width: `${Math.min(100, progress)}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

const DIFFICULTY_OPTIONS: { value: DifficultyMode; label: string }[] = [
  { value: 'auto', label: 'Otomatik' },
  { value: 'easy', label: 'Kolay' },
  { value: 'hard', label: 'Zor' },
];

const REMINDER_MINUTES = [10, 15, 20, 25, 30];

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useProgressStore((s) => s.profile);
  const resetAllProgress = useProgressStore((s) => s.resetAllProgress);
  const { overallProgress, completedCount, unlockedCount } = useLetterProgress();

  // Settings store
  const parentGateUnlocked = useSettingsStore((s) => s.parentGateUnlocked);
  const unlockParentGate = useSettingsStore((s) => s.unlockParentGate);
  const lockParentGate = useSettingsStore((s) => s.lockParentGate);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const toggleSound = useSettingsStore((s) => s.toggleSound);
  const musicEnabled = useSettingsStore((s) => s.musicEnabled);
  const toggleMusic = useSettingsStore((s) => s.toggleMusic);
  const soundVolume = useSettingsStore((s) => s.soundVolume);
  const setSoundVolume = useSettingsStore((s) => s.setSoundVolume);
  const difficulty = useSettingsStore((s) => s.difficulty);
  const setDifficulty = useSettingsStore((s) => s.setDifficulty);
  const sessionReminderEnabled = useSettingsStore((s) => s.sessionReminderEnabled);
  const toggleSessionReminder = useSettingsStore((s) => s.toggleSessionReminder);
  const sessionReminderMinutes = useSettingsStore((s) => s.sessionReminderMinutes);
  const setSessionReminderMinutes = useSettingsStore((s) => s.setSessionReminderMinutes);

  // Parent gate modal state
  const [showParentGate, setShowParentGate] = useState(false);

  const displayName = profile?.name ?? 'Minik';
  const avatarKey = (profile?.avatar ?? 'owl') as MascotId;
  const mascot = MASCOTS[avatarKey] ?? MASCOTS.owl;

  const volumePercent = Math.round(soundVolume * 100);

  const handleParentGate = () => {
    if (parentGateUnlocked) {
      lockParentGate();
      return;
    }
    setShowParentGate(true);
  };

  const handleParentGateSuccess = () => {
    setShowParentGate(false);
    unlockParentGate();
  };

  const handleParentGateCancel = () => {
    setShowParentGate(false);
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Ilerlemeyi Sifirla',
      'Tum harf ilerlemesi, oyun skorlari ve yildizlar sifirlanacak. Profil bilgileri korunacak.\n\nBu islem geri alinamaz!',
      [
        { text: 'Iptal', style: 'cancel' },
        {
          text: 'Sifirla',
          style: 'destructive',
          onPress: () => resetAllProgress(),
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + SIZES.paddingMd }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profil basligi */}
      <View style={styles.profileHeader}>
        <View style={[styles.avatarCircle, SHADOW.medium, { borderColor: mascot.color }]}>
          <Text style={styles.avatarEmoji}>{mascot.emoji}</Text>
        </View>
        <Text style={styles.profileName}>{displayName}</Text>
      </View>

      {/* Genel ilerleme */}
      <View style={[styles.card, SHADOW.small]}>
        <Text style={styles.cardTitle}>Genel Ilerleme</Text>
        <ProgressBar progress={overallProgress} color={COLORS.primary} />
        <View style={styles.statsRow}>
          <Text style={styles.statText}>{completedCount} tamamlandi</Text>
          <Text style={styles.statText}>{unlockedCount} acik</Text>
          <Text style={styles.statText}>%{overallProgress}</Text>
        </View>
      </View>

      {/* Grup bazli ilerleme */}
      <View style={[styles.card, SHADOW.small]}>
        <Text style={styles.cardTitle}>Grup Ilerlemesi</Text>
        {Array.from({ length: TOTAL_GROUPS }).map((_, i) => {
          const groupNum = i + 1;
          const color = GROUP_COLORS[groupNum as keyof typeof GROUP_COLORS];
          const groupNames = [
            '', 'Kolay Sesli', 'Kolay Sessiz', 'Sesli Devam', 'Sessiz Devam',
            'Yeni Sesli', 'Orta Sessiz', 'Ileri Sessiz', 'Zor Harfler',
          ];
          return (
            <View key={groupNum} style={styles.groupRow}>
              <Text style={[styles.groupLabel, { color }]}>
                {groupNum}. {groupNames[groupNum]}
              </Text>
              <ProgressBar progress={groupNum <= 1 ? 30 : 0} color={color} />
            </View>
          );
        })}
      </View>

      {/* Ayarlar */}
      <View style={[styles.card, SHADOW.small]}>
        <Pressable style={styles.settingsButton} onPress={handleParentGate}>
          <FontAwesome
            name={parentGateUnlocked ? 'unlock' : 'lock'}
            size={SIZES.iconSm}
            color={COLORS.textLight}
          />
          <Text style={styles.settingsButtonText}>
            {parentGateUnlocked ? 'Ayarlari Kilitle' : 'Ebeveyn Ayarlari'}
          </Text>
        </Pressable>

        {parentGateUnlocked && (
          <View style={styles.settingsContent}>
            {/* ── Profil ── */}
            <View style={styles.settingSeparator} />
            <Text style={styles.sectionLabel}>Profil</Text>

            <Pressable
              style={styles.settingRow}
              onPress={() => router.push('/onboarding?edit=1')}
            >
              <FontAwesome name="pencil" size={SIZES.iconSm} color={COLORS.text} />
              <Text style={styles.settingLabel}>Profil Duzenle</Text>
              <FontAwesome name="chevron-right" size={SIZES.iconSm} color={COLORS.locked} />
            </Pressable>

            {/* ── Ses Ayarlari ── */}
            <View style={styles.settingSeparator} />
            <Text style={styles.sectionLabel}>Ses Ayarlari</Text>

            <Pressable style={styles.settingRow} onPress={toggleSound}>
              <FontAwesome
                name={soundEnabled ? 'volume-up' : 'volume-off'}
                size={SIZES.iconSm}
                color={COLORS.text}
              />
              <Text style={styles.settingLabel}>Sesler</Text>
              <Text style={[styles.settingValue, { color: soundEnabled ? COLORS.success : COLORS.locked }]}>
                {soundEnabled ? 'Acik' : 'Kapali'}
              </Text>
            </Pressable>

            <Pressable style={styles.settingRow} onPress={toggleMusic}>
              <FontAwesome
                name="music"
                size={SIZES.iconSm}
                color={COLORS.text}
              />
              <Text style={styles.settingLabel}>Muzik</Text>
              <Text style={[styles.settingValue, { color: musicEnabled ? COLORS.success : COLORS.locked }]}>
                {musicEnabled ? 'Acik' : 'Kapali'}
              </Text>
            </Pressable>

            {/* Ses Seviyesi Stepper */}
            <View style={styles.volumeRow}>
              <FontAwesome name="volume-down" size={SIZES.iconSm} color={COLORS.text} />
              <Text style={styles.settingLabel}>Ses Seviyesi</Text>
              <Pressable
                style={styles.volumeButton}
                onPress={() => setSoundVolume(soundVolume - 0.1)}
                disabled={soundVolume <= 0.1}
              >
                <Text style={[styles.volumeButtonText, soundVolume <= 0.1 && styles.volumeButtonDisabled]}>-</Text>
              </Pressable>
              <Text style={styles.volumeText}>{volumePercent}%</Text>
              <Pressable
                style={styles.volumeButton}
                onPress={() => setSoundVolume(soundVolume + 0.1)}
                disabled={soundVolume >= 1}
              >
                <Text style={[styles.volumeButtonText, soundVolume >= 1 && styles.volumeButtonDisabled]}>+</Text>
              </Pressable>
            </View>

            {/* ── Zorluk ── */}
            <View style={styles.settingSeparator} />
            <Text style={styles.sectionLabel}>Zorluk</Text>

            <View style={styles.pillContainer}>
              {DIFFICULTY_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={[styles.pill, difficulty === opt.value && styles.pillSelected]}
                  onPress={() => setDifficulty(opt.value)}
                >
                  <Text style={[styles.pillText, difficulty === opt.value && styles.pillTextSelected]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.settingDescription}>
              {difficulty === 'auto'
                ? 'Cocugun performansina gore otomatik ayarlanir'
                : difficulty === 'easy'
                  ? 'Daha fazla ipucu ve daha genis tolerans'
                  : 'Daha az ipucu ve daha dar tolerans'}
            </Text>

            {/* ── Mola Hatirlatici ── */}
            <View style={styles.settingSeparator} />
            <Text style={styles.sectionLabel}>Mola Hatirlatici</Text>

            <Pressable style={styles.settingRow} onPress={toggleSessionReminder}>
              <FontAwesome name="clock-o" size={SIZES.iconSm} color={COLORS.text} />
              <Text style={styles.settingLabel}>Mola Hatirlatici</Text>
              <Text style={[styles.settingValue, { color: sessionReminderEnabled ? COLORS.success : COLORS.locked }]}>
                {sessionReminderEnabled ? 'Acik' : 'Kapali'}
              </Text>
            </Pressable>

            {sessionReminderEnabled && (
              <View style={styles.pillContainer}>
                {REMINDER_MINUTES.map((min) => (
                  <Pressable
                    key={min}
                    style={[styles.pill, sessionReminderMinutes === min && styles.pillSelected]}
                    onPress={() => setSessionReminderMinutes(min)}
                  >
                    <Text style={[styles.pillText, sessionReminderMinutes === min && styles.pillTextSelected]}>
                      {min} dk
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* ── Tehlikeli Alan ── */}
            <View style={styles.settingSeparator} />
            <Pressable style={styles.resetButton} onPress={handleResetProgress}>
              <FontAwesome name="refresh" size={SIZES.iconSm} color={COLORS.textWhite} />
              <Text style={styles.resetButtonText}>Ilerlemeyi Sifirla</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={{ height: SIZES.paddingXl * 2 }} />

      {/* Parent Gate Modal */}
      <ParentGateModal
        visible={showParentGate}
        onSuccess={handleParentGateSuccess}
        onCancel={handleParentGateCancel}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.paddingLg,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: SIZES.paddingLg,
    gap: SIZES.paddingSm,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  profileName: {
    fontSize: FONTS.sizeXl,
    fontWeight: FONTS.weightBold,
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.paddingLg,
    marginBottom: SIZES.paddingMd,
  },
  cardTitle: {
    fontSize: FONTS.sizeMd,
    fontWeight: FONTS.weightBold,
    color: COLORS.text,
    marginBottom: SIZES.paddingMd,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.paddingSm,
  },
  statText: {
    fontSize: FONTS.sizeSm,
    color: COLORS.textLight,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  groupRow: {
    marginBottom: SIZES.paddingSm,
    gap: SIZES.paddingXs,
  },
  groupLabel: {
    fontSize: FONTS.sizeSm,
    fontWeight: FONTS.weightMedium,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.paddingSm,
    minHeight: SIZES.touchableMin,
  },
  settingsButtonText: {
    fontSize: FONTS.sizeMd,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textLight,
  },
  settingsContent: {
    marginTop: SIZES.paddingSm,
    gap: SIZES.paddingSm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.paddingMd,
    minHeight: SIZES.touchableMin,
    paddingVertical: SIZES.paddingSm,
  },
  settingLabel: {
    flex: 1,
    fontSize: FONTS.sizeMd,
    color: COLORS.text,
  },
  settingValue: {
    fontSize: FONTS.sizeSm,
    fontWeight: FONTS.weightMedium,
  },
  // Section separator & label
  settingSeparator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.paddingSm,
  },
  sectionLabel: {
    fontSize: FONTS.sizeSm,
    fontWeight: FONTS.weightBold,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Pill buttons
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.paddingSm,
  },
  pill: {
    paddingVertical: SIZES.paddingSm,
    paddingHorizontal: SIZES.paddingMd,
    borderRadius: SIZES.radiusRound,
    backgroundColor: COLORS.backgroundDark,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillSelected: {
    backgroundColor: COLORS.primary,
  },
  pillText: {
    fontSize: FONTS.sizeSm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.text,
  },
  pillTextSelected: {
    color: COLORS.textWhite,
    fontWeight: FONTS.weightBold,
  },
  // Volume stepper
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.paddingMd,
    minHeight: SIZES.touchableMin,
    paddingVertical: SIZES.paddingSm,
  },
  volumeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeButtonText: {
    fontSize: FONTS.sizeLg,
    fontWeight: FONTS.weightBold,
    color: COLORS.text,
  },
  volumeButtonDisabled: {
    color: COLORS.locked,
  },
  volumeText: {
    fontSize: FONTS.sizeMd,
    fontWeight: FONTS.weightBold,
    color: COLORS.text,
    minWidth: 50,
    textAlign: 'center',
  },
  // Difficulty description
  settingDescription: {
    fontSize: FONTS.sizeXs,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  // Reset button
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.paddingSm,
    backgroundColor: COLORS.warning,
    borderRadius: SIZES.radiusMd,
    minHeight: SIZES.touchableMin,
    paddingVertical: SIZES.paddingMd,
    marginTop: SIZES.paddingSm,
  },
  resetButtonText: {
    fontSize: FONTS.sizeMd,
    fontWeight: FONTS.weightBold,
    color: COLORS.textWhite,
  },
});
