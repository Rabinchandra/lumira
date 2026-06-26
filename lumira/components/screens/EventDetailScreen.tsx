import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { ACCENT, COLORS, EVENT_TYPES } from '../../constants/colors';
import {
  formatINR, getPaidAmount, formatLong, initials,
} from '../../constants/helpers';
import { SheetType } from './AppShell';

type Props = { openSheet: (s: SheetType, extra?: any) => void; showToast: (m: string) => void };

export default function EventDetailScreen({ openSheet }: Props) {
  const { state, dispatch } = useApp();
  const insets = useSafeAreaInsets();
  const team = state.teams[state.teamId];

  const ev = (state.events[state.teamId] || []).find(e => e.id === state.openEventId);
  if (!ev) return null;

  const T = EVENT_TYPES[ev.type];
  const paid = getPaidAmount(ev.payments);
  const pend = ev.total - paid;
  const paidPct = ev.total > 0 ? Math.round(paid / ev.total * 100) : 0;

  let payStatus: string, payColor: string, payBg: string;
  if (paid === 0) { payStatus = 'Awaiting payment'; payColor = COLORS.red; payBg = '#FFEDEA'; }
  else if (pend === 0) { payStatus = 'Fully paid'; payColor = COLORS.green; payBg = '#E2FAF3'; }
  else { payStatus = 'Partially paid'; payColor = COLORS.amber; payBg = '#FFF3DE'; }

  const memberName = (id: string) => {
    const m = team.members.find(x => x.id === id);
    return m?.name || 'Crew';
  };
  const memberColor = (id: string) => {
    const m = team.members.find(x => x.id === id);
    return m?.color || '#9C95B4';
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero banner */}
        <View style={styles.hero}>
          <LinearGradient colors={T?.grad || [ACCENT.grad[0], ACCENT.grad[1]]} style={StyleSheet.absoluteFill} />
          <View style={styles.heroDim} />
          {/* Top actions */}
          <View style={[styles.heroActions, { paddingTop: insets.top + 14 }]}>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => dispatch({ type: 'OPEN_EVENT', id: null })}
            >
              <Text style={styles.heroBtnText}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => openSheet('delete')}
            >
              <Text style={styles.heroBtnText}>{'×'}</Text>
            </TouchableOpacity>
          </View>
          {/* Title at bottom */}
          <View style={styles.heroBottom}>
            <View style={[styles.typeTag, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
              <Text style={styles.typeTagText}>{T?.label}</Text>
            </View>
            <Text style={styles.heroTitle}>{ev.title}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Meta info */}
          <View style={styles.metaCard}>
            <View style={styles.metaRow}>
              <Text style={styles.metaIcon}>{'▦'}</Text>
              <Text style={styles.metaText}>{formatLong(ev.dateISO)}</Text>
            </View>
            <View style={[styles.metaRow, styles.metaBorder]}>
              <Text style={styles.metaIcon}>{'◷'}</Text>
              <Text style={styles.metaText}>{ev.timeLabel}</Text>
            </View>
            <View style={[styles.metaRow, styles.metaLast]}>
              <Text style={styles.metaIcon}>{'◉'}</Text>
              <Text style={styles.metaText}>{ev.venue}</Text>
            </View>
          </View>

          {/* Client */}
          <View style={styles.clientCard}>
            <View style={[styles.clientAvatar, { backgroundColor: T?.soft }]}>
              <Text style={[styles.clientAvatarText, { color: T?.color }]}>
                {initials(ev.clientName)}
              </Text>
            </View>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{ev.clientName}</Text>
              <Text style={styles.clientPhone}>{ev.clientPhone}</Text>
            </View>
            <TouchableOpacity
              onPress={() => openSheet('call', { name: ev.clientName, phone: ev.clientPhone })}
              activeOpacity={0.85}
              style={styles.callBtn}
            >
              <Text style={styles.callIcon}>{'☎︎'}</Text>
            </TouchableOpacity>
          </View>

          {/* Payments */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Payments</Text>
              <View style={[styles.payStatusBadge, { backgroundColor: payBg }]}>
                <Text style={[styles.payStatusText, { color: payColor }]}>{payStatus}</Text>
              </View>
            </View>
            <View style={styles.payAmtsRow}>
              <View style={styles.payAmt}>
                <Text style={styles.payAmtLabel}>Collected</Text>
                <Text style={[styles.payAmtVal, { color: COLORS.green }]}>{formatINR(paid)}</Text>
              </View>
              <View style={styles.payAmt}>
                <Text style={styles.payAmtLabel}>Pending</Text>
                <Text style={[styles.payAmtVal, { color: COLORS.red }]}>{formatINR(pend)}</Text>
              </View>
              <View style={[styles.payAmt, { alignItems: 'flex-end' }]}>
                <Text style={styles.payAmtLabel}>Total</Text>
                <Text style={[styles.payAmtVal, { color: COLORS.textPrimary }]}>{formatINR(ev.total)}</Text>
              </View>
            </View>
            <View style={styles.progressBg}>
              <LinearGradient
                colors={['#21D0A6', '#12C9A6']}
                style={[styles.progressFill, { width: `${paidPct}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>

            {/* Payment history */}
            {[...ev.payments].reverse().map((p, i) => (
              <View key={i} style={styles.payHistoryRow}>
                <View style={styles.payHistoryIcon}>
                  <Text style={{ fontSize: 12, color: COLORS.green }}>✓</Text>
                </View>
                <View style={styles.payHistoryInfo}>
                  <Text style={styles.payHistoryNote}>{p.note}</Text>
                  <Text style={styles.payHistoryMeta}>{p.dateISO} · {p.method}</Text>
                </View>
                <Text style={styles.payHistoryAmt}>{formatINR(p.amount)}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.recordBtn, { backgroundColor: ACCENT.soft }]}
              onPress={() => openSheet('pay')}
            >
              <Text style={{ fontSize: 16, color: ACCENT.ink }}>+</Text>
              <Text style={[styles.recordBtnText, { color: ACCENT.ink }]}>Record payment</Text>
            </TouchableOpacity>
          </View>

          {/* Crew */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 14 }]}>Crew</Text>
            {ev.assigned.map((a, i) => {
              const name = memberName(a.memberId);
              const color = memberColor(a.memberId);
              return (
                <View key={i} style={[styles.crewRow, i > 0 && { marginTop: 13 }]}>
                  <View style={[styles.crewAvatar, { backgroundColor: color }]}>
                    <Text style={styles.crewAvatarText}>{initials(name)}</Text>
                  </View>
                  <View>
                    <Text style={styles.crewName}>{name}</Text>
                    <Text style={styles.crewRole}>{a.role}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Notes */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 8 }]}>Notes</Text>
            <Text style={styles.notesText}>{ev.notes}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  hero: { height: 200, position: 'relative' },
  heroDim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.25)' },
  heroActions: {
    position: 'absolute', top: 0, left: 18, right: 18,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  heroBtn: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center',
  },
  heroBtnText: { fontSize: 20, color: '#fff', lineHeight: 24 },
  heroBottom: { position: 'absolute', left: 18, right: 18, bottom: 16 },
  typeTag: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 7, alignSelf: 'flex-start', marginBottom: 9 },
  typeTagText: { fontFamily: 'DMSans_700Bold', fontSize: 11.5, color: '#fff' },
  heroTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: '#fff', letterSpacing: -0.5, lineHeight: 30 },

  body: { padding: 18, gap: 13 },

  metaCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#F0EEF7', borderRadius: 20, paddingHorizontal: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 12 },
  metaBorder: { borderTopWidth: 1, borderTopColor: '#F2F0F8' },
  metaLast: { borderTopWidth: 1, borderTopColor: '#F2F0F8' },
  metaIcon: { fontSize: 18, width: 22 },
  metaText: { fontFamily: 'DMSans_500Medium', fontSize: 14.5, color: COLORS.textPrimary, flex: 1 },

  clientCard: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#F0EEF7',
    borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13,
  },
  clientAvatar: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  clientAvatarText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16 },
  clientInfo: { flex: 1 },
  clientName: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 15.5, color: COLORS.textPrimary },
  clientPhone: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: COLORS.textMuted },
  callBtn: {
    width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: ACCENT.solid,
    shadowColor: '#7C5CFC', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  callIcon: { fontSize: 20, color: '#fff' },

  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#F0EEF7', borderRadius: 22, padding: 18 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  cardTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: COLORS.textPrimary },
  payStatusBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 7 },
  payStatusText: { fontFamily: 'DMSans_600SemiBold', fontSize: 11.5 },
  payAmtsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  payAmt: { flex: 1 },
  payAmtLabel: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: COLORS.textMuted },
  payAmtVal: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, letterSpacing: -0.3 },
  progressBg: { height: 8, borderRadius: 5, backgroundColor: '#F2F0F8', overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', borderRadius: 5 },

  payHistoryRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderTopWidth: 1, borderTopColor: '#F2F0F8' },
  payHistoryIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#E7FBF5', alignItems: 'center', justifyContent: 'center' },
  payHistoryInfo: { flex: 1 },
  payHistoryNote: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: COLORS.textPrimary },
  payHistoryMeta: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: COLORS.textMuted },
  payHistoryAmt: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: COLORS.textPrimary },

  recordBtn: {
    marginTop: 14, height: 48, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  recordBtnText: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14.5 },

  crewRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  crewAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  crewAvatarText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#fff' },
  crewName: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14.5, color: COLORS.textPrimary },
  crewRole: { fontFamily: 'DMSans_400Regular', fontSize: 12.5, color: COLORS.textMuted },

  notesText: { fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 22, color: '#5A5278' },
});
