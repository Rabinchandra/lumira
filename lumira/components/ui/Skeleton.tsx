import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ACCENT, COLORS } from '../../constants/colors';

const BASE = '#ECE9F4';
const HIGHLIGHT = '#F7F5FC';

type BlockProps = {
  width?: number | string;
  height?: number | string;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  delay?: number;
};

export function SkeletonBlock({
  width = '100%',
  height = 14,
  radius = 8,
  style,
  delay = 0,
}: BlockProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 850,
          delay,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 850,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay]);

  const backgroundColor = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [BASE, HIGHLIGHT],
  });

  return (
    <Animated.View
      style={[
        { width: width as any, height: height as any, borderRadius: radius, backgroundColor },
        style,
      ]}
    />
  );
}

/* ---------- Composed primitives ---------- */

function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

function Row({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.row, style]}>{children}</View>;
}

/* ---------- Screen skeletons ---------- */

export function DashboardSkeleton() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.container, { paddingTop: insets.top + 6 }]}>
      {/* Header */}
      <View style={s.headerRow}>
        <Row style={{ gap: 11 }}>
          <SkeletonBlock width={42} height={42} radius={13} />
          <View style={{ gap: 6 }}>
            <SkeletonBlock width={130} height={14} radius={6} />
            <SkeletonBlock width={90} height={11} radius={5} delay={120} />
          </View>
        </Row>
        <SkeletonBlock width={42} height={42} radius={21} />
      </View>

      {/* Month row */}
      <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
        <SkeletonBlock width={110} height={13} radius={5} />
        <SkeletonBlock width={130} height={32} radius={11} />
      </Row>

      {/* Hero card */}
      <View style={s.hero}>
        <View style={s.heroBlob} />
        <SkeletonBlock width={130} height={12} radius={5} style={{ backgroundColor: 'rgba(255,255,255,0.25)' as any }} />
        <View style={{ height: 12 }} />
        <SkeletonBlock width={180} height={36} radius={9} style={{ backgroundColor: 'rgba(255,255,255,0.3)' as any }} delay={120} />
        <View style={{ height: 14 }} />
        <SkeletonBlock width={110} height={11} radius={5} style={{ backgroundColor: 'rgba(255,255,255,0.22)' as any }} delay={220} />
        <View style={{ height: 12 }} />
        <SkeletonBlock height={7} radius={4} style={{ backgroundColor: 'rgba(255,255,255,0.22)' as any }} delay={300} />
      </View>

      {/* Tiles */}
      <Row style={{ gap: 12, marginBottom: 14 }}>
        {[0, 1].map(i => (
          <Card key={i} style={{ flex: 1 }}>
            <SkeletonBlock width={34} height={34} radius={11} delay={i * 80} />
            <View style={{ height: 12 }} />
            <SkeletonBlock width={90} height={16} radius={6} delay={i * 80 + 80} />
            <View style={{ height: 6 }} />
            <SkeletonBlock width={110} height={11} radius={5} delay={i * 80 + 160} />
          </Card>
        ))}
      </Row>

      {/* Section title */}
      <SkeletonBlock width={120} height={18} radius={6} style={{ marginTop: 6, marginBottom: 14 }} />

      {/* Event cards */}
      {[0, 1, 2].map(i => (
        <Card key={i} style={s.eventCard}>
          <SkeletonBlock width={50} height={54} radius={13} delay={i * 100} />
          <View style={{ flex: 1, gap: 8 }}>
            <SkeletonBlock width={'70%' as any} height={14} radius={6} delay={i * 100 + 60} />
            <Row style={{ gap: 7 }}>
              <SkeletonBlock width={64} height={16} radius={6} delay={i * 100 + 120} />
              <SkeletonBlock width={50} height={11} radius={5} delay={i * 100 + 180} />
            </Row>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <SkeletonBlock width={44} height={10} radius={4} delay={i * 100 + 200} />
            <SkeletonBlock width={56} height={13} radius={6} delay={i * 100 + 260} />
          </View>
        </Card>
      ))}
    </View>
  );
}

export function EventsListSkeleton() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.container, { paddingTop: insets.top + 14 }]}>
      <SkeletonBlock width={120} height={24} radius={8} style={{ marginBottom: 16 }} />

      <Row style={{ gap: 8, marginBottom: 16 }}>
        {[60, 90, 70].map((w, i) => (
          <SkeletonBlock key={i} width={w} height={34} radius={12} delay={i * 80} />
        ))}
      </Row>

      {[0, 1, 2, 3, 4].map(i => (
        <Card key={i} style={s.eventCard}>
          <SkeletonBlock width={50} height={54} radius={13} delay={i * 80} />
          <View style={{ flex: 1, gap: 8 }}>
            <SkeletonBlock width={'72%' as any} height={14} radius={6} delay={i * 80 + 60} />
            <Row style={{ gap: 7 }}>
              <SkeletonBlock width={64} height={16} radius={6} delay={i * 80 + 120} />
              <SkeletonBlock width={84} height={11} radius={5} delay={i * 80 + 180} />
            </Row>
          </View>
          <SkeletonBlock width={56} height={18} radius={7} delay={i * 80 + 200} />
        </Card>
      ))}
    </View>
  );
}

export function CalendarSkeleton() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.container, { paddingTop: insets.top + 14 }]}>
      <Row style={{ justifyContent: 'space-between', marginBottom: 18 }}>
        <SkeletonBlock width={150} height={24} radius={8} />
        <Row style={{ gap: 8 }}>
          <SkeletonBlock width={60} height={32} radius={11} delay={80} />
          <SkeletonBlock width={36} height={36} radius={11} delay={140} />
          <SkeletonBlock width={36} height={36} radius={11} delay={200} />
        </Row>
      </Row>

      <View style={s.calCard}>
        <Row style={{ marginBottom: 8 }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              <SkeletonBlock width={14} height={10} radius={4} delay={i * 30} />
            </View>
          ))}
        </Row>
        {Array.from({ length: 6 }).map((_, w) => (
          <Row key={w} style={{ marginTop: 6 }}>
            {Array.from({ length: 7 }).map((_, d) => (
              <View key={d} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <SkeletonBlock width={34} height={34} radius={11} delay={(w * 7 + d) * 12} />
              </View>
            ))}
          </Row>
        ))}
      </View>

      <Row style={{ justifyContent: 'space-between', marginTop: 24, marginBottom: 14 }}>
        <SkeletonBlock width={150} height={17} radius={6} />
        <SkeletonBlock width={70} height={13} radius={5} delay={80} />
      </Row>

      {[0, 1].map(i => (
        <Card key={i} style={[s.eventCard, { gap: 13 }]}>
          <View style={{ width: 4, height: 56, borderRadius: 3, backgroundColor: BASE }} />
          <View style={{ flex: 1, gap: 8 }}>
            <Row style={{ gap: 7 }}>
              <SkeletonBlock width={64} height={16} radius={6} delay={i * 80} />
              <SkeletonBlock width={90} height={11} radius={5} delay={i * 80 + 60} />
            </Row>
            <SkeletonBlock width={'70%' as any} height={15} radius={6} delay={i * 80 + 120} />
            <SkeletonBlock width={'55%' as any} height={11} radius={5} delay={i * 80 + 180} />
          </View>
        </Card>
      ))}
    </View>
  );
}

export function StudioSkeleton() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.container, { paddingTop: insets.top + 14 }]}>
      <SkeletonBlock width={110} height={24} radius={8} style={{ marginBottom: 16 }} />

      {/* Profile card */}
      <Card style={[s.profileCard]}>
        <SkeletonBlock width={56} height={56} radius={18} />
        <View style={{ flex: 1, gap: 8 }}>
          <SkeletonBlock width={'60%' as any} height={16} radius={6} delay={80} />
          <SkeletonBlock width={'80%' as any} height={12} radius={5} delay={160} />
        </View>
      </Card>

      <SkeletonBlock width={130} height={15} radius={6} style={{ marginBottom: 11, marginTop: 6 }} />

      {/* Members list */}
      <Card style={{ overflow: 'hidden', padding: 0 }}>
        {[0, 1, 2].map(i => (
          <Row
            key={i}
            style={[
              { padding: 13, paddingHorizontal: 16, gap: 13 },
              i < 2 && { borderBottomWidth: 1, borderBottomColor: '#F2F0F8' },
            ]}
          >
            <SkeletonBlock width={40} height={40} radius={20} delay={i * 80} />
            <View style={{ flex: 1, gap: 7 }}>
              <SkeletonBlock width={'55%' as any} height={14} radius={6} delay={i * 80 + 60} />
              <SkeletonBlock width={'35%' as any} height={11} radius={5} delay={i * 80 + 120} />
            </View>
          </Row>
        ))}
      </Card>

      {/* Invite-ish card */}
      <View style={[s.hero, { marginTop: 14 }]}>
        <View style={s.heroBlob} />
        <SkeletonBlock width={160} height={11} radius={5} style={{ backgroundColor: 'rgba(255,255,255,0.25)' as any }} />
        <View style={{ height: 12 }} />
        <SkeletonBlock width={200} height={28} radius={8} style={{ backgroundColor: 'rgba(255,255,255,0.3)' as any }} delay={120} />
        <View style={{ height: 14 }} />
        <SkeletonBlock width={160} height={28} radius={11} style={{ backgroundColor: 'rgba(255,255,255,0.2)' as any }} delay={220} />
      </View>
    </View>
  );
}

export function EventDetailSkeleton() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={[s.detailHero, { paddingTop: insets.top + 14 }]}>
        <Row style={{ justifyContent: 'space-between', paddingHorizontal: 18 }}>
          <SkeletonBlock width={40} height={40} radius={13} style={{ backgroundColor: 'rgba(255,255,255,0.22)' as any }} />
          <SkeletonBlock width={40} height={40} radius={13} style={{ backgroundColor: 'rgba(255,255,255,0.22)' as any }} delay={80} />
        </Row>
        <View style={{ flex: 1 }} />
        <View style={{ paddingHorizontal: 18, paddingBottom: 16, gap: 9 }}>
          <SkeletonBlock width={80} height={20} radius={7} style={{ backgroundColor: 'rgba(255,255,255,0.25)' as any }} delay={100} />
          <SkeletonBlock width={'60%' as any} height={26} radius={8} style={{ backgroundColor: 'rgba(255,255,255,0.3)' as any }} delay={180} />
        </View>
      </View>

      <View style={{ padding: 18, gap: 13 }}>
        <Card style={{ paddingHorizontal: 16 }}>
          {[0, 1, 2].map(i => (
            <Row
              key={i}
              style={[
                { paddingVertical: 12, gap: 13 },
                i > 0 && { borderTopWidth: 1, borderTopColor: '#F2F0F8' },
              ]}
            >
              <SkeletonBlock width={22} height={18} radius={5} delay={i * 80} />
              <SkeletonBlock width={'70%' as any} height={14} radius={6} delay={i * 80 + 60} />
            </Row>
          ))}
        </Card>

        <Card style={s.profileCard}>
          <SkeletonBlock width={46} height={46} radius={14} />
          <View style={{ flex: 1, gap: 7 }}>
            <SkeletonBlock width={'55%' as any} height={15} radius={6} delay={80} />
            <SkeletonBlock width={'40%' as any} height={12} radius={5} delay={140} />
          </View>
          <SkeletonBlock width={46} height={46} radius={14} delay={200} />
        </Card>

        <Card>
          <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
            <SkeletonBlock width={100} height={16} radius={6} />
            <SkeletonBlock width={84} height={18} radius={7} delay={80} />
          </Row>
          <Row style={{ gap: 10, marginBottom: 14 }}>
            {[0, 1, 2].map(i => (
              <View key={i} style={{ flex: 1, gap: 6 }}>
                <SkeletonBlock width={60} height={11} radius={4} delay={i * 60} />
                <SkeletonBlock width={'80%' as any} height={18} radius={6} delay={i * 60 + 80} />
              </View>
            ))}
          </Row>
          <SkeletonBlock height={8} radius={5} delay={300} />
        </Card>
      </View>
    </View>
  );
}

const BLOB_COLOR = 'rgba(255,255,255,0.14)';

const s = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, backgroundColor: COLORS.bg },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 18,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F0EEF7',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  hero: {
    backgroundColor: ACCENT.solid,
    borderRadius: 24,
    padding: 22,
    overflow: 'hidden',
    marginBottom: 14,
  },
  heroBlob: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: BLOB_COLOR,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginBottom: 11,
    padding: 13,
  },
  calCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F0EEF7',
    borderRadius: 22,
    padding: 14,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
  },
  detailHero: {
    height: 200,
    backgroundColor: '#9B7CFF',
    position: 'relative',
  },
});
