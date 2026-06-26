import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../constants/colors';

type Props = { onClose: () => void; showToast: (m: string) => void };

export default function DeleteSheet({ onClose, showToast }: Props) {
  const { state, dispatch } = useApp();
  const ev = (state.events[state.teamId] || []).find(e => e.id === state.openEventId);

  const handleDelete = () => {
    if (!state.openEventId) return;
    dispatch({ type: 'DELETE_EVENT', eventId: state.openEventId });
    showToast('Event deleted');
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.backdrop}>
        <Pressable style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>🗑</Text>
          </View>
          <Text style={styles.title}>Delete event?</Text>
          <Text style={styles.body}>
            This will permanently remove {ev?.title || 'this event'} and its payment history.
          </Text>
          <View style={styles.btns}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
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
  icon: { fontSize: 24 },
  title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: COLORS.textPrimary, marginBottom: 6 },
  body: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  btns: { flexDirection: 'row', gap: 11, width: '100%' },
  cancelBtn: { flex: 1, height: 50, borderRadius: 14, backgroundColor: '#F4F2FA', alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 15, color: COLORS.textPrimary },
  deleteBtn: { flex: 1, height: 50, borderRadius: 14, backgroundColor: '#FF6B5E', alignItems: 'center', justifyContent: 'center' },
  deleteText: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 15, color: '#fff' },
});
