// Harf Cizme Tuvali - SVG rehber yol + parmak ile serbest cizim
// Cocuk istediği kadar cizgi cizebilir, "Kontrol Et" butonuyla degerlendirilir

import { useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS } from 'react-native-reanimated';
import { COLORS, SIZES } from '../../constants/theme';
import { TracePath } from '../../data/tracePaths';
import { Point } from '../../utils/traceValidator';

interface LetterTraceCanvasProps {
  tracePath: TracePath;
  letterColor: string;
  canvasSize: number;
  disabled?: boolean;
}

// Modul seviyesinde nokta depolama (worklet scope'undan uzak)
let _strokePointsList: Point[][] = [];
let _currentPoints: Point[] = [];

export function getDrawnStrokes(): Point[][] {
  return _strokePointsList.map((s) => [...s]);
}

export function LetterTraceCanvas({
  tracePath,
  letterColor,
  canvasSize,
  disabled = false,
}: LetterTraceCanvasProps) {
  const [drawnPaths, setDrawnPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');

  // Koordinatlari tuval boyutuna olcekle (tracePath 0-200, tuval canvasSize)
  const scale = canvasSize / 200;

  // JS thread'de calisan nokta kayit fonksiyonlari
  const handleGestureStart = useCallback(
    (x: number, y: number) => {
      _currentPoints = [{ x: x / scale, y: y / scale }];
      setCurrentPath(`M ${x},${y}`);
    },
    [scale]
  );

  const handleGestureUpdate = useCallback(
    (x: number, y: number) => {
      _currentPoints.push({ x: x / scale, y: y / scale });
      setCurrentPath((prev) => `${prev} L ${x},${y}`);
    },
    [scale]
  );

  const handleGestureEnd = useCallback(() => {
    if (_currentPoints.length > 0) {
      _strokePointsList.push([..._currentPoints]);
    }
    _currentPoints = [];

    setCurrentPath((prevPath) => {
      if (prevPath) {
        setDrawnPaths((prev) => [...prev, prevPath]);
      }
      return '';
    });
  }, []);

  // Gesture handler
  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .minDistance(0)
    .onStart((e) => {
      runOnJS(handleGestureStart)(e.x, e.y);
    })
    .onUpdate((e) => {
      runOnJS(handleGestureUpdate)(e.x, e.y);
    })
    .onEnd(() => {
      runOnJS(handleGestureEnd)();
    });

  return (
    <View style={[styles.container, { width: canvasSize, height: canvasSize }]}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.svgContainer, { width: canvasSize, height: canvasSize }]}>
          <Svg width={canvasSize} height={canvasSize} viewBox={`0 0 ${canvasSize} ${canvasSize}`}>
            {/* Rehber yollar - kalin gri koridor */}
            {tracePath.strokes.map((stroke, i) => (
              <Path
                key={`guide-${i}`}
                d={scaleSvgPath(stroke.d, scale)}
                stroke={COLORS.border}
                strokeWidth={SIZES.traceCorridorWidth * scale}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={0.4}
              />
            ))}

            {/* Tamamlanan cizimler */}
            {drawnPaths.map((path, i) => (
              <Path
                key={`drawn-${i}`}
                d={path}
                stroke={letterColor}
                strokeWidth={SIZES.traceStrokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}

            {/* Aktif cizim */}
            {currentPath ? (
              <Path
                d={currentPath}
                stroke={letterColor}
                strokeWidth={SIZES.traceStrokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ) : null}
          </Svg>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// SVG path koordinatlarini olcekle (arc flag'leri olcekleme)
function scaleSvgPath(d: string, scale: number): string {
  const parts = d.match(/[A-Za-z]|-?\d+\.?\d*/g);
  if (!parts) return d;

  const result: string[] = [];
  let i = 0;

  while (i < parts.length) {
    const part = parts[i];
    if (/^[A-Za-z]$/.test(part)) {
      result.push(part);
      const cmd = part.toUpperCase();
      i++;

      if (cmd === 'A') {
        // Arc: rx ry x-rotation large-arc-flag sweep-flag x y
        while (i < parts.length && /^-?\d/.test(parts[i])) {
          result.push((parseFloat(parts[i++]) * scale).toFixed(1)); // rx
          result.push((parseFloat(parts[i++]) * scale).toFixed(1)); // ry
          result.push(parts[i++]);                                   // x-rotation
          result.push(parts[i++]);                                   // large-arc-flag
          result.push(parts[i++]);                                   // sweep-flag
          result.push((parseFloat(parts[i++]) * scale).toFixed(1)); // x
          result.push((parseFloat(parts[i++]) * scale).toFixed(1)); // y
        }
      } else if (cmd !== 'Z') {
        while (i < parts.length && /^-?\d/.test(parts[i])) {
          result.push((parseFloat(parts[i++]) * scale).toFixed(1));
        }
      }
    } else {
      i++;
    }
  }

  return result.join(' ');
}

// Modul seviyesi noktalarini sifirla (ekran tekrar yuklendiginde)
export function resetTracePoints() {
  _strokePointsList = [];
  _currentPoints = [];
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  svgContainer: {
    backgroundColor: 'transparent',
  },
});
