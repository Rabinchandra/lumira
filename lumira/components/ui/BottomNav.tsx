import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { ACCENT } from '../../constants/colors';

const MUTED = '#B3ABC8';

type Props = { openNewSheet: () => void };

export default function BottomNav({ openNewSheet }: Props) {
  const { state, dispatch } = useApp();
  const insets = useSafeAreaInsets();
  const tab = state.tab;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <NavItem label="Home" active={tab === 'dashboard'} onPress={() => dispatch({ type: 'SET_TAB', tab: 'dashboard' })}>
        {(color) => <Glyph glyph="⌂" color={color} />}
      </NavItem>

      <NavItem label="Calendar" active={tab === 'calendar'} onPress={() => dispatch({ type: 'SET_TAB', tab: 'calendar' })}>
        {(color) => <Glyph glyph="▦" color={color} />}
      </NavItem>

      {/* FAB */}
      <View style={styles.fabWrapper}>
        <Fab onPress={openNewSheet} />
      </View>

      <NavItem label="Events" active={tab === 'events'} onPress={() => dispatch({ type: 'SET_TAB', tab: 'events' })}>
        {(color) => <Glyph glyph="☰" color={color} />}
      </NavItem>

      <NavItem label="Studio" active={tab === 'studio'} onPress={() => dispatch({ type: 'SET_TAB', tab: 'studio' })}>
        {(color) => <Glyph glyph="◉" color={color} />}
      </NavItem>
    </View>
  );
}

function NavItem({
  label,
  active,
  onPress,
  children,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  children: (color: string) => React.ReactNode;
}) {
  const progress = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: active ? 1 : 0,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [active]);

  const color = active ? ACCENT.solid : MUTED;
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -3] });
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] });

  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress} activeOpacity={0.7}>
      <Animated.View style={{ transform: [{ translateY }, { scale }] }}>
        {children(color)}
      </Animated.View>
      <Text style={[styles.navLabel, { color }]}>{label}</Text>
      <Animated.View style={[styles.activeDot, { opacity: progress, transform: [{ scale: progress }] }]} />
    </TouchableOpacity>
  );
}

function Fab({ onPress }: { onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const press = () => {
    Animated.sequence([
      Animated.timing(rotate, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(rotate, { toValue: 0, friction: 5, tension: 90, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={press}
      onPressIn={() => Animated.spring(scale, { toValue: 0.9, speed: 50, bounciness: 0, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, speed: 40, bounciness: 12, useNativeDriver: true }).start()}
    >
      <Animated.View style={[styles.fab, { transform: [{ scale }, { rotate: spin }] }]}>
        <Text style={styles.fabPlus}>+</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function Glyph({ glyph, color }: { glyph: string; color: string }) {
  return (
    <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, color }}>{glyph}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: '#EEEBF6',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 11,
    paddingHorizontal: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 10.5,
  },
  activeDot: {
    position: 'absolute',
    bottom: -3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACCENT.solid,
  },
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT.solid,
    marginTop: -18,
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  fabPlus: {
    fontSize: 28,
    color: '#fff',
    lineHeight: 32,
  },
});
