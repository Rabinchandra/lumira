import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { ACCENT, COLORS } from '../../constants/colors';
import { initials } from '../../constants/helpers';
import { FadeInUp, Pressable } from '../ui/anim';

const ROLES = ['Lead Photographer', 'Photographer', 'Videographer', 'Editor'];

export default function CreateStudioScreen() {
  const { state, dispatch } = useApp();
  const insets = useSafeAreaInsets();

  const preview = state.studioName || 'Your studio';
  const previewInitials = initials(state.studioName || 'Your Studio') || 'YS';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 20 }]}>
        {/* Back */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => dispatch({ type: 'SET_SCREEN', screen: 'onboard' })}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <FadeInUp index={0}>
          <Text style={styles.heading}>Create your studio</Text>
        </FadeInUp>
        <FadeInUp index={1}>
          <Text style={styles.sub}>You'll be the owner and can invite your team next.</Text>
        </FadeInUp>

        {/* Studio name */}
        <FadeInUp index={2}>
        <Text style={styles.label}>Studio name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Lumière Co."
          placeholderTextColor={COLORS.textMuted}
          value={state.studioName}
          onChangeText={name => dispatch({ type: 'SET_STUDIO_NAME', name })}
        />
        </FadeInUp>

        {/* Role chips */}
        <FadeInUp index={3}>
        <Text style={styles.label}>Your role</Text>
        <View style={styles.chips}>
          {ROLES.map(r => {
            const on = state.studioRole === r;
            return (
              <TouchableOpacity
                key={r}
                style={[styles.chip, on && styles.chipActive]}
                onPress={() => dispatch({ type: 'SET_STUDIO_ROLE', role: r })}
              >
                <Text style={[styles.chipText, on && styles.chipTextActive]}>{r}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        </FadeInUp>

        {/* Preview card */}
        <FadeInUp index={4} style={styles.previewCard}>
          <LinearGradient colors={ACCENT.grad} style={styles.previewAvatar}>
            <Text style={styles.previewAvatarText}>{previewInitials}</Text>
          </LinearGradient>
          <View>
            <Text style={styles.previewName}>{preview}</Text>
            <Text style={styles.previewRole}>Owner · Aanya Mehra</Text>
          </View>
        </FadeInUp>

        {/* Create button */}
        <FadeInUp index={5}>
          <Pressable
            style={[styles.createBtnWrapper, styles.createBtn]}
            onPress={() => {
              dispatch({ type: 'SET_SCREEN', screen: 'app' });
            }}
          >
            <Text style={styles.createBtnText}>Create studio</Text>
          </Pressable>
        </FadeInUp>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 24, paddingTop: 14 },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ECEAF4',
    alignItems: 'center', justifyContent: 'center', marginBottom: 18,
  },
  backArrow: { fontSize: 24, color: COLORS.textPrimary, lineHeight: 28 },
  heading: {
    fontFamily: 'SpaceGrotesk_700Bold', fontSize: 28,
    color: COLORS.textPrimary, letterSpacing: -1, marginBottom: 6,
  },
  sub: { fontFamily: 'DMSans_400Regular', fontSize: 15, color: COLORS.textSecondary, marginBottom: 28 },
  label: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  input: {
    height: 54, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.borderStrong,
    backgroundColor: '#fff', paddingHorizontal: 18, fontFamily: 'DMSans_400Regular',
    fontSize: 16, color: COLORS.textPrimary, marginBottom: 22,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 24 },
  chip: {
    paddingVertical: 11, paddingHorizontal: 16, borderRadius: 13,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: COLORS.borderStrong,
  },
  chipActive: { backgroundColor: ACCENT.soft, borderColor: ACCENT.solid },
  chipText: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: COLORS.textSecondary },
  chipTextActive: { color: ACCENT.ink },
  previewCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ECEAF4',
    borderRadius: 18, padding: 16, marginBottom: 32,
  },
  previewAvatar: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  previewAvatarText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#fff' },
  previewName: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 16, color: COLORS.textPrimary },
  previewRole: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: COLORS.textMuted },
  createBtnWrapper: { borderRadius: 18, overflow: 'hidden', shadowColor: '#7C5CFC', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 8 },
  createBtn: { height: 56, alignItems: 'center', justifyContent: 'center', backgroundColor: ACCENT.solid },
  createBtnText: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 16, color: '#fff' },
});
