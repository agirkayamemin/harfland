// Ekran Suresi Hatirlaticisi - Ayarlanabilir sure ile mola uyarisi
// Root layout'a eklenir, tum ekranlarda aktif calisir

import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Pressable, Modal } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import { useSettingsStore } from '../../stores/settingsStore';

export function SessionTimer() {
  const [showReminder, setShowReminder] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionReminderEnabled = useSettingsStore((s) => s.sessionReminderEnabled);
  const sessionReminderMinutes = useSettingsStore((s) => s.sessionReminderMinutes);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setShowReminder(true);
    }, sessionReminderMinutes * 60 * 1000);
  };

  useEffect(() => {
    if (sessionReminderEnabled) {
      startTimer();
    } else {
      clearTimer();
      setShowReminder(false);
    }
    return clearTimer;
  }, [sessionReminderEnabled, sessionReminderMinutes]);

  const handleDismiss = () => {
    setShowReminder(false);
    if (sessionReminderEnabled) {
      startTimer();
    }
  };

  if (!showReminder) return null;

  return (
    <Modal transparent visible={showReminder} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card} accessibilityViewIsModal={true}>
          <Text style={styles.emoji}>😴</Text>
          <Text style={styles.title}>Mola Zamani!</Text>
          <Text style={styles.message}>
            {sessionReminderMinutes} dakikadir oynuyorsun.{'\n'}Biraz dinlenmeye ne dersin?
          </Text>

          <Pressable style={styles.button} onPress={handleDismiss} accessibilityLabel="Devam et" accessibilityRole="button">
            <FontAwesome name="play" size={SIZES.iconSm} color={COLORS.textWhite} />
            <Text style={styles.buttonText}>Devam Et</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.paddingXl,
  },
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingXl,
    alignItems: 'center',
    gap: SIZES.paddingMd,
    width: '100%',
    maxWidth: 320,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: FONTS.sizeXl,
    fontFamily: FONTS.familyBlack,
    color: COLORS.primaryText,
  },
  message: {
    fontSize: FONTS.sizeMd,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.paddingMd,
    paddingHorizontal: SIZES.paddingXl,
    gap: SIZES.paddingSm,
    minHeight: SIZES.touchableMin,
    marginTop: SIZES.paddingSm,
  },
  buttonText: {
    fontSize: FONTS.sizeMd,
    fontFamily: FONTS.familyBold,
    color: COLORS.textWhite,
  },
});
