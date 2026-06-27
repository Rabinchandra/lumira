import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { ACCENT, COLORS } from '../../constants/colors';
import { FadeInUp, Pressable as AnimPressable } from './anim';
import Icon from './Icon';

type Props = { onClose: () => void; showToast: (m: string) => void };

export default function TeamSheet({ onClose, showToast }: Props) {
  const { state, dispatch } = useApp();
  const insets = useSafeAreaInsets();

  return (
    <Modal transparent animationType="fade" visible>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>Switch studio</Text>

          {Object.values(state.teams).map((t, i) => {
            const active = t.id === state.teamId;
            return (
              <FadeInUp key={t.id} delay={60 + i * 60}>
              <AnimPressable
                style={[styles.teamRow, active && { backgroundColor: ACCENT.soft }]}
                onPress={() => {
                  dispatch({ type: 'SET_TEAM', teamId: t.id });
                  showToast(`Switched to ${t.name}`);
                  onClose();
                }}
              >
                <View style={[styles.avatar, { backgroundColor: t.color }]}>
                  <Text style={styles.avatarText}>{t.initials}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{t.name}</Text>
                  <Text style={styles.meta}>{t.userRole} · {t.members.length} members</Text>
                </View>
                {active && (
                  <View style={[styles.check, { backgroundColor: ACCENT.solid }]}>
                    <Icon name="check" size={13} color="#fff" strokeWidth={2.6} />
                  </View>
                )}
              </AnimPressable>
              </FadeInUp>
            );
          })}

          <AnimPressable style={styles.addRow} onPress={onClose}>
            <View style={[styles.addIcon, { backgroundColor: ACCENT.soft }]}>
              <Text style={[styles.addIconText, { color: ACCENT.ink }]}>+</Text>
            </View>
            <Text style={[styles.addText, { color: ACCENT.ink }]}>Create or join a studio</Text>
          </AnimPressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(20,12,45,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26,
    padding: 20, paddingTop: 8,
  },
  handle: { width: 38, height: 4, borderRadius: 3, backgroundColor: '#E2DEEE', alignSelf: 'center', marginBottom: 16 },
  title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: COLORS.textPrimary, marginBottom: 14 },
  teamRow: {
    flexDirection: 'row', alignItems: 'center', gap: 13,
    padding: 13, borderRadius: 16, marginBottom: 8,
  },
  avatar: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#fff' },
  info: { flex: 1 },
  name: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 15, color: COLORS.textPrimary },
  meta: { fontFamily: 'DMSans_400Regular', fontSize: 12.5, color: COLORS.textMuted },
  check: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  checkMark: { fontSize: 12, color: '#fff', fontWeight: 'bold' },
  addRow: {
    flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13,
    borderRadius: 16, borderWidth: 1.5, borderColor: '#DAD5E8', borderStyle: 'dashed', marginTop: 4,
  },
  addIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  addIconText: { fontSize: 22 },
  addText: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 15 },
});
