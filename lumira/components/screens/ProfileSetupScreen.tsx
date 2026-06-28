import React, { useState } from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FadeInUp, PopIn, Pressable } from '../ui/anim';
import Icon from '../ui/Icon';
import { supabase } from '../../lib/supabase';
import { pickAndUploadAvatar, saveProfile } from '../../lib/profile';
import { api } from '../../lib/api';
import { useApp } from '../../context/AppContext';

export default function ProfileSetupScreen() {
  const insets = useSafeAreaInsets();
  const { dispatch } = useApp();
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);

  const onPickPhoto = async () => {
    if (uploadingPhoto || loading) return;
    setUploadingPhoto(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw error ?? new Error('Not signed in.');
      const url = await pickAndUploadAvatar(data.user.id);
      if (url) setPhotoUrl(url);
    } catch (e: any) {
      Alert.alert('Could not add photo', e?.message ?? 'Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const onContinue = async () => {
    if (!displayName.trim()) {
      Alert.alert('Display name required', 'Enter the name your teammates will see.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Phone number required', 'Enter a phone number so your team can reach you.');
      return;
    }
    setLoading(true);
    try {
      // Persist to backend (source of truth) and mirror to auth metadata for convenience.
      await api.upsertMyProfile({
        display_name: displayName.trim(),
        phone: phone.trim(),
        avatar_url: photoUrl,
      });
      await saveProfile({ displayName: displayName.trim(), phone: phone.trim(), photoUrl });
      dispatch({ type: 'SET_SCREEN', screen: 'onboard' });
    } catch (e: any) {
      Alert.alert('Could not save', e?.message ?? 'Please try again.');
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1B0F3B', '#2B1466', '#4B1E8C']}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 0.7, y: 1 }}
    >
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
          <FadeInUp delay={80} style={styles.top}>
            <PopIn delay={120}>
              <Image
                source={require('../../assets/lumira_logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </PopIn>
            <Text style={styles.heading}>One last thing</Text>
            <Text style={styles.sub}>
              Add your display name and phone number so your teammates know who you are.
            </Text>
          </FadeInUp>

          <FadeInUp delay={260} style={styles.form}>
            <Pressable style={styles.avatarPicker} onPress={onPickPhoto} disabled={loading}>
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.avatar} />
              ) : (
                <LinearGradient colors={['#7C5CFC', '#C13FE8']} style={styles.avatar}>
                  {uploadingPhoto ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Icon name="plus" size={26} color="#fff" strokeWidth={2.4} />
                  )}
                </LinearGradient>
              )}
              <Text style={styles.avatarHint}>
                {uploadingPhoto ? 'Uploading…' : photoUrl ? 'Change photo' : 'Add a photo'}
              </Text>
            </Pressable>

            <Text style={styles.label}>Display name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Aanya Mehra"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              autoCorrect={false}
              textContentType="name"
              editable={!loading}
            />

            <Text style={[styles.label, { marginTop: 8 }]}>Phone number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. +91 98765 43210"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              editable={!loading}
              onSubmitEditing={onContinue}
              returnKeyType="go"
            />

            <Pressable style={styles.submitBtn} onPress={onContinue} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#1A1430" />
              ) : (
                <Text style={styles.submitText}>Continue</Text>
              )}
            </Pressable>
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
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  top: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 20,
    marginBottom: 28,
  },
  heading: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 36,
    color: '#fff',
    letterSpacing: -1.2,
    lineHeight: 40,
    marginBottom: 10,
  },
  sub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.62)',
    lineHeight: 24,
    maxWidth: 300,
  },
  form: {
    paddingBottom: 12,
  },
  avatarPicker: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  avatarHint: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 10,
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 8,
    letterSpacing: 0.3,
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
  submitBtn: {
    height: 58,
    backgroundColor: '#fff',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
});
