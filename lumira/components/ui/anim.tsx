import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable as RNPressable,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';

/**
 * Lightweight animation toolkit built on the React Native Animated API.
 * No extra dependencies — works everywhere Expo runs.
 */

const EASE_OUT = Easing.out(Easing.cubic);

/* ------------------------------------------------------------------ *
 * FadeInUp — fade + slide-up entrance on mount.
 * Use `delay` (or `index` * step) to stagger lists.
 * ------------------------------------------------------------------ */
type FadeInUpProps = {
  children: React.ReactNode;
  delay?: number;
  /** convenience: multiplies by `step` to derive a staggered delay */
  index?: number;
  step?: number;
  distance?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
};

export function FadeInUp({
  children,
  delay,
  index = 0,
  step = 70,
  distance = 16,
  duration = 460,
  style,
}: FadeInUpProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const resolvedDelay = delay ?? index * step;

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay: resolvedDelay,
      easing: EASE_OUT,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, []);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [distance, 0],
  });

  return (
    <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ *
 * PopIn — fade + spring scale-in. Great for logos, badges, modals.
 * ------------------------------------------------------------------ */
type PopInProps = {
  children: React.ReactNode;
  delay?: number;
  from?: number;
  style?: StyleProp<ViewStyle>;
};

export function PopIn({ children, delay = 0, from = 0.8, style }: PopInProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(from)).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 360,
        delay,
        easing: EASE_OUT,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        delay,
        friction: 6,
        tension: 90,
        useNativeDriver: true,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ scale }] }]}>
      {children}
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ *
 * Pressable — TouchableOpacity-style press feedback with a spring
 * scale-down. Drop-in replacement for TouchableOpacity in most places.
 * ------------------------------------------------------------------ */
type PressableProps = {
  children: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  disabled?: boolean;
  hitSlop?: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export function Pressable({
  children,
  onPress,
  style,
  scaleTo = 0.96,
  disabled,
  hitSlop,
}: PressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (toValue: number, bounciness: number) =>
    Animated.spring(scale, {
      toValue,
      speed: 50,
      bounciness,
      useNativeDriver: true,
    }).start();

  // Animate the touchable itself so layout styles (flex, margin) are honored
  // and the press-scale wraps the entire styled element.
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => !disabled && animate(scaleTo, 0)}
      onPressOut={() => !disabled && animate(1, 8)}
      disabled={disabled}
      hitSlop={hitSlop}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressable>
  );
}

/* ------------------------------------------------------------------ *
 * AnimatedBar — animates a progress bar from 0 to `pct`% width.
 * ------------------------------------------------------------------ */
type AnimatedBarProps = {
  pct: number;
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export function AnimatedBar({ pct, delay = 200, duration = 900, style, children }: AnimatedBarProps) {
  const w = useRef(new Animated.Value(0)).current;
  const target = Math.max(0, Math.min(100, pct));

  useEffect(() => {
    const anim = Animated.timing(w, {
      toValue: target,
      duration,
      delay,
      easing: EASE_OUT,
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [target]);

  const width = w.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return <Animated.View style={[style, { width }]}>{children}</Animated.View>;
}

/* ------------------------------------------------------------------ *
 * PulseBlob — decorative circle that slowly orbits in a tiny loop.
 * No pulse / scale change — just a calm continuous drift.
 * ------------------------------------------------------------------ */
type PulseBlobProps = {
  style?: StyleProp<ViewStyle>;
  duration?: number;
  radius?: number;
};

export function PulseBlob({
  style,
  duration = 12000,
  radius = 10,
}: PulseBlobProps) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(v, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Sample a smooth circular path with 9 points (0 and 1 match to close the loop).
  const steps = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
  const xPath = steps.map(t => Math.sin(t * Math.PI * 2) * radius);
  const yPath = steps.map(t => Math.cos(t * Math.PI * 2) * radius);

  const translateX = v.interpolate({ inputRange: steps, outputRange: xPath });
  const translateY = v.interpolate({ inputRange: steps, outputRange: yPath });

  return (
    <Animated.View
      pointerEvents="none"
      style={[style, { transform: [{ translateX }, { translateY }] }]}
    />
  );
}

/* ------------------------------------------------------------------ *
 * useFloat — gentle infinite up/down float for decorative blobs.
 * Returns a transform-ready translateY Animated value.
 * ------------------------------------------------------------------ */
export function useFloat(distance = 14, duration = 3200, delay = 0) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: 1,
          duration,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(v, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return v.interpolate({ inputRange: [0, 1], outputRange: [0, distance] });
}
