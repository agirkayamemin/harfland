// Tesvik Mesaji - Dogru cevapta rastgele olumlu mesaj gosterir
// Yanlis cevapta nazik yonlendirme (ASLA "Yanlis!" deme)

import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const SUCCESS_MESSAGES = [
  'Harika!',
  'Çok güzel!',
  'Aferin!',
  'Süpersin!',
  'Mükemmel!',
  'Bravo!',
  'Çok iyi!',
  'Helal olsun!',
];

const ENCOURAGE_MESSAGES = [
  'Tekrar dene!',
  'Neredeyse oldu!',
  'Bir daha deneyelim!',
  'Sen yaparsın!',
  'Çok yaklaştın!',
];

interface EncouragementTextProps {
  type: 'success' | 'encourage';
  visible: boolean;
}

export function EncouragementText({ type, visible }: EncouragementTextProps) {
  const [message, setMessage] = useState('');
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      const messages = type === 'success' ? SUCCESS_MESSAGES : ENCOURAGE_MESSAGES;
      setMessage(messages[Math.floor(Math.random() * messages.length)]);

      scale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 12 })
      );
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, type]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.Text
      style={[
        styles.text,
        animatedStyle,
        { color: type === 'success' ? COLORS.success : COLORS.warning },
      ]}
    >
      {message}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: FONTS.sizeXl,
    fontWeight: FONTS.weightBlack,
    textAlign: 'center',
    paddingVertical: SIZES.paddingMd,
  },
});
