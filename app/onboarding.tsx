// Onboarding - Cocugun adini ve maskotunu sec
import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLORS, SIZES, FONTS, SHADOW, MASCOTS, MascotId } from '@/src/constants/theme';
import { useProgressStore } from '@/src/stores/progressStore';

const MASCOT_OPTIONS: MascotId[] = ['owl', 'cat', 'dog', 'panda', 'monkey'];

function MascotCard({
  id,
  selected,
  onSelect,
}: {
  id: MascotId;
  selected: boolean;
  onSelect: () => void;
}) {
  const mascot = MASCOTS[id];

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(selected ? 1.1 : 1, { damping: 12 }) }],
  }));

  return (
    <Pressable onPress={onSelect}>
      <Animated.View
        style={[
          styles.mascotCard,
          SHADOW.small,
          selected && { borderColor: mascot.color, borderWidth: 3, backgroundColor: mascot.color + '15' },
          animStyle,
        ]}
      >
        <Text style={styles.mascotEmoji}>{mascot.emoji}</Text>
        <Text style={[styles.mascotName, selected && { color: mascot.color, fontWeight: FONTS.weightBold }]}>
          {mascot.name}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEditMode = edit === '1';
  const profile = useProgressStore((s) => s.profile);
  const createProfile = useProgressStore((s) => s.createProfile);
  const updateProfile = useProgressStore((s) => s.updateProfile);

  const [name, setName] = useState(isEditMode && profile ? profile.name : '');
  const [selectedMascot, setSelectedMascot] = useState<MascotId>(
    isEditMode && profile ? (profile.avatar as MascotId) : 'owl'
  );

  const mascot = MASCOTS[selectedMascot];
  const canStart = name.trim().length > 0;

  const handleStart = () => {
    if (!canStart) return;
    if (isEditMode) {
      updateProfile(name.trim(), selectedMascot);
      router.back();
    } else {
      createProfile(name.trim(), selectedMascot);
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top + SIZES.paddingLg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Geri butonu (edit modunda) */}
        {isEditMode && (
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={SIZES.iconMd} color={COLORS.text} />
          </Pressable>
        )}

        {/* Maskot ve karsilama */}
        {!isEditMode && <Text style={styles.mascotBig}>{mascot.emoji}</Text>}
        <Text style={[styles.welcome, { color: isEditMode ? COLORS.text : mascot.color }]}>
          {isEditMode ? 'Profili Düzenle' : 'Merhaba!'}
        </Text>
        {!isEditMode && (
          <Text style={styles.subtitle}>Ben {mascot.name}, senin öğrenme arkadaşınım!</Text>
        )}

        {/* Isim girisi */}
        <Text style={styles.question}>Senin adin ne?</Text>
        <TextInput
          style={[styles.input, SHADOW.small]}
          placeholder="Adını yaz..."
          placeholderTextColor={COLORS.textLight}
          value={name}
          onChangeText={setName}
          maxLength={20}
          autoFocus={!isEditMode}
          returnKeyType="done"
          onSubmitEditing={handleStart}
        />

        {/* Maskot secimi */}
        <Text style={styles.question}>Arkadaşını seç!</Text>
        <View style={styles.mascotGrid}>
          {MASCOT_OPTIONS.map((id) => (
            <MascotCard
              key={id}
              id={id}
              selected={selectedMascot === id}
              onSelect={() => setSelectedMascot(id)}
            />
          ))}
        </View>

        {/* Baslat butonu */}
        <Pressable
          style={[
            styles.startButton,
            SHADOW.medium,
            { backgroundColor: mascot.color },
            !canStart && styles.startButtonDisabled,
          ]}
          onPress={handleStart}
          disabled={!canStart}
        >
          <Text style={styles.startButtonText}>{isEditMode ? 'Kaydet' : 'Başla!'}</Text>
          <FontAwesome name="arrow-right" size={SIZES.iconSm} color={COLORS.textWhite} />
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.paddingLg,
  },
  backButton: {
    alignSelf: 'flex-start',
    width: SIZES.touchableMin,
    height: SIZES.touchableMin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: SIZES.paddingXl * 2,
    gap: SIZES.paddingMd,
  },
  mascotBig: {
    fontSize: 80,
    marginTop: SIZES.paddingLg,
  },
  welcome: {
    fontSize: FONTS.sizeXxl,
    fontWeight: FONTS.weightBlack,
  },
  subtitle: {
    fontSize: FONTS.sizeMd,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SIZES.paddingSm,
  },
  question: {
    fontSize: FONTS.sizeLg,
    fontWeight: FONTS.weightBold,
    color: COLORS.text,
    marginTop: SIZES.paddingSm,
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.paddingMd,
    paddingHorizontal: SIZES.paddingLg,
    fontSize: FONTS.sizeLg,
    fontWeight: FONTS.weightMedium,
    color: COLORS.text,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    minHeight: SIZES.touchableMin,
  },
  mascotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SIZES.paddingSm,
    width: '100%',
  },
  mascotCard: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.paddingMd,
    paddingHorizontal: SIZES.paddingSm,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: SIZES.paddingXs,
  },
  mascotEmoji: {
    fontSize: 40,
  },
  mascotName: {
    fontSize: FONTS.sizeSm,
    color: COLORS.textLight,
    fontWeight: FONTS.weightMedium,
  },
  startButton: {
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
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    fontSize: FONTS.sizeLg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textWhite,
  },
});
