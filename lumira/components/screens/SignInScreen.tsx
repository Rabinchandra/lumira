import React, { useState } from 'react';
import { Text, View, StyleSheet, Animated, ActivityIndicator, Alert, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FadeInUp, PopIn, Pressable, useFloat } from '../ui/anim';
import Icon from '../ui/Icon';
import { signInWithPassword, signUpWithPassword, clearAuthStorage } from '../../lib/auth';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async () => {
    if (loading) return;
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Enter both your email and password.');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      Alert.alert('Weak password', 'Use at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const data = await signUpWithPassword(email, password);
        if (!data.session) {
          Alert.alert('Account created', 'You can now sign in with your email and password.');
          setMode('signin');
        }
      } else {
        await signInWithPassword(email, password);
      }
    } catch (e: any) {
      Alert.alert(mode === 'signup' ? 'Sign-up failed' : 'Sign-in failed', e?.message ?? 'Please try again.');
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

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="rgba(255,255,255,0.45)"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            editable={!loading}
          />
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="rgba(255,255,255,0.45)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              editable={!loading}
              onSubmitEditing={onSubmit}
              returnKeyType="go"
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(v => !v)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="rgba(255,255,255,0.55)" />
            </TouchableOpacity>
          </View>
          <Pressable style={styles.submitBtn} onPress={onSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#1A1430" />
            ) : (
              <Text style={styles.submitText}>
                {mode === 'signup' ? 'Create account' : 'Sign in'}
              </Text>
            )}
          </Pressable>
          <Pressable
            style={styles.toggleBtn}
            onPress={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
            disabled={loading}
          >
            <Text style={styles.toggleText}>
              {mode === 'signup'
                ? 'Already have an account? Sign in'
                : "Don't have an account? Create one"}
            </Text>
          </Pressable>
          {__DEV__ && (
            <Pressable
              style={styles.devBtn}
              onPress={async () => {
                await clearAuthStorage();
                Alert.alert('Cleared', 'Auth storage cleared.');
              }}
            >
              <Text style={styles.devText}>DEV: Clear auth storage</Text>
            </Pressable>
          )}
        </FadeInUp>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
  },
  flex: {
    flex: 1,
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  content: {
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 40,
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
  input: {
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 18,
    marginBottom: 14,
    color: '#fff',
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    marginBottom: 14,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 18,
    color: '#fff',
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    height: 58,
    backgroundColor: '#fff',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  submitText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 16,
    color: '#1A1430',
  },
  toggleBtn: {
    alignItems: 'center',
    marginTop: 18,
  },
  toggleText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  devBtn: {
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 8,
  },
  devText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: 'rgba(255,100,100,0.7)',
  },
});
