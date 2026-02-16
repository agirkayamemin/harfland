// Konfeti Animasyonu - Dogru cevapta ekranda konfeti patlamasi
// Lottie animasyonu hazir olana kadar Reanimated ile basit parcacik efekti

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS, ANIMATION } from '../../constants/theme';

const PARTICLE_COUNT = 20;
const CONFETTI_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.warning,
  COLORS.success,
  '#FF69B4',
  '#7B68EE',
  '#FFD700',
];

interface ConfettiParticleProps {
  index: number;
  onFinish?: () => void;
  isLast: boolean;
}

function ConfettiParticle({ index, onFinish, isLast }: ConfettiParticleProps) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(0);

  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const startX = (Math.random() - 0.5) * 300;
  const delay = Math.random() * 300;
  const size = 8 + Math.random() * 8;

  useEffect(() => {
    scale.value = withDelay(delay, withTiming(1, { duration: 200 }));
    translateY.value = withDelay(
      delay,
      withTiming(-200 - Math.random() * 200, {
        duration: ANIMATION.confetti,
        easing: Easing.out(Easing.cubic),
      })
    );
    translateX.value = withDelay(
      delay,
      withTiming(startX, {
        duration: ANIMATION.confetti,
        easing: Easing.out(Easing.cubic),
      })
    );
    rotate.value = withDelay(
      delay,
      withTiming(360 * (Math.random() > 0.5 ? 1 : -1), {
        duration: ANIMATION.confetti,
      })
    );
    opacity.value = withDelay(
      delay + ANIMATION.confetti * 0.6,
      withTiming(0, { duration: ANIMATION.confetti * 0.4 }, (finished) => {
        if (finished && isLast && onFinish) {
          runOnJS(onFinish)();
        }
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
        {
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: Math.random() > 0.5 ? size / 2 : 2,
        },
      ]}
    />
  );
}

interface ConfettiAnimationProps {
  visible: boolean;
  onFinish?: () => void;
}

export function ConfettiAnimation({ visible, onFinish }: ConfettiAnimationProps) {
  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden={true}>
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <ConfettiParticle
          key={i}
          index={i}
          isLast={i === PARTICLE_COUNT - 1}
          onFinish={onFinish}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  particle: {
    position: 'absolute',
  },
});
