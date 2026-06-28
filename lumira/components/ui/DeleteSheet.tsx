import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../constants/colors';
import { PopIn, Pressable } from './anim';
import Icon from './Icon';
import { api } from '../../lib/api';

type Props = { onClose: () => void; showToast: (m: string) => void };

export default function DeleteSheet({ onClose, showToast }: Props) {
  const { state, dispatch } = useApp();
  const ev = (state.events[state.teamId] || []).find(e => e.id === state.openEventId);

  const [busy, setBusy] = useState(false);
  const handleDelete = async () => {
    if (busy) return;
    if (!state.openEventId) return;
    const eventId = state.openEventId;
    setBusy(true);
    try {
      await api.deleteEvent(eventId);
      dispatch({ type: 'REMOVE_EVENT', teamId: state.teamId, eventId });
      showToast('Event deleted');
      onClose();
    } catch (e: any) {
      showToast(e?.message || 'Could not delete');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.backdrop}>
        <PopIn from={0.85} style={styles.card}>
          <PopIn delay={90} from={0.5} style={styles.iconCircle}>
            <Icon name="trash" size={26} color={COLORS.red} strokeWidth={2} />
          </PopIn>
          <Text style={styles.title}>Delete event?</Text>
          <Text style={styles.body}>
            This will permanently remove {ev?.title || 'this event'} and its payment history.
          </Text>
          <View style={styles.btns}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.deleteBtn} onPress={handleDelete} disabled={busy}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.deleteText}>Delete</Text>}
            </Pressable>
          </View>
        </PopIn>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(20,12,45,0.5)',
    alignItems: 'center', justifyContent: 'center', padding: 30,
  },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center' },
  iconCircle: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: '#FFEDEA', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  icon: { fontSize: 30, color: COLORS.red, lineHeight: 32 },
  title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: COLORS.textPrimary, marginBottom: 6 },
  body: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  btns: { flexDirection: 'row', gap: 11, width: '100%' },
  cancelBtn: { flex: 1, height: 50, borderRadius: 14, backgroundColor: '#F4F2FA', alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 15, color: COLORS.textPrimary },
  deleteBtn: { flex: 1, height: 50, borderRadius: 14, backgroundColor: '#FF6B5E', alignItems: 'center', justifyContent: 'center' },
  deleteText: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 15, color: '#fff' },
});
