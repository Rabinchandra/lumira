import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { ACCENT, COLORS, EVENT_TYPES } from '../../constants/colors';
import { parseDate, toISO, monthLabel as getMonthLabel, formatMed, TODAY } from '../../constants/helpers';
import { SheetType } from './AppShell';
import { Event } from '../../constants/data';
import { FadeInUp, Pressable } from '../ui/anim';

const WD = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type Props = { openSheet: (s: SheetType, extra?: any) => void; showToast: (m: string) => void };

export default function CalendarScreen({ openSheet }: Props) {
  const { state, dispatch } = useApp();
  const insets = useSafeAreaInsets();
  const evs: Event[] = state.events[state.teamId] || [];

  const base = new Date(2026, 5, 1);
  base.setMonth(base.getMonth() + state.monthOffset);
  const yr = base.getFullYear();
  const mo = base.getMonth();
  const label = getMonthLabel(yr, mo);

  // Calendar grid
  const first = new Date(yr, mo, 1);
  const startDow = first.getDay();
  const gridStart = new Date(yr, mo, 1 - startDow);
  const weeks: Array<Array<{
    label: number; dateISO: string; inMonth: boolean; isToday: boolean; isSel: boolean; dots: string[];
  }>> = [];

  for (let w = 0; w < 6; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const dt = new Date(gridStart);
      dt.setDate(gridStart.getDate() + w * 7 + d);
      const iso = toISO(dt);
      const inMonth = dt.getMonth() === mo;
      const dayEvs = evs.filter(e => e.dateISO === iso);
      const isToday = iso === TODAY;
      const isSel = iso === state.selectedDate;
      const dots = dayEvs.slice(0, 3).map(e => (EVENT_TYPES[e.type]?.color || '#999'));
      days.push({ label: dt.getDate(), dateISO: iso, inMonth, isToday, isSel, dots });
    }
    weeks.push(days);
  }

  const selEvs = evs
    .filter(e => e.dateISO === state.selectedDate)
    .sort((a, b) => a.timeLabel.localeCompare(b.timeLabel));

  const selLabel = formatMed(state.selectedDate);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 14, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <FadeInUp index={0} style={styles.header}>
          <Text style={styles.monthTitle}>{label}</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.todayBtn, { backgroundColor: ACCENT.soft }]}
              onPress={() => dispatch({ type: 'SET_MONTH_OFFSET', offset: 0 })}
            >
              <Text style={[styles.todayText, { color: ACCENT.ink }]}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => dispatch({ type: 'SET_MONTH_OFFSET', offset: state.monthOffset - 1 })}
            >
              <Text style={styles.navBtnText}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => dispatch({ type: 'SET_MONTH_OFFSET', offset: state.monthOffset + 1 })}
            >
              <Text style={styles.navBtnText}>›</Text>
            </TouchableOpacity>
          </View>
        </FadeInUp>

        {/* Calendar grid */}
        <FadeInUp index={1} style={styles.calCard}>
          {/* Weekday headers */}
          <View style={styles.weekRow}>
            {WD.map((w, i) => (
              <Text key={i} style={styles.weekDay}>{w}</Text>
            ))}
          </View>
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.weekRow}>
              {week.map((day) => (
                <TouchableOpacity
                  key={day.dateISO}
                  style={styles.dayCell}
                  onPress={() => dispatch({ type: 'SET_SELECTED_DATE', date: day.dateISO })}
                >
                  {day.isSel ? (
                    <LinearGradient colors={ACCENT.grad} style={styles.dayCellBg}>
                      <Text style={[styles.dayNum, { color: '#fff' }]}>{day.label}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[
                      styles.dayCellBg,
                      day.isToday && { borderWidth: 1.5, borderColor: ACCENT.solid },
                    ]}>
                      <Text style={[
                        styles.dayNum,
                        !day.inMonth && { color: '#CBC6DA' },
                        day.isToday && { color: ACCENT.ink },
                      ]}>
                        {day.label}
                      </Text>
                    </View>
                  )}
                  <View style={styles.dotsRow}>
                    {day.dots.map((c, di) => (
                      <View
                        key={di}
                        style={[styles.dot, { backgroundColor: day.isSel ? 'rgba(255,255,255,0.9)' : c }]}
                      />
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </FadeInUp>

        {/* Selected day events */}
        <FadeInUp index={2} style={styles.selHeader}>
          <Text style={styles.selTitle}>{selLabel}</Text>
          <Text style={styles.selCount}>
            {selEvs.length > 0 ? `${selEvs.length} event${selEvs.length > 1 ? 's' : ''}` : 'No events'}
          </Text>
        </FadeInUp>

        {selEvs.length > 0 ? (
          selEvs.map((ev, i) => {
            const T = EVENT_TYPES[ev.type];
            return (
              <FadeInUp key={state.selectedDate + ev.id} delay={i * 70}>
              <Pressable
                style={styles.selEventCard}
                onPress={() => dispatch({ type: 'OPEN_EVENT', id: ev.id })}
              >
                <View style={[styles.selColorBar, { backgroundColor: T?.color }]} />
                <View style={styles.selEventInfo}>
                  <View style={styles.selEventMeta}>
                    <View style={[styles.typeBadge, { backgroundColor: T?.soft }]}>
                      <Text style={[styles.typeBadgeText, { color: T?.color }]}>{T?.label}</Text>
                    </View>
                    <Text style={styles.selEventTime}>{ev.timeLabel}</Text>
                  </View>
                  <Text style={styles.selEventTitle}>{ev.title}</Text>
                  <View style={styles.venueRow}>
                    <Text style={styles.venueDot}>{'◉'}</Text>
                    <Text style={styles.venueText}>{ev.venue}</Text>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
              </FadeInUp>
            );
          })
        ) : (
          <FadeInUp key={state.selectedDate}>
            <Pressable style={styles.emptyDay} onPress={() => openSheet('new')}>
              <Text style={styles.emptyText}>No events on this day</Text>
              <Text style={[styles.addText, { color: ACCENT.ink }]}>+ Add an event</Text>
            </Pressable>
          </FadeInUp>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 18 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  monthTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: COLORS.textPrimary, letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  todayBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 11 },
  todayText: { fontFamily: 'DMSans_600SemiBold', fontSize: 13 },
  navBtn: { width: 36, height: 36, borderRadius: 11, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ECEAF4', alignItems: 'center', justifyContent: 'center' },
  navBtnText: { fontSize: 18, color: COLORS.textSecondary, lineHeight: 22 },

  calCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#F0EEF7', borderRadius: 22, padding: 14, marginBottom: 24 },
  weekRow: { flexDirection: 'row' },
  weekDay: { flex: 1, textAlign: 'center', fontFamily: 'DMSans_600SemiBold', fontSize: 11, color: '#B3ABC8', paddingBottom: 6 },
  dayCell: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  dayCellBg: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  dayNum: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14.5, color: COLORS.textPrimary },
  dotsRow: { flexDirection: 'row', gap: 2.5, marginTop: 3, height: 5 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },

  selHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  selTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 17, color: COLORS.textPrimary },
  selCount: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: COLORS.textMuted },

  selEventCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#F0EEF7', borderRadius: 18, padding: 14, flexDirection: 'row', gap: 13, marginBottom: 11, alignItems: 'center' },
  selColorBar: { width: 4, borderRadius: 3, alignSelf: 'stretch' },
  selEventInfo: { flex: 1 },
  selEventMeta: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 5 },
  typeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  typeBadgeText: { fontFamily: 'DMSans_600SemiBold', fontSize: 11.5 },
  selEventTime: { fontFamily: 'DMSans_400Regular', fontSize: 12.5, color: COLORS.textMuted },
  selEventTitle: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 15.5, color: COLORS.textPrimary },
  venueRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  venueDot: { fontSize: 11 },
  venueText: { fontFamily: 'DMSans_400Regular', fontSize: 12.5, color: COLORS.textMuted },
  chevron: { fontSize: 18, color: '#C9C3DA', marginLeft: 4 },

  emptyDay: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#DAD5E8', borderStyle: 'dashed', borderRadius: 18, padding: 28, alignItems: 'center' },
  emptyText: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: COLORS.textMuted },
  addText: { fontFamily: 'DMSans_600SemiBold', fontSize: 13.5, marginTop: 6 },
});
