import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { ACCENT, COLORS, EVENT_TYPES } from '../../constants/colors';
import {
  formatINR, getPaidAmount, formatLong, initials,
} from '../../constants/helpers';
import { SheetType } from './AppShell';
import { FadeInUp, Pressable, AnimatedBar } from '../ui/anim';
import Icon from '../ui/Icon';

type Props = { openSheet: (s: SheetType, extra?: any) => void; showToast: (m: string) => void };

export default function EventDetailScreen({ openSheet, showToast }: Props) {
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

  const crewName = (a: { memberId: string; name?: string }) => {
    const m = team.members.find(x => x.id === a.memberId);
    return m?.name || a.name || 'Crew';
  };
  const crewColor = (a: { memberId: string; color?: string }) => {
    const m = team.members.find(x => x.id === a.memberId);
    return m?.color || a.color || '#9C95B4';
  };
  const isExternal = (a: { memberId: string }) => !team.members.some(x => x.id === a.memberId);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero banner */}
        <View style={[styles.hero, { backgroundColor: T?.color || ACCENT.solid }]}>
          <View style={styles.heroDim} />
          {/* Top actions */}
          <View style={[styles.heroActions, { paddingTop: insets.top + 14 }]}>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => dispatch({ type: 'OPEN_EVENT', id: null })}
            >
              <Icon name="chevron-left" size={24} color="#fff" strokeWidth={2.4} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => openSheet('delete')}
            >
              <Icon name="close" size={22} color="#fff" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
          {/* Title at bottom */}
          <FadeInUp delay={120} style={styles.heroBottom}>
            <View style={[styles.typeTag, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
              <Text style={styles.typeTagText}>{T?.label}</Text>
            </View>
            <Text style={styles.heroTitle}>{ev.title}</Text>
          </FadeInUp>
        </View>

        <View style={styles.body}>
          {/* Meta info */}
          <FadeInUp index={1} style={styles.metaCard}>
            <View style={styles.metaRow}>
              <View style={styles.metaIcon}><Icon name="calendar" size={19} color={COLORS.textSecondary} /></View>
              <Text style={styles.metaText}>{formatLong(ev.dateISO)}</Text>
            </View>
            <View style={[styles.metaRow, styles.metaBorder]}>
              <View style={styles.metaIcon}><Icon name="clock" size={19} color={COLORS.textSecondary} /></View>
              <Text style={styles.metaText}>{ev.timeLabel}</Text>
            </View>
            <View style={[styles.metaRow, styles.metaLast]}>
              <View style={styles.metaIcon}><Icon name="pin" size={19} color={COLORS.textSecondary} /></View>
              <Text style={styles.metaText}>{ev.venue}</Text>
            </View>
          </FadeInUp>

          {/* Client */}
          <FadeInUp index={2} style={styles.clientCard}>
            <View style={[styles.clientAvatar, { backgroundColor: T?.soft }]}>
              <Text style={[styles.clientAvatarText, { color: T?.color }]}>
                {initials(ev.clientName)}
              </Text>
            </View>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{ev.clientName}</Text>
              <Text style={styles.clientPhone}>{ev.clientPhone}</Text>
            </View>
            <Pressable
              onPress={() => openSheet('call', { name: ev.clientName, phone: ev.clientPhone })}
              scaleTo={0.9}
              style={styles.callBtn}
            >
              <Icon name="phone" size={20} color="#fff" />
            </Pressable>
          </FadeInUp>

          {/* Payments */}
          <FadeInUp index={3} style={styles.card}>
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
              <AnimatedBar pct={paidPct} style={[styles.progressFill, { backgroundColor: COLORS.green }]} />
            </View>

            {/* Payment history */}
            {[...ev.payments].reverse().map((p, i) => (
              <View key={i} style={styles.payHistoryRow}>
                <View style={styles.payHistoryIcon}>
                  <Icon name="check" size={13} color={COLORS.green} strokeWidth={2.4} />
                </View>
                <View style={styles.payHistoryInfo}>
                  <Text style={styles.payHistoryNote}>{p.note}</Text>
                  <Text style={styles.payHistoryMeta}>{p.dateISO} · {p.method}</Text>
                </View>
                <Text style={styles.payHistoryAmt}>{formatINR(p.amount)}</Text>
              </View>
            ))}

            <Pressable
              style={[styles.recordBtn, { backgroundColor: ACCENT.soft }]}
              onPress={() => openSheet('pay')}
            >
              <Text style={{ fontSize: 16, color: ACCENT.ink }}>+</Text>
              <Text style={[styles.recordBtnText, { color: ACCENT.ink }]}>Record payment</Text>
            </Pressable>
          </FadeInUp>

          {/* Crew */}
          <FadeInUp index={4} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Crew</Text>
              <Pressable onPress={() => openSheet('crew')} scaleTo={0.92} style={styles.crewEditBtn}>
                <Text style={styles.crewEditText}>Edit</Text>
              </Pressable>
            </View>
            {ev.assigned.length === 0 ? (
              <Text style={styles.crewEmpty}>No crew added yet. Tap Edit to add who's going.</Text>
            ) : (
              ev.assigned.map((a, i) => {
                const name = crewName(a);
                const color = crewColor(a);
                return (
                  <View key={i} style={[styles.crewRow, i > 0 && { marginTop: 13 }]}>
                    <View style={[styles.crewAvatar, { backgroundColor: color }]}>
                      <Text style={styles.crewAvatarText}>{initials(name)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.crewNameRow}>
                        <Text style={styles.crewName}>{name}</Text>
                        {isExternal(a) && (
                          <View style={styles.extTag}><Text style={styles.extTagText}>External</Text></View>
                        )}
                      </View>
                      <Text style={styles.crewRole}>{a.role}</Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        dispatch({
                          type: 'UPDATE_EVENT_CREW',
                          eventId: ev.id,
                          assigned: ev.assigned.filter(x => x.memberId !== a.memberId),
                        });
                        showToast(`Removed ${name}`);
                      }}
                      scaleTo={0.85}
                      style={styles.crewRemove}
                    >
                      <Icon name="close" size={15} color={COLORS.red} strokeWidth={2.2} />
                    </Pressable>
                  </View>
                );
              })
            )}

            <Pressable
              style={[styles.recordBtn, { backgroundColor: ACCENT.soft }]}
              onPress={() => openSheet('crew')}
            >
              <Text style={{ fontSize: 16, color: ACCENT.ink }}>+</Text>
              <Text style={[styles.recordBtnText, { color: ACCENT.ink }]}>Add or edit crew</Text>
            </Pressable>
          </FadeInUp>

          {/* Notes */}
          <FadeInUp index={5} style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 8 }]}>Notes</Text>
            <Text style={styles.notesText}>{ev.notes}</Text>
          </FadeInUp>
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
  crewNameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  crewName: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14.5, color: COLORS.textPrimary },
  extTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: '#F2F0F8' },
  extTagText: { fontFamily: 'DMSans_600SemiBold', fontSize: 10.5, color: COLORS.textSecondary },
  crewRole: { fontFamily: 'DMSans_400Regular', fontSize: 12.5, color: COLORS.textMuted },
  crewEditBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9, backgroundColor: ACCENT.soft },
  crewEditText: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: ACCENT.ink },
  crewEmpty: { fontFamily: 'DMSans_400Regular', fontSize: 13.5, lineHeight: 20, color: COLORS.textMuted },
  crewRemove: {
    width: 30, height: 30, borderRadius: 10, backgroundColor: '#FFEDEA',
    alignItems: 'center', justifyContent: 'center',
  },
  crewRemoveText: { fontSize: 17, color: COLORS.red, lineHeight: 20 },

  notesText: { fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 22, color: '#5A5278' },
});
