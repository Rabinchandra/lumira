import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { ACCENT, COLORS, EVENT_TYPES } from '../../constants/colors';
import { parseDate, getPaidAmount, formatINRShort, TODAY, MONTHS_SHORT } from '../../constants/helpers';
import { SheetType } from './AppShell';
import { Event } from '../../constants/data';
import { FadeInUp, Pressable } from '../ui/anim';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'unpaid', label: 'Unpaid' },
] as const;

type Props = { openSheet: (s: SheetType, extra?: any) => void; showToast: (m: string) => void };

export default function EventsListScreen({ }: Props) {
  const { state, dispatch } = useApp();
  const insets = useSafeAreaInsets();
  const evs: Event[] = state.events[state.teamId] || [];
  const todayD = parseDate(TODAY);

  let list = [...evs];
  if (state.filter === 'upcoming') list = list.filter(e => parseDate(e.dateISO) >= todayD);
  if (state.filter === 'unpaid') list = list.filter(e => e.total - getPaidAmount(e.payments) > 0);
  list.sort((a, b) => parseDate(a.dateISO).getTime() - parseDate(b.dateISO).getTime());

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 14, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <FadeInUp index={0}>
          <Text style={styles.heading}>Events</Text>
        </FadeInUp>

        {/* Filters */}
        <FadeInUp index={1} style={styles.filterRow}>
          {FILTERS.map(f => {
            const on = state.filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, on && { backgroundColor: ACCENT.solid, borderColor: ACCENT.solid }]}
                onPress={() => dispatch({ type: 'SET_FILTER', filter: f.key })}
              >
                <Text style={[styles.filterText, on && { color: '#fff' }]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </FadeInUp>

        {/* Events list */}
        {list.map((ev, i) => {
          const T = EVENT_TYPES[ev.type];
          const d = parseDate(ev.dateISO);
          const paid = getPaidAmount(ev.payments);
          const pend = ev.total - paid;
          let sl: string, sc: string, sb: string;
          if (paid === 0) { sl = 'Unpaid'; sc = COLORS.red; sb = '#FFEDEA'; }
          else if (pend === 0) { sl = 'Paid'; sc = COLORS.green; sb = '#E2FAF3'; }
          else { sl = formatINRShort(pend) + ' due'; sc = COLORS.amber; sb = '#FFF3DE'; }

          return (
            <FadeInUp key={ev.id} delay={140 + i * 55}>
            <Pressable
              style={styles.eventCard}
              onPress={() => dispatch({ type: 'OPEN_EVENT', id: ev.id })}
            >
              <LinearGradient colors={T?.grad || ['#999', '#666']} style={styles.dateBadge}>
                <Text style={styles.dateDD}>{d.getDate()}</Text>
                <Text style={styles.dateMon}>{MONTHS_SHORT[d.getMonth()]}</Text>
              </LinearGradient>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle} numberOfLines={1}>{ev.title}</Text>
                <View style={styles.metaRow}>
                  <View style={[styles.typeBadge, { backgroundColor: T?.soft }]}>
                    <Text style={[styles.typeBadgeText, { color: T?.color }]}>{T?.label}</Text>
                  </View>
                  <Text style={styles.clientName}>{ev.clientName}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: sb }]}>
                <Text style={[styles.statusText, { color: sc }]}>{sl}</Text>
              </View>
            </Pressable>
            </FadeInUp>
          );
        })}

        {list.length === 0 && (
          <FadeInUp index={2} style={styles.empty}>
            <Text style={styles.emptyText}>No events found</Text>
          </FadeInUp>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 18 },
  heading: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: COLORS.textPrimary, letterSpacing: -0.5, marginBottom: 14 },

  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 15, paddingVertical: 9, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ECEAF4',
  },
  filterText: { fontFamily: 'DMSans_600SemiBold', fontSize: 13.5, color: COLORS.textSecondary },

  eventCard: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#F0EEF7',
    borderRadius: 18, padding: 13, flexDirection: 'row', alignItems: 'center',
    gap: 13, marginBottom: 11,
  },
  dateBadge: { width: 50, height: 54, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  dateDD: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#fff', lineHeight: 24 },
  dateMon: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },
  eventInfo: { flex: 1, minWidth: 0 },
  eventTitle: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 15, color: COLORS.textPrimary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 4 },
  typeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  typeBadgeText: { fontFamily: 'DMSans_600SemiBold', fontSize: 11.5 },
  clientName: { fontFamily: 'DMSans_400Regular', fontSize: 12.5, color: COLORS.textMuted },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7, flexShrink: 0 },
  statusText: { fontFamily: 'DMSans_600SemiBold', fontSize: 11 },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: 'DMSans_400Regular', fontSize: 15, color: COLORS.textMuted },
});
