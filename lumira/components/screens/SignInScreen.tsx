import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';

const { width } = Dimensions.get('window');

export default function SignInScreen() {
  const { dispatch } = useApp();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#1B0F3B', '#2B1466', '#4B1E8C']}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 0.7, y: 1 }}
    >
      {/* Background blobs */}
      <View style={styles.blobTR} />
      <View style={styles.blobBL} />

      <View style={styles.content}>
        {/* Logo */}
        <LinearGradient colors={['#7C5CFC', '#C13FE8']} style={styles.logoBox}>
          <Text style={styles.logoIcon}>✦</Text>
        </LinearGradient>

        <Text style={styles.appName}>Lumira</Text>
        <Text style={styles.tagline}>
          Run your photography studio — events, team & payments in one calm place.
        </Text>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.googleBtn}
          onPress={() => dispatch({ type: 'SET_SCREEN', screen: 'onboard' })}
          activeOpacity={0.85}
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>
        <Text style={styles.legal}>
          By continuing you agree to our Terms{'\n'}and Privacy Policy.
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
  },
  blobTR: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#C9A6FF',
    opacity: 0.35,
  },
  blobBL: {
    position: 'absolute',
    bottom: -80,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#FFB3C7',
    opacity: 0.3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  logoBox: {
    width: 74,
    height: 74,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoIcon: {
    color: '#fff',
    fontSize: 36,
  },
  appName: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 48,
    color: '#fff',
    letterSpacing: -2,
    lineHeight: 52,
  },
  tagline: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 17,
    color: 'rgba(255,255,255,0.66)',
    marginTop: 14,
    lineHeight: 26,
    maxWidth: 280,
  },
  bottom: {
    paddingBottom: 20,
  },
  googleBtn: {
    height: 58,
    backgroundColor: '#fff',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  googleIcon: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#4285F4',
  },
  googleText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 16,
    color: '#1A1430',
  },
  legal: {
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 18,
    lineHeight: 18,
  },
});
