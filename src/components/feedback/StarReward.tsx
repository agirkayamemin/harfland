// Yildiz Odulu Animasyonu - Kazanilan yildizlari gosterir
// 1-3 yildiz buyuyerek ve parlayarak belirir

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS, SIZES, ANIMATION } from '../../constants/theme';

interface StarRewardProps {
  stars: number; // 1-3
  visible: boolean;
}

function AnimatedStar({ index, visible }: { index: number; visible: boolean }) {
  const scale = useSharedValue(0);
  const rotate = useSharedValue(-30);

  useEffect(() => {
    if (visible) {
      const delay = index * 300;
      scale.value = withDelay(
        delay,
        withSequence(
          withSpring(1.3, { damping: 8, stiffness: 150 }),
          withSpring(1, { damping: 12, stiffness: 100 })
        )
      );
      rotate.value = withDelay(
        delay,
        withSequence(
          withTiming(15, { duration: 150 }),
          withSpring(0, { damping: 8 })
        )
      );
    } else {
      scale.value = 0;
      rotate.value = -30;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.starContainer, animatedStyle]}>
      <FontAwesome name="star" size={SIZES.iconXl} color={COLORS.warning} />
    </Animated.View>
  );
}

export function StarReward({ stars, visible }: StarRewardProps) {
  if (!visible || stars <= 0) return null;

  const starCount = Math.min(3, Math.max(1, stars));

  return (
    <View style={styles.container}>
      {Array.from({ length: starCount }).map((_, i) => (
        <AnimatedStar key={i} index={i} visible={visible} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.paddingMd,
    paddingVertical: SIZES.paddingLg,
  },
  starContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
