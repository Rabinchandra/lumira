import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { ACCENT } from '../../constants/colors';

const MUTED = '#B3ABC8';

type Props = { openNewSheet: () => void };

export default function BottomNav({ openNewSheet }: Props) {
  const { state, dispatch } = useApp();
  const insets = useSafeAreaInsets();
  const tab = state.tab;

  const navColor = (t: string) => (tab === t ? ACCENT.solid : MUTED);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Home */}
      <TouchableOpacity style={styles.navItem} onPress={() => dispatch({ type: 'SET_TAB', tab: 'dashboard' })}>
        <HomeIcon color={navColor('dashboard')} />
        <Text style={[styles.navLabel, { color: navColor('dashboard') }]}>Home</Text>
      </TouchableOpacity>

      {/* Calendar */}
      <TouchableOpacity style={styles.navItem} onPress={() => dispatch({ type: 'SET_TAB', tab: 'calendar' })}>
        <CalIcon color={navColor('calendar')} />
        <Text style={[styles.navLabel, { color: navColor('calendar') }]}>Calendar</Text>
      </TouchableOpacity>

      {/* FAB */}
      <View style={styles.fabWrapper}>
        <TouchableOpacity onPress={openNewSheet} activeOpacity={0.85}>
          <LinearGradient colors={ACCENT.grad} style={styles.fab}>
            <Text style={styles.fabPlus}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Events */}
      <TouchableOpacity style={styles.navItem} onPress={() => dispatch({ type: 'SET_TAB', tab: 'events' })}>
        <ListIcon color={navColor('events')} />
        <Text style={[styles.navLabel, { color: navColor('events') }]}>Events</Text>
      </TouchableOpacity>

      {/* Studio */}
      <TouchableOpacity style={styles.navItem} onPress={() => dispatch({ type: 'SET_TAB', tab: 'studio' })}>
        <ProfileIcon color={navColor('studio')} />
        <Text style={[styles.navLabel, { color: navColor('studio') }]}>Studio</Text>
      </TouchableOpacity>
    </View>
  );
}

function HomeIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, color }}>⌂</Text>
    </View>
  );
}
function CalIcon({ color }: { color: string }) {
  return <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 16, color }}>📅</Text></View>;
}
function ListIcon({ color }: { color: string }) {
  return <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 16, color }}>☰</Text></View>;
}
function ProfileIcon({ color }: { color: string }) {
  return <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 16, color }}>👤</Text></View>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: '#EEEBF6',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 11,
    paddingHorizontal: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 10.5,
  },
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  fabPlus: {
    fontSize: 28,
    color: '#fff',
    lineHeight: 32,
  },
});
