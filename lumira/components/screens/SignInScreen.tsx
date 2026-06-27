import React, { useState } from 'react';
import { Text, StyleSheet, Animated, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FadeInUp, PopIn, Pressable, useFloat } from '../ui/anim';
import { signInWithGoogle } from '../../lib/auth';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const onGoogle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      Alert.alert('Sign-in failed', e?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const floatTR = useFloat(20, 3600);
  const floatBL = useFloat(-22, 4200, 600);

  return (
    <LinearGradient
      colors={['#1B0F3B', '#2B1466', '#4B1E8C']}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 0.7, y: 1 }}
    >
      {/* Background blobs — gently floating */}
      <Animated.View style={[styles.blobTR, { transform: [{ translateY: floatTR }] }]} />
      <Animated.View style={[styles.blobBL, { transform: [{ translateY: floatBL }] }]} />

      <Animated.View style={styles.content}>
        {/* Logo */}
        <PopIn delay={120}>
          <LinearGradient colors={['#7C5CFC', '#C13FE8']} style={styles.logoBox}>
            <Text style={styles.logoIcon}>✦</Text>
          </LinearGradient>
        </PopIn>

        <FadeInUp delay={300}>
          <Text style={styles.appName}>Lumira</Text>
        </FadeInUp>
        <FadeInUp delay={420}>
          <Text style={styles.tagline}>
            Run your photography studio — events, team & payments in one calm place.
          </Text>
        </FadeInUp>
      </Animated.View>

      <FadeInUp delay={560} style={styles.bottom}>
        <Pressable style={styles.googleBtn} onPress={onGoogle} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#1A1430" />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </>
          )}
        </Pressable>
        <Text style={styles.legal}>
          By continuing you agree to our Terms{'\n'}and Privacy Policy.
        </Text>
      </FadeInUp>
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
