import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { ACCENT, COLORS } from '../../constants/colors';
import { Pressable as AnimPressable } from './anim';
import { api } from '../../lib/api';

type Props = { onClose: () => void; showToast: (m: string) => void };

export default function EditEventSheet({ onClose, showToast }: Props) {
  const { state, refreshEvent } = useApp();
  const insets = useSafeAreaInsets();
  const ev = (state.events[state.teamId] || []).find(e => e.id === state.openEventId);

  const [venue, setVenue] = useState(ev?.venue ?? '');
  const [clientName, setClientName] = useState(ev?.clientName ?? '');
  const [clientPhone, setClientPhone] = useState(ev?.clientPhone ?? '');
  const [notes, setNotes] = useState(ev?.notes ?? '');
  const [saving, setSaving] = useState(false);

  if (!ev) return null;

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await api.updateEvent(ev.id, {
        venue: venue.trim() || null,
        client_name: clientName.trim() || null,
        client_phone: clientPhone.trim() || null,
        notes: notes.trim() || null,
      });
      await refreshEvent(ev.id);
      showToast('Event updated');
      onClose();
    } catch (e: any) {
      showToast(e?.message || 'Could not update event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal transparent animationType="slide" visible>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Edit details</Text>

            <Text style={styles.label}>Venue</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Hotel Grand Palace, Mumbai"
              placeholderTextColor={COLORS.textMuted}
              value={venue}
              onChangeText={setVenue}
            />

            <Text style={styles.label}>Client name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Rohan Sharma"
              placeholderTextColor={COLORS.textMuted}
              value={clientName}
              onChangeText={setClientName}
            />

            <Text style={styles.label}>Client phone</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 98765 43210"
              placeholderTextColor={COLORS.textMuted}
              value={clientPhone}
              onChangeText={setClientPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Any details about the event…"
              placeholderTextColor={COLORS.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />

            <AnimPressable onPress={handleSave} disabled={saving} style={styles.saveBtn}>
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveBtnText}>Save changes</Text>}
            </AnimPressable>
          </ScrollView>
        </View>
      </View>
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
  notesInput: { height: 90, paddingTop: 13 },
  saveBtn: { height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: ACCENT.solid, marginTop: 4 },
  saveBtnText: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 16, color: '#fff' },
});
