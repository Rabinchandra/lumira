import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ACCENT } from '../../constants/colors';
import { initials } from '../../constants/helpers';

type Props = { name: string; phone: string; onEnd: () => void };

export default function CallingOverlay({ name, phone, onEnd }: Props) {
  const insets = useSafeAreaInsets();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Modal transparent animationType="fade" visible>
      <LinearGradient
        colors={['#1B0F3B', '#2B1466']}
        style={[styles.container, { paddingTop: insets.top + 80, paddingBottom: insets.bottom + 60 }]}
      >
        <View style={styles.top}>
          <Text style={styles.callingLabel}>calling…</Text>
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <LinearGradient colors={ACCENT.grad} style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(name)}</Text>
            </LinearGradient>
          </Animated.View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.phone}>{phone}</Text>
        </View>

        <TouchableOpacity style={styles.endBtn} onPress={onEnd}>
          <Text style={styles.endIcon}>✕</Text>
        </TouchableOpacity>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between' },
  top: { alignItems: 'center' },
  callingLabel: { fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 24 },
  avatar: { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  avatarText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 40, color: '#fff' },
  name: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: '#fff' },
  phone: { fontSize: 15, color: 'rgba(255,255,255,0.6)', marginTop: 6 },
  endBtn: {
    width: 66, height: 66, borderRadius: 33, backgroundColor: '#FF4747',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF4747', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  endIcon: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
});
