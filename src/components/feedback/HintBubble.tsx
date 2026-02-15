// Ipucu Balonu - 10 saniye hareketsizlikte beliren yardim balonu
// Timer baslat, hareketsizlik suresi dolunca ipucu goster

import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS, SIZES, FONTS, SHADOW, ANIMATION } from '../../constants/theme';

interface HintBubbleProps {
  hint: string;
  visible?: boolean;           // Dis kontrolle goster/gizle
  autoShowDelay?: number;      // Otomatik gosterme gecikmesi (ms), varsayilan 10sn
  onShow?: () => void;         // Gosterildiginde cagirilir
  activityTimestamp?: number;  // Son aktivite zamani (Date.now()), her harekette guncelle
}

export function HintBubble({
  hint,
  visible: externalVisible,
  autoShowDelay = ANIMATION.hintDelay,
  onShow,
  activityTimestamp,
}: HintBubbleProps) {
  const [autoVisible, setAutoVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scale = useSharedValue(0);
  const bounceY = useSharedValue(0);

  const isVisible = externalVisible ?? autoVisible;

  // Hareketsizlik timer'i
  useEffect(() => {
    if (externalVisible !== undefined) return; // Dis kontrol varsa timer kullanma

    // Onceki timer'i temizle
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setAutoVisible(false);

    // Yeni timer baslat
    timerRef.current = setTimeout(() => {
      setAutoVisible(true);
      onShow?.();
    }, autoShowDelay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [activityTimestamp, autoShowDelay, externalVisible]);

  // Animasyon
  useEffect(() => {
    if (isVisible) {
      scale.value = withSpring(1, { damping: 10, stiffness: 150 });
      bounceY.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 1000 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(0, { duration: 200 });
      bounceY.value = 0;
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: bounceY.value },
    ],
  }));

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, SHADOW.medium, animatedStyle]}>
      <View style={styles.iconContainer}>
        <FontAwesome name="lightbulb-o" size={SIZES.iconMd} color={COLORS.warning} />
      </View>
      <Text style={styles.hintText}>{hint}</Text>
      <View style={styles.arrow} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.paddingMd,
    gap: SIZES.paddingSm,
    borderWidth: 2,
    borderColor: COLORS.warning,
  },
  iconContainer: {
    width: SIZES.touchableMin / 2,
    height: SIZES.touchableMin / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    flex: 1,
    fontSize: FONTS.sizeMd,
    fontWeight: FONTS.weightMedium,
    color: COLORS.text,
  },
  arrow: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.warning,
  },
});
