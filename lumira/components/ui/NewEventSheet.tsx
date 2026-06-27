import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { ACCENT, COLORS, EVENT_TYPES } from '../../constants/colors';
import { formatMed, initials, parseDate, toISO, monthLabel } from '../../constants/helpers';
import { Event } from '../../constants/data';
import { Pressable as AnimPressable } from './anim';
import Icon from './Icon';

const WD = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type Props = { onClose: () => void; showToast: (m: string) => void };

export default function NewEventSheet({ onClose, showToast }: Props) {
  const { state, dispatch } = useApp();
  const insets = useSafeAreaInsets();
  const members = state.teams[state.teamId]?.members || [];
  const [crew, setCrew] = useState<string[]>([]);
  const [localDate, setLocalDate] = useState(state.selectedDate);
  const [showCal, setShowCal] = useState(false);
  const initD = parseDate(state.selectedDate);
  const [viewY, setViewY] = useState(initD.getFullYear());
  const [viewM, setViewM] = useState(initD.getMonth());

  const toggleCrew = (id: string) =>
    setCrew(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  const shiftMonth = (delta: number) => {
    const next = new Date(viewY, viewM + delta, 1);
    setViewY(next.getFullYear());
    setViewM(next.getMonth());
  };

  // Build the month grid (6 weeks)
  const gridStart = new Date(viewY, viewM, 1 - new Date(viewY, viewM, 1).getDay());
  const weeks: Array<Array<{ label: number; iso: string; inMonth: boolean }>> = [];
  for (let w = 0; w < 6; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const dt = new Date(gridStart);
      dt.setDate(gridStart.getDate() + w * 7 + d);
      days.push({ label: dt.getDate(), iso: toISO(dt), inMonth: dt.getMonth() === viewM });
    }
    weeks.push(days);
  }

  const handleSubmit = () => {
    const t = state.newTitle.trim();
    if (!t) { showToast('Add a title'); return; }
    const total = parseInt(state.newTotal, 10) || 0;
    const assigned = crew.map(id => ({
      memberId: id,
      role: members.find(m => m.id === id)?.role || 'Crew',
    }));
    const newEv: Event = {
      id: 'n' + Date.now(),
      type: state.newType,
      title: t,
      dateISO: localDate,
      timeLabel: '10:00 AM – 2:00 PM',
      venue: 'To be confirmed',
      clientName: 'New client',
      clientPhone: '+91 90000 00000',
      assigned,
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
                const on = state.newType === k;
                return (
                  <TouchableOpacity
                    key={k}
                    style={[styles.chip, on && { backgroundColor: ACCENT.soft, borderColor: ACCENT.solid }]}
                    onPress={() => dispatch({ type: 'SET_NEW_TYPE', eventType: k })}
                  >
                    <Text style={[styles.chipText, on && { color: ACCENT.ink }]}>{EVENT_TYPES[k].label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                  style={[styles.dateDisplay, showCal && { borderColor: ACCENT.solid }]}
                  onPress={() => setShowCal(s => !s)}
                >
                  <Text style={styles.dateText}>{formatMed(localDate)}</Text>
                  <Icon name="calendar" size={17} color={COLORS.textSecondary} />
                </TouchableOpacity>
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

            {showCal && (
              <View style={styles.calCard}>
                <View style={styles.calHead}>
                  <TouchableOpacity style={styles.calNav} onPress={() => shiftMonth(-1)}>
                    <Icon name="chevron-left" size={18} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                  <Text style={styles.calMonth}>{monthLabel(viewY, viewM)}</Text>
                  <TouchableOpacity style={styles.calNav} onPress={() => shiftMonth(1)}>
                    <Icon name="chevron-right" size={18} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.weekRow}>
                  {WD.map((w, i) => <Text key={i} style={styles.weekDay}>{w}</Text>)}
                </View>
                {weeks.map((week, wi) => (
                  <View key={wi} style={styles.weekRow}>
                    {week.map(day => {
                      const on = day.iso === localDate;
                      return (
                        <TouchableOpacity
                          key={day.iso}
                          style={styles.dayCell}
                          onPress={() => { setLocalDate(day.iso); setShowCal(false); }}
                        >
                          <View style={[styles.dayCellBg, on && { backgroundColor: ACCENT.solid }]}>
                            <Text style={[
                              styles.dayNum,
                              !day.inMonth && { color: '#CBC6DA' },
                              on && { color: '#fff' },
                            ]}>
                              {day.label}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            )}

            <View style={styles.crewHead}>
              <Text style={[styles.label, { marginBottom: 0 }]}>Crew</Text>
              <Text style={styles.optional}>
                {crew.length > 0 ? `${crew.length} added` : 'Optional'}
              </Text>
            </View>
            <Text style={styles.crewHint}>Add who might go on this day</Text>
            <View style={styles.crewList}>
              {members.map(m => {
                const on = crew.includes(m.id);
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.crewRow, on && { borderColor: ACCENT.solid, backgroundColor: ACCENT.soft }]}
                    onPress={() => toggleCrew(m.id)}
                  >
                    <View style={[styles.crewAvatar, { backgroundColor: m.color }]}>
                      <Text style={styles.crewAvatarText}>{initials(m.name)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.crewName}>{m.name}</Text>
                      <Text style={styles.crewRole}>{m.role}</Text>
                    </View>
                    <View style={[styles.checkbox, on && { backgroundColor: ACCENT.solid, borderColor: ACCENT.solid }]}>
                      {on && <Icon name="check" size={14} color="#fff" strokeWidth={2.6} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
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
    backgroundColor: '#F6F5FB', paddingHorizontal: 16, marginBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  dateText: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: COLORS.textPrimary },

  calCard: {
    borderRadius: 16, borderWidth: 1.5, borderColor: '#E6E3F0',
    backgroundColor: '#fff', padding: 12, marginTop: -4, marginBottom: 16,
  },
  calHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  calNav: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F5FB' },
  calMonth: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14, color: COLORS.textPrimary },
  weekRow: { flexDirection: 'row' },
  weekDay: { flex: 1, textAlign: 'center', fontFamily: 'DMSans_600SemiBold', fontSize: 11, color: '#B3ABC8', paddingBottom: 4 },
  dayCell: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  dayCellBg: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dayNum: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 13.5, color: COLORS.textPrimary },
  createBtn: { height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: ACCENT.solid },
  createBtnText: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 16, color: '#fff' },

  crewHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optional: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: COLORS.textMuted },
  crewHint: { fontFamily: 'DMSans_400Regular', fontSize: 12.5, color: COLORS.textMuted, marginTop: 3, marginBottom: 12 },
  crewList: { gap: 8 },
  crewRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10,
    borderRadius: 14, borderWidth: 1.5, borderColor: '#E6E3F0', backgroundColor: '#fff',
  },
  crewAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  crewAvatarText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#fff' },
  crewName: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14, color: COLORS.textPrimary },
  crewRole: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: COLORS.textMuted },
  checkbox: {
    width: 24, height: 24, borderRadius: 8, borderWidth: 1.5, borderColor: '#D8D3E6',
    alignItems: 'center', justifyContent: 'center',
  },
  checkMark: { fontSize: 13, color: '#fff', fontWeight: 'bold' },
});
