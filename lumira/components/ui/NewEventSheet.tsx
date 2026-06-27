import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { ACCENT, COLORS, EVENT_TYPES } from '../../constants/colors';
import { formatMed } from '../../constants/helpers';
import { Event } from '../../constants/data';
import { Pressable as AnimPressable } from './anim';

type Props = { onClose: () => void; showToast: (m: string) => void };

export default function NewEventSheet({ onClose, showToast }: Props) {
  const { state, dispatch } = useApp();
  const insets = useSafeAreaInsets();

  const handleSubmit = () => {
    const t = state.newTitle.trim();
    if (!t) { showToast('Add a title'); return; }
    const total = parseInt(state.newTotal, 10) || 0;
    const newEv: Event = {
      id: 'n' + Date.now(),
      type: state.newType,
      title: t,
      dateISO: state.selectedDate,
      timeLabel: '10:00 AM – 2:00 PM',
      venue: 'To be confirmed',
      clientName: 'New client',
      clientPhone: '+91 90000 00000',
      assigned: [{ memberId: 'a1', role: 'Lead Photographer' }],
      total,
      notes: 'Added from quick create. Edit to add full details.',
      payments: [],
    };
    dispatch({ type: 'ADD_EVENT', teamId: state.teamId, event: newEv });
    showToast('Event created');
    onClose();
  };

  return (
    <Modal transparent animationType="slide" visible>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 16, maxHeight: '88%' }]}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>New event</Text>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Sharma Wedding"
              placeholderTextColor={COLORS.textMuted}
              value={state.newTitle}
              onChangeText={v => dispatch({ type: 'SET_NEW_TITLE', title: v })}
            />

            <Text style={styles.label}>Type</Text>
            <View style={styles.chips}>
              {Object.keys(EVENT_TYPES).map(k => {
                const T = EVENT_TYPES[k];
                const on = state.newType === k;
                return (
                  <TouchableOpacity
                    key={k}
                    style={[styles.chip, on && { backgroundColor: T.soft, borderColor: T.color }]}
                    onPress={() => dispatch({ type: 'SET_NEW_TYPE', eventType: k })}
                  >
                    <Text style={[styles.chipText, on && { color: T.color }]}>{T.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Date</Text>
                <View style={styles.dateDisplay}>
                  <Text style={styles.dateText}>{formatMed(state.selectedDate)}</Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Total (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                  value={state.newTotal}
                  onChangeText={v => dispatch({ type: 'SET_NEW_TOTAL', total: v.replace(/[^0-9]/g, '') })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <AnimPressable onPress={handleSubmit} style={[styles.createBtn, { marginTop: 20 }]}>
              <Text style={styles.createBtnText}>Create event</Text>
            </AnimPressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(20,12,45,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingTop: 8 },
  handle: { width: 38, height: 4, borderRadius: 3, backgroundColor: '#E2DEEE', alignSelf: 'center', marginBottom: 16 },
  title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: COLORS.textPrimary, marginBottom: 16 },
  label: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  input: {
    height: 50, borderRadius: 14, borderWidth: 1.5, borderColor: '#E6E3F0',
    backgroundColor: '#fff', paddingHorizontal: 16, fontFamily: 'DMSans_400Regular',
    fontSize: 15, color: COLORS.textPrimary, marginBottom: 16,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 11,
    backgroundColor: '#F6F5FB', borderWidth: 1.5, borderColor: '#E6E3F0',
  },
  chipText: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: COLORS.textSecondary },
  row: { flexDirection: 'row', gap: 12 },
  dateDisplay: {
    height: 50, borderRadius: 14, borderWidth: 1.5, borderColor: '#E6E3F0',
    backgroundColor: '#F6F5FB', paddingHorizontal: 16, justifyContent: 'center', marginBottom: 16,
  },
  dateText: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: COLORS.textPrimary },
  createBtn: { height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: ACCENT.solid },
  createBtnText: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 16, color: '#fff' },
});
