import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { ACCENT, COLORS } from '../../constants/colors';
import { FadeInUp, PopIn, Pressable } from '../ui/anim';
import Icon from '../ui/Icon';

export default function JoinStudioScreen() {
  const { state, dispatch } = useApp();
  const insets = useSafeAreaInsets();
  const code = (state.joinCode || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  const joinOk = code.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <TouchableOpacity
        style={[styles.backBtn, { margin: 20 }]}
        onPress={() => dispatch({ type: 'SET_SCREEN', screen: 'onboard' })}
      >
        <Icon name="chevron-left" size={22} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <View style={{ paddingHorizontal: 24 }}>
        <FadeInUp index={0}>
          <Text style={styles.heading}>Join a studio</Text>
        </FadeInUp>
        <FadeInUp index={1}>
          <Text style={styles.sub}>Ask the studio owner for the 6-character invite code.</Text>
        </FadeInUp>

        {/* Code boxes */}
        <FadeInUp index={2} style={styles.codeRow}>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <View
              key={i}
              style={[styles.codeBox, code[i] ? { borderColor: ACCENT.solid } : {}]}
            >
              {code[i] ? (
                <PopIn key={code[i]} from={0.4}>
                  <Text style={styles.codeChar}>{code[i]}</Text>
                </PopIn>
              ) : (
                <Text style={styles.codeChar} />
              )}
            </View>
          ))}
        </FadeInUp>

        <FadeInUp index={3}>
        <TextInput
          style={styles.codeInput}
          placeholder="Type code"
          placeholderTextColor={COLORS.textMuted}
          value={state.joinCode}
          onChangeText={v => dispatch({ type: 'SET_JOIN_CODE', code: v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) })}
          autoCapitalize="characters"
          maxLength={6}
        />

        <Text style={styles.hint}>
          Try <Text style={{ color: COLORS.textSecondary, fontFamily: 'SpaceGrotesk_600SemiBold' }}>LUM4X9</Text> to preview a joined studio
        </Text>
        </FadeInUp>
      </View>

      <View style={styles.bottom}>
        <Pressable
          disabled={!joinOk}
          onPress={() => {
            if (!joinOk) return;
            dispatch({ type: 'SET_SCREEN', screen: 'app' });
            dispatch({ type: 'SET_TEAM', teamId: 'A' });
          }}
        >
          <LinearGradient
            colors={joinOk ? ACCENT.grad : ['#E6E3F0', '#E6E3F0']}
            style={styles.joinBtn}
          >
            <Text style={[styles.joinBtnText, !joinOk && { color: '#B3ABC8' }]}>Join studio</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ECEAF4',
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 24, color: COLORS.textPrimary, lineHeight: 28 },
  heading: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 28, color: COLORS.textPrimary, letterSpacing: -1, marginBottom: 6 },
  sub: { fontFamily: 'DMSans_400Regular', fontSize: 15, color: COLORS.textSecondary, marginBottom: 32 },
  codeRow: { flexDirection: 'row', gap: 9, justifyContent: 'space-between', marginBottom: 18 },
  codeBox: {
    flex: 1, aspectRatio: 1, borderRadius: 15, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: '#E6E3F0', alignItems: 'center', justifyContent: 'center',
  },
  codeChar: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: COLORS.textPrimary },
  codeInput: {
    width: '100%', height: 52, borderRadius: 15, borderWidth: 1.5, borderColor: '#E6E3F0',
    backgroundColor: '#fff', paddingHorizontal: 18, fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 18, letterSpacing: 4, color: COLORS.textPrimary, marginBottom: 14,
  },
  hint: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
  bottom: { marginTop: 'auto', paddingHorizontal: 24, paddingBottom: 10 },
  joinBtn: { height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  joinBtnText: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 16, color: '#fff' },
});
