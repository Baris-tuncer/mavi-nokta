import React, { useEffect } from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { Text } from "./ui/Text";
import { useRadarDots, type RadarDot } from "../hooks/useRadarDots";
import type { MockCampaign } from "../lib/mock-campaigns";
import { Colors, Spacing, FontSize } from "../lib/constants";

const SCREEN_WIDTH = Dimensions.get("window").width;
const RADAR_SIZE = SCREEN_WIDTH;
const RADAR_RADIUS = (RADAR_SIZE - 40) / 2;
const CENTER = RADAR_SIZE / 2;

type Coords = { latitude: number; longitude: number };

type Props = {
  campaigns: MockCampaign[];
  userLocation: Coords | null;
  locationLoading?: boolean;
};

// --- Sonar Pulse Ring ---
function PulseRing({ delay }: { delay: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 3600, easing: Easing.out(Easing.cubic) }),
        -1,
        false
      )
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const size = interpolate(progress.value, [0, 1], [0, RADAR_RADIUS * 2]);
    return {
      width: size,
      height: size,
      borderRadius: size / 2,
      opacity: interpolate(progress.value, [0, 0.3, 1], [0, 0.5, 0]),
    };
  });

  return <Animated.View style={[styles.pulseRing, style]} />;
}

// --- Radar Dot ---
function DotView({ dot }: { dot: RadarDot }) {
  const x = CENTER + dot.fraction * RADAR_RADIUS * Math.sin(dot.angle);
  const y = CENTER - dot.fraction * RADAR_RADIUS * Math.cos(dot.angle);
  const dotSize = dot.isUrgent ? 14 : 10;
  const glowPulse = useSharedValue(1);

  useEffect(() => {
    if (dot.isUrgent || dot.isSurprise) {
      glowPulse.value = withRepeat(
        withSequence(
          withTiming(1.8, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    }
  }, []);

  const glowStyle = useAnimatedStyle(() => {
    const size = dotSize * glowPulse.value * 2;
    return {
      width: size,
      height: size,
      borderRadius: size / 2,
      opacity: interpolate(glowPulse.value, [1, 1.8], [0.3, 0]),
    };
  });

  return (
    <View
      style={[
        styles.dotContainer,
        {
          left: x - dotSize,
          top: y - dotSize,
          width: dotSize * 2,
          height: dotSize * 2,
        },
      ]}
    >
      {(dot.isUrgent || dot.isSurprise) && (
        <Animated.View
          style={[
            styles.dotGlow,
            { backgroundColor: dot.color },
            glowStyle,
          ]}
        />
      )}
      <View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: dot.color,
            shadowColor: dot.color,
          },
        ]}
      />
    </View>
  );
}

export function RadarView({ campaigns, userLocation, locationLoading }: Props) {
  const dots = useRadarDots(campaigns, userLocation);

  return (
    <View style={styles.container}>
      {/* Static grid circles (SVG) */}
      <Svg
        width={RADAR_SIZE}
        height={RADAR_SIZE}
        style={StyleSheet.absoluteFill}
      >
        {[0.25, 0.5, 0.75].map((frac) => (
          <Circle
            key={frac}
            cx={CENTER}
            cy={CENTER}
            r={RADAR_RADIUS * frac}
            stroke={Colors.radarGrid}
            strokeWidth={1}
            fill="none"
          />
        ))}
        {/* Outer ring */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADAR_RADIUS}
          stroke={Colors.radarGrid}
          strokeWidth={1.5}
          fill="none"
        />
      </Svg>

      {/* Sonar pulse rings */}
      <View style={styles.pulseCenter}>
        <PulseRing delay={0} />
        <PulseRing delay={1200} />
        <PulseRing delay={2400} />
      </View>

      {/* Center dot (user) */}
      <View style={styles.centerDot}>
        <View style={styles.centerDotInner} />
      </View>

      {/* Business dots */}
      {dots.map((dot) => (
        <DotView key={dot.id} dot={dot} />
      ))}

      {/* Header text */}
      <View style={styles.headerOverlay}>
        <Text style={styles.radarTitle}>Mavi Nokta Radarı</Text>
        <Text style={styles.radarSubtitle}>
          {locationLoading
            ? "Konum bekleniyor..."
            : `${dots.length} işletme yakınında`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: RADAR_SIZE,
    height: RADAR_SIZE * 0.85,
    backgroundColor: Colors.radarBg,
    overflow: "hidden",
    position: "relative",
  },
  pulseCenter: {
    position: "absolute",
    left: CENTER,
    top: CENTER,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: Colors.radarPulse,
  },
  centerDot: {
    position: "absolute",
    left: CENTER - 8,
    top: CENTER - 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0, 212, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  centerDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.neonBlue,
    shadowColor: Colors.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  dotContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  dotGlow: {
    position: "absolute",
  },
  dot: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 3,
  },
  headerOverlay: {
    position: "absolute",
    top: Spacing.xl,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  radarTitle: {
    fontSize: FontSize.xl,
    fontWeight: "800",
    color: Colors.accent,
  },
  radarSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMute,
    marginTop: Spacing.xs,
  },
});
