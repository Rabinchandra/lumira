import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { ACCENT, COLORS, EVENT_TYPES } from '../../constants/colors';
import {
  formatINR, formatINRShort, getPaidAmount, parseDate, toISO,
  monthLabel as getMonthLabel, formatMed, initials, TODAY, MONTHS_SHORT,
} from '../../constants/helpers';
import { SheetType } from './AppShell';
import { Event } from '../../constants/data';
import { FadeInUp, Pressable, AnimatedBar } from '../ui/anim';
import Icon from '../ui/Icon';

type Props = { openSheet: (s: SheetType, extra?: any) => void; showToast: (m: string) => void };

export default function DashboardScreen({ openSheet, showToast }: Props) {
  const { state, dispatch } = useApp();
  const insets = useSafeAreaInsets();
  const team = state.teams[state.teamId];
  const evs: Event[] = state.events[state.teamId] || [];

  const base = new Date(2026, 5, 1);
  base.setMonth(base.getMonth() + state.monthOffset);
  const yr = base.getFullYear();
  const mo = base.getMonth();
  const label = getMonthLabel(yr, mo);

  const monthEvs = evs.filter(e => {
    const d = parseDate(e.dateISO);
    return d.getFullYear() === yr && d.getMonth() === mo;
  });

  let booked = 0, collected = 0;
  monthEvs.forEach(e => { booked += e.total; collected += getPaidAmount(e.payments); });
  const outstanding = booked - collected;
  const collectedPct = booked > 0 ? Math.round(collected / booked * 100) : 0;
  const dueEvs = monthEvs.filter(e => e.total - getPaidAmount(e.payments) > 0);
  const todayD = parseDate(TODAY);
  const doneCount = monthEvs.filter(e => parseDate(e.dateISO) < todayD).length;
  const upCount = monthEvs.length - doneCount;

  // Category breakdown
  const catMap: Record<string, number> = {};
  monthEvs.forEach(e => { catMap[e.type] = (catMap[e.type] || 0) + e.total; });
  const cats = Object.keys(catMap)
    .map(k => ({ type: k, amount: catMap[k], T: EVENT_TYPES[k] }))
    .filter(c => c.T)
    .sort((a, b) => b.amount - a.amount);

  // Upcoming events (from today)
  const upcoming = evs
    .filter(e => parseDate(e.dateISO) >= todayD)
    .sort((a, b) => parseDate(a.dateISO).getTime() - parseDate(b.dateISO).getTime())
    .slice(0, 3);

  // Dues
  const dues = dueEvs
    .map(e => ({ e, pend: e.total - getPaidAmount(e.payments) }))
    .sort((a, b) => b.pend - a.pend)
    .slice(0, 4);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 6, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <FadeInUp index={0} style={styles.header}>
          <TouchableOpacity style={styles.teamRow} onPress={() => openSheet('team')}>
            <View style={[styles.teamAvatar, { backgroundColor: team.color }]}>
              <Text style={styles.teamAvatarText}>{team.initials}</Text>
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.teamName}>{team.name}</Text>
                <Text style={{ color: '#9C95B4', fontSize: 14 }}>▾</Text>
              </View>
              <Text style={styles.teamMeta}>{team.userRole} · {team.members.length} members</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => dispatch({ type: 'SET_TAB', tab: 'studio' })}
          >
            <View style={[styles.userAvatar, { backgroundColor: ACCENT.solid }]}>
              <Text style={styles.userAvatarText}>AM</Text>
            </View>
          </TouchableOpacity>
        </FadeInUp>

        {/* Month picker */}
        <FadeInUp index={1} style={styles.monthRow}>
          <Text style={styles.monthSub}>Studio overview</Text>
          <View style={styles.monthPicker}>
            <TouchableOpacity
              onPress={() => dispatch({ type: 'SET_MONTH_OFFSET', offset: state.monthOffset - 1 })}
              style={styles.monthArrow}
            >
              <Icon name="chevron-left" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{label}</Text>
            <TouchableOpacity
              onPress={() => dispatch({ type: 'SET_MONTH_OFFSET', offset: state.monthOffset + 1 })}
              style={styles.monthArrow}
            >
              <Icon name="chevron-right" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </FadeInUp>

        {/* Hero revenue card */}
        <FadeInUp index={2}>
          <View style={styles.heroCard}>
            <View style={styles.heroBlob} />
            <Text style={styles.heroSub}>Collected this month</Text>
            <View style={styles.heroAmtRow}>
              <Text style={styles.heroAmt}>{formatINR(collected)}</Text>
              <View style={styles.trendBadge}>
                <Text style={styles.trendText}>↑ +18%</Text>
              </View>
            </View>
            <Text style={styles.heroSubAmt}>of {formatINR(booked)} booked</Text>
            <View style={styles.progressBg}>
              <AnimatedBar pct={collectedPct} style={styles.progressFill} />
            </View>
          </View>
        </FadeInUp>

        {/* Two tiles */}
        <FadeInUp index={3} style={styles.tilesRow}>
          <Pressable
            style={styles.tile}
            onPress={() => dispatch({ type: 'SET_TAB', tab: 'events' })}
          >
            <View style={[styles.tileIcon, { backgroundColor: '#FFEFEA' }]}>
              <Icon name="wallet" size={18} color={COLORS.red} strokeWidth={2.2} />
            </View>
            <Text style={styles.tileBig}>{formatINR(outstanding)}</Text>
            <Text style={styles.tileSub}>Outstanding · {dueEvs.length} dues</Text>
          </Pressable>
          <Pressable
            style={styles.tile}
            onPress={() => dispatch({ type: 'SET_TAB', tab: 'calendar' })}
          >
            <View style={[styles.tileIcon, { backgroundColor: '#E7FBF5' }]}>
              <Icon name="calendar" size={18} color={COLORS.green} />
            </View>
            <Text style={styles.tileBig}>{monthEvs.length} events</Text>
            <Text style={styles.tileSub}>{doneCount} done · {upCount} upcoming</Text>
          </Pressable>
        </FadeInUp>

        {/* Category breakdown */}
        {cats.length > 0 && (
          <FadeInUp index={4} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>By category</Text>
              <Text style={styles.cardMeta}>{formatINRShort(booked)} booked</Text>
            </View>
            {/* Segmented bar */}
            <View style={styles.segBar}>
              {cats.map((c, i) => (
                <View
                  key={c.type}
                  style={[
                    styles.segBarFill,
                    {
                      flex: c.amount / booked,
                      backgroundColor: c.T.color,
                      marginLeft: i > 0 ? 2 : 0,
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.legend}>
              {cats.map(c => (
                <View key={c.type} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: c.T.color }]} />
                  <Text style={styles.legendLabel}>{c.T.label}</Text>
                  <Text style={styles.legendPct}>
                    {booked > 0 ? Math.round(c.amount / booked * 100) : 0}%
                  </Text>
                  <Text style={styles.legendAmt}>{formatINRShort(c.amount)}</Text>
                </View>
              ))}
            </View>
          </FadeInUp>
        )}

        {/* Upcoming events */}
        <FadeInUp index={5} style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          <TouchableOpacity onPress={() => dispatch({ type: 'SET_TAB', tab: 'calendar' })}>
            <Text style={[styles.sectionLink, { color: ACCENT.ink }]}>Calendar</Text>
          </TouchableOpacity>
        </FadeInUp>
        {upcoming.map((ev, i) => {
          const T = EVENT_TYPES[ev.type];
          const d = parseDate(ev.dateISO);
          const pend = ev.total - getPaidAmount(ev.payments);
          return (
            <FadeInUp key={ev.id} delay={420 + i * 80}>
            <Pressable
              style={styles.eventCard}
              onPress={() => dispatch({ type: 'OPEN_EVENT', id: ev.id })}
            >
              <View style={[styles.dateBadge, { backgroundColor: T?.color || '#999' }]}>
                <Text style={styles.dateDD}>{d.getDate()}</Text>
                <Text style={styles.dateMon}>{MONTHS_SHORT[d.getMonth()]}</Text>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle} numberOfLines={1}>{ev.title}</Text>
                <View style={styles.eventMeta}>
                  <View style={[styles.typeBadge, { backgroundColor: T?.soft }]}>
                    <Text style={[styles.typeBadgeText, { color: T?.color }]}>{T?.label}</Text>
                  </View>
                  <Text style={styles.eventTime}>{ev.timeLabel.split(' – ')[0]}</Text>
                </View>
              </View>
              <View style={styles.dueInfo}>
                <Text style={styles.dueLabel}>{pend > 0 ? 'Pending' : 'Settled'}</Text>
                <Text style={[styles.dueAmt, { color: pend > 0 ? COLORS.red : COLORS.green }]}>
                  {pend > 0 ? formatINRShort(pend) : 'Paid'}
                </Text>
              </View>
            </Pressable>
            </FadeInUp>
          );
        })}

        {/* Outstanding dues */}
        {dues.length > 0 && (
          <>
            <FadeInUp index={6}>
              <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>Outstanding dues</Text>
            </FadeInUp>
            <FadeInUp index={7} style={styles.card}>
              {dues.map(({ e, pend }, i) => {
                const T = EVENT_TYPES[e.type];
                return (
                  <TouchableOpacity
                    key={e.id}
                    style={[styles.dueRow, i < dues.length - 1 && styles.dueRowBorder]}
                    onPress={() => dispatch({ type: 'OPEN_EVENT', id: e.id })}
                  >
                    <View style={[styles.dueAvatar, { backgroundColor: T?.soft }]}>
                      <Text style={[styles.dueAvatarText, { color: T?.color }]}>
                        {initials(e.clientName)}
                      </Text>
                    </View>
                    <View style={styles.dueCardInfo}>
                      <Text style={styles.dueName} numberOfLines={1}>{e.title}</Text>
                      <Text style={styles.dueClient}>{e.clientName}</Text>
                    </View>
                    <Text style={[styles.duePending, { color: COLORS.red }]}>{formatINRShort(pend)}</Text>
                  </TouchableOpacity>
                );
              })}
            </FadeInUp>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 18 },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  teamAvatar: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  teamAvatarText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#fff' },
  teamName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 17, color: COLORS.textPrimary },
  teamMeta: { fontFamily: 'DMSans_400Regular', fontSize: 12.5, color: COLORS.textMuted },
  userAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#fff' },

  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  monthSub: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: COLORS.textSecondary },
  monthPicker: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ECEAF4',
    borderRadius: 11, paddingVertical: 5, paddingHorizontal: 8,
  },
  monthArrow: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  arrowText: { fontSize: 18, color: COLORS.textSecondary, lineHeight: 22 },
  monthLabel: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 13.5, color: COLORS.textPrimary, minWidth: 100, textAlign: 'center' },

  heroCard: { backgroundColor: ACCENT.solid, borderRadius: 24, padding: 22, overflow: 'hidden', marginBottom: 14, shadowColor: '#7C5CFC', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.32, shadowRadius: 30, elevation: 10 },
  heroBlob: { position: 'absolute', top: -30, right: -20, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.14)' },
  heroSub: { fontFamily: 'DMSans_400Regular', fontSize: 13.5, color: 'rgba(255,255,255,0.8)' },
  heroAmtRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 6 },
  heroAmt: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 38, color: '#fff', letterSpacing: -1.5, lineHeight: 44 },
  trendBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, marginBottom: 4 },
  trendText: { fontFamily: 'DMSans_700Bold', fontSize: 12, color: '#fff' },
  heroSubAmt: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.72)', marginTop: 8 },
  progressBg: { height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.22)', marginTop: 11, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#fff' },

  tilesRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  tile: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#F0EEF7', borderRadius: 20, padding: 16 },
  tileIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  tileBig: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 17, color: COLORS.textPrimary, letterSpacing: -0.5 },
  tileSub: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#F0EEF7', borderRadius: 22, padding: 18, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  cardTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: COLORS.textPrimary },
  cardMeta: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: COLORS.textMuted },
  segBar: { flexDirection: 'row', height: 12, borderRadius: 7, overflow: 'hidden', backgroundColor: '#F4F2FA' },
  segBarFill: { height: '100%' },
  legend: { marginTop: 16, gap: 11 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendLabel: { flex: 1, fontFamily: 'DMSans_500Medium', fontSize: 14, color: '#3A3358' },
  legendPct: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: COLORS.textMuted },
  legendAmt: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14, color: COLORS.textPrimary, minWidth: 54, textAlign: 'right' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 10 },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: COLORS.textPrimary },
  sectionLink: { fontFamily: 'DMSans_600SemiBold', fontSize: 13.5 },

  eventCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#F0EEF7', borderRadius: 18, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 11 },
  dateBadge: { width: 50, height: 54, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  dateDD: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#fff', lineHeight: 24 },
  dateMon: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },
  eventInfo: { flex: 1 },
  eventTitle: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 15, color: COLORS.textPrimary },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 4 },
  typeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  typeBadgeText: { fontFamily: 'DMSans_600SemiBold', fontSize: 11.5 },
  eventTime: { fontFamily: 'DMSans_400Regular', fontSize: 12.5, color: COLORS.textMuted },
  dueInfo: { alignItems: 'flex-end' },
  dueLabel: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: COLORS.textMuted },
  dueAmt: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14 },

  dueRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 14, paddingHorizontal: 0 },
  dueRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F2F0F8' },
  dueAvatar: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  dueAvatarText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14 },
  dueCardInfo: { flex: 1 },
  dueName: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14.5, color: COLORS.textPrimary },
  dueClient: { fontFamily: 'DMSans_400Regular', fontSize: 12.5, color: COLORS.textMuted },
  duePending: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15 },
});
