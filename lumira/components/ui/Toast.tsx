import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, Easing } from 'react-native';

type Props = { message: string; bottomOffset?: number };

export default function Toast({ message, bottomOffset = 96 }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.spring(progress, {
      toValue: 1,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, []);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });

  return (
    <Animated.View
      style={[
        styles.toast,
        { bottom: bottomOffset, opacity: progress, transform: [{ translateY }, { scale }] },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#1A1430',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    zIndex: 100,
  },
  text: { fontFamily: 'DMSans_600SemiBold', fontSize: 13.5, color: '#fff' },
});
