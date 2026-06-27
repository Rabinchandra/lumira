import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { FadeInUp, Pressable } from '../ui/anim';

export default function OnboardScreen() {
  const { dispatch } = useApp();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 30 }]}>
        {/* User avatar row */}
        <FadeInUp index={0} style={styles.userRow}>
          <LinearGradient colors={['#7C5CFC', '#C13FE8']} style={styles.avatar}>
            <Text style={styles.avatarText}>AM</Text>
          </LinearGradient>
          <View>
            <Text style={styles.signedInAs}>Signed in as</Text>
            <Text style={styles.userName}>Aanya Mehra</Text>
          </View>
        </FadeInUp>

        <FadeInUp index={1}>
          <Text style={styles.heading}>Let's get your{'\n'}studio set up</Text>
        </FadeInUp>
        <FadeInUp index={2}>
          <Text style={styles.sub}>Create a new studio or join your team with an invite code.</Text>
        </FadeInUp>

        {/* Create card */}
        <FadeInUp index={3}>
          <Pressable onPress={() => dispatch({ type: 'SET_SCREEN', screen: 'create' })}>
            <LinearGradient colors={['#7C5CFC', '#C13FE8']} style={styles.createCard}>
              <View style={styles.cardIconBox}>
                <Text style={styles.cardIcon}>＋</Text>
              </View>
              <Text style={styles.cardTitle}>Create a studio</Text>
              <Text style={styles.cardSub}>Start fresh and invite your team</Text>
            </LinearGradient>
          </Pressable>
        </FadeInUp>

        {/* Join card */}
        <FadeInUp index={4}>
          <Pressable
            style={styles.joinCard}
            onPress={() => dispatch({ type: 'SET_SCREEN', screen: 'join' })}
          >
            <View style={styles.joinIconBox}>
              <Text style={styles.joinIcon}>↗</Text>
            </View>
            <Text style={styles.joinTitle}>Join with code</Text>
            <Text style={styles.joinSub}>Enter a 6-character invite code</Text>
          </Pressable>
        </FadeInUp>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16103A',
  },
  scroll: {
    padding: 24,
    paddingTop: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 34,
    marginTop: 8,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#fff',
  },
  signedInAs: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
  },
  userName: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 17,
    color: '#fff',
  },
  heading: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 30,
    color: '#fff',
    letterSpacing: -1,
    lineHeight: 36,
    marginBottom: 8,
  },
  sub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 30,
  },
  createCard: {
    borderRadius: 22,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 10,
  },
  cardIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 22,
    color: '#fff',
  },
  cardTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 19,
    color: '#fff',
  },
  cardSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 4,
  },
  joinCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 22,
    padding: 22,
  },
  joinIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  joinIcon: {
    fontSize: 22,
    color: '#fff',
  },
  joinTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 19,
    color: '#fff',
  },
  joinSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
});
