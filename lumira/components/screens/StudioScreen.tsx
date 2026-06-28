import React, { useState, useCallback } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { signOut } from '../../lib/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { ACCENT, COLORS } from '../../constants/colors';
import { initials } from '../../constants/helpers';
import { SheetType } from './AppShell';
import { FadeInUp, Pressable } from '../ui/anim';
import Icon from '../ui/Icon';
import { StudioSkeleton } from '../ui/Skeleton';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { pickAndUploadAvatar, saveProfile } from '../../lib/profile';

type Props = { openSheet: (s: SheetType, extra?: any) => void; showToast: (m: string) => void };

export default function StudioScreen({ openSheet, showToast }: Props) {
  const { state, dispatch, reloadTeams } = useApp();
  const insets = useSafeAreaInsets();
  const team = state.teams[state.teamId];
  const [regenBusy, setRegenBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await reloadTeams(); } finally { setRefreshing(false); }
  }, [reloadTeams]);
  if (!team || state.loadingTeams) return <StudioSkeleton />;
  const isOwner = team.userRole === 'Owner';
  const inviteCode = team.inviteCode;
  const profile = state.profile;
  const profileName = profile?.displayName || profile?.email || 'You';
  const profileInitials = (initials(profileName) || profileName.slice(0, 2)).toUpperCase();

  const handleRegenCode = async () => {
    if (regenBusy) return;
    setRegenBusy(true);
    try {
      await api.regenerateCode(team.id);
      await reloadTeams();
      showToast('New code generated');
    } catch (e: any) {
      showToast(e?.message || 'Could not regenerate');
    } finally {
      setRegenBusy(false);
    }
  };

  const handleChangePhoto = async () => {
    if (uploadingPhoto || !profile) return;
    setUploadingPhoto(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw error ?? new Error('Not signed in.');
      const url = await pickAndUploadAvatar(data.user.id);
      if (!url) return;
      await api.upsertMyProfile({
        display_name: profile.displayName,
        phone: profile.phone,
        avatar_url: url,
      });
      await saveProfile({ displayName: profile.displayName, phone: profile.phone, photoUrl: url });
      dispatch({
        type: 'SET_PROFILE',
        profile: { ...profile, photoUrl: url },
        userId: state.userId,
      });
      await reloadTeams();
      showToast('Profile photo updated');
    } catch (e: any) {
      Alert.alert('Could not update photo', e?.message ?? 'Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCopyCode = () => {
    showToast('Code copied to clipboard');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 14, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C5CFC" />}
      >
        <FadeInUp index={0}>
          <Text style={styles.heading}>Studio</Text>
        </FadeInUp>

        {/* User profile card */}
        <FadeInUp index={1} style={styles.profileCard}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleChangePhoto}
            disabled={uploadingPhoto}
            style={styles.avatarWrap}
          >
            {profile?.photoUrl ? (
              <Image source={{ uri: profile.photoUrl }} style={styles.profileAvatar} />
            ) : (
              <View style={[styles.profileAvatar, { backgroundColor: ACCENT.solid }]}>
                <Text style={styles.profileAvatarText}>{profileInitials}</Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              {uploadingPhoto ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Icon name="edit" size={12} color="#fff" strokeWidth={2.4} />
              )}
            </View>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{profileName}</Text>
            <Text style={styles.profileEmail}>{profile?.email || ''}</Text>
            <TouchableOpacity onPress={handleChangePhoto} disabled={uploadingPhoto}>
              <Text style={styles.changePhotoLink}>
                {uploadingPhoto ? 'Uploading…' : profile?.photoUrl ? 'Change photo' : 'Add a photo'}
              </Text>
            </TouchableOpacity>
          </View>
        </FadeInUp>

        {/* Team members */}
        <FadeInUp index={2}>
          <Text style={styles.sectionTitle}>{team.name}</Text>
        </FadeInUp>
        <FadeInUp index={3} style={styles.card}>
          {team.members.map((m, i) => (
            <View
              key={m.id}
              style={[styles.memberRow, i < team.members.length - 1 && styles.memberBorder]}
            >
              <View style={[styles.memberAvatar, { backgroundColor: m.color, overflow: 'hidden' }]}>
                {m.photoUrl
                  ? <Image source={{ uri: m.photoUrl }} style={styles.memberAvatarImg} />
                  : <Text style={styles.memberAvatarText}>{initials(m.name)}</Text>}
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{m.name}</Text>
                <Text style={styles.memberRole}>{m.role}</Text>
              </View>
              {m.isMe && (
                <View style={[styles.youBadge, { backgroundColor: ACCENT.soft }]}>
                  <Text style={[styles.youText, { color: ACCENT.ink }]}>You</Text>
                </View>
              )}
            </View>
          ))}
        </FadeInUp>

        {/* Invite code (owner only) */}
        {isOwner && (
          <FadeInUp index={4}>
          <View style={styles.inviteCard}>
            <View style={styles.inviteBlob} />
            <View style={styles.inviteContent}>
              <Text style={styles.inviteLabel}>Invite code · expires in 7 days</Text>
              <View style={styles.inviteCodeRow}>
                <Text style={styles.inviteCode}>{inviteCode}</Text>
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopyCode}>
                  <Text style={styles.copyIcon}>⎘</Text>
                </TouchableOpacity>
              </View>
              <Pressable style={styles.regenBtn} onPress={handleRegenCode}>
                <Text style={styles.regenText}>↺  Generate new code</Text>
              </Pressable>
            </View>
          </View>
          </FadeInUp>
        )}

        {/* Your studios */}
        <FadeInUp index={5}>
          <Text style={styles.sectionTitle}>Your studios</Text>
        </FadeInUp>
        <FadeInUp index={6} style={styles.card}>
          {Object.values(state.teams).map((t, i, arr) => {
            const active = t.id === state.teamId;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.teamRow, i < arr.length - 1 && styles.memberBorder]}
                onPress={() => {
                  dispatch({ type: 'SET_TEAM', teamId: t.id });
                  showToast(`Switched to ${t.name}`);
                }}
              >
                <View style={[styles.teamAvatar, { backgroundColor: t.color }]}>
                  <Text style={styles.teamAvatarText}>{t.initials}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{t.name}</Text>
                  <Text style={styles.memberRole}>{t.userRole}</Text>
                </View>
                {active && (
                  <View style={[styles.checkCircle, { backgroundColor: ACCENT.solid }]}>
                    <Icon name="check" size={13} color="#fff" strokeWidth={2.6} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </FadeInUp>

        {/* Sign out */}
        <FadeInUp index={7}>
          <Pressable
            style={styles.signOutBtn}
            onPress={async () => {
              try { await signOut(); } catch (e: any) { Alert.alert('Sign out failed', e?.message ?? ''); }
              dispatch({ type: 'SIGN_OUT' });
            }}
          >
            <Icon name="logout" size={18} color={COLORS.red} strokeWidth={2.1} />
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </FadeInUp>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 18 },
  heading: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: COLORS.textPrimary, letterSpacing: -0.5, marginBottom: 16 },

  profileCard: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#F0EEF7',
    borderRadius: 22, padding: 18, flexDirection: 'row', alignItems: 'center',
    gap: 14, marginBottom: 22,
  },
  avatarWrap: { position: 'relative' },
  profileAvatar: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  profileAvatarText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#fff' },
  avatarEditBadge: {
    position: 'absolute', right: -2, bottom: -2,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: ACCENT.solid,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  profileName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: COLORS.textPrimary },
  profileEmail: { fontFamily: 'DMSans_400Regular', fontSize: 13.5, color: COLORS.textMuted },
  changePhotoLink: { fontFamily: 'DMSans_600SemiBold', fontSize: 12.5, color: ACCENT.ink, marginTop: 4 },

  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: COLORS.textPrimary, marginBottom: 11 },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#F0EEF7', borderRadius: 20, overflow: 'hidden', marginBottom: 14 },

  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 13, paddingHorizontal: 16 },
  memberBorder: { borderBottomWidth: 1, borderBottomColor: '#F2F0F8' },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  memberAvatarImg: { width: 40, height: 40, borderRadius: 20 },
  memberAvatarText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#fff' },
  memberInfo: { flex: 1 },
  memberName: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14.5, color: COLORS.textPrimary },
  memberRole: { fontFamily: 'DMSans_400Regular', fontSize: 12.5, color: COLORS.textMuted },
  youBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 7 },
  youText: { fontFamily: 'DMSans_600SemiBold', fontSize: 11 },

  inviteCard: { backgroundColor: ACCENT.solid, borderRadius: 20, padding: 18, marginBottom: 14, overflow: 'hidden' },
  inviteBlob: {
    position: 'absolute', bottom: -30, right: -20,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  inviteContent: { position: 'relative' },
  inviteLabel: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.82)' },
  inviteCodeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  inviteCode: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 30, color: '#fff', letterSpacing: 5 },
  copyBtn: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  copyIcon: { fontSize: 18, color: '#fff' },
  regenBtn: {
    marginTop: 14, backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 13, paddingVertical: 8, borderRadius: 11, alignSelf: 'flex-start',
  },
  regenText: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: '#fff' },

  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 13, paddingHorizontal: 16 },
  teamAvatar: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  teamAvatarText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#fff' },
  checkCircle: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  checkMark: { fontSize: 12, color: '#fff', fontWeight: 'bold' },

  signOutBtn: {
    marginTop: 4, height: 52, borderRadius: 16, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#F0EEF7', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 9,
  },
  signOutIcon: { fontSize: 18, color: COLORS.red },
  signOutText: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 15, color: COLORS.red },
});
