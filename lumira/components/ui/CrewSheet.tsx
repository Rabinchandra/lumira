import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Pressable, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { ACCENT, COLORS } from '../../constants/colors';
import { initials } from '../../constants/helpers';
import { Assignment } from '../../constants/data';
import { Pressable as AnimPressable } from './anim';
import Icon from './Icon';
import { api } from '../../lib/api';

type Props = { onClose: () => void; showToast: (m: string) => void };

// Avatar colors cycled through for external crew who have no team color.
const EXT_COLORS = ['#FF6B5E', '#12C9A6', '#2E8BFF', '#F59E0B', '#FF4D8D', '#7C5CFC'];

export default function CrewSheet({ onClose, showToast }: Props) {
  const { state, refreshEvent, pickRoleId } = useApp();
  const insets = useSafeAreaInsets();
  const [saving, setSaving] = useState(false);
  const members = state.teams[state.teamId]?.members || [];
  const ev = (state.events[state.teamId] || []).find(e => e.id === state.openEventId);
  const isMember = (id: string) => members.some(m => m.id === id);
  const roleOptions = state.roles;
  const defaultRoleName = roleOptions[0]?.name ?? 'Crew';

  const stripOwner = (role: string) => role.replace(/^Owner\s*·\s*/, '');

  // Working copy of the team crew, keyed by memberId -> role.
  const [roles, setRoles] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    ev?.assigned.forEach(a => { if (isMember(a.memberId)) init[a.memberId] = stripOwner(a.role); });
    return init;
  });

  // Working copy of external crew (people not on the team).
  const [externals, setExternals] = useState<Assignment[]>(
    () => (ev?.assigned || []).filter(a => !isMember(a.memberId)).map(a => ({ ...a, role: stripOwner(a.role) })),
  );
  const [extName, setExtName] = useState('');
  const [extRole, setExtRole] = useState(defaultRoleName);

  if (!ev) return null;

  const toggle = (id: string, defaultRole: string) =>
    setRoles(prev => {
      if (id in prev) {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: defaultRole };
    });

  const addExternal = () => {
    const name = extName.trim();
    if (!name) return;
    setExternals(prev => [
      ...prev,
      {
        memberId: `ext-${Date.now()}-${prev.length}`,
        name,
        role: extRole.trim() || defaultRoleName,
        color: EXT_COLORS[prev.length % EXT_COLORS.length],
      },
    ]);
    setExtName('');
    setExtRole(defaultRoleName);
  };

  const handleSave = async () => {
    if (saving) return;
    if (!ev) return;
    const list: Array<{ member_id?: string | null; role_id: string; external_name?: string | null }> = [];
    for (const m of members) {
      if (m.id in roles) {
        const roleName = (roles[m.id] || '').trim() || 'Crew';
        const role_id = pickRoleId(roleName);
        if (role_id) list.push({ member_id: m.id, role_id });
      }
    }
    for (const e of externals) {
      const name = (e.name || '').trim();
      if (!name) continue;
      const roleName = (e.role || '').trim() || 'Crew';
      const role_id = pickRoleId(roleName);
      if (role_id) list.push({ external_name: name, role_id });
    }
    const expected =
      Object.keys(roles).length + externals.filter(e => (e.name || '').trim()).length;
    if (expected > 0 && list.length === 0) {
      showToast('Could not resolve a role — try again');
      return;
    }
    setSaving(true);
    try {
      await api.setAssignments(ev.id, list);
      await refreshEvent(ev.id);
      showToast('Crew updated');
      onClose();
    } catch (err: any) {
      console.error('setAssignments failed', err);
      showToast(err?.message || 'Could not save crew');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal transparent animationType="slide" visible>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 16, maxHeight: '88%' }]}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Edit crew</Text>
            <Text style={styles.sub}>Tap to add or remove. Set a role for anyone you include.</Text>

            <Text style={styles.sectionLabel}>Team</Text>
            <View style={styles.list}>
              {members.map(m => {
                const on = m.id in roles;
                return (
                  <View
                    key={m.id}
                    style={[styles.row, on && { borderColor: ACCENT.solid, backgroundColor: ACCENT.soft }]}
                  >
                    <TouchableOpacity style={styles.rowHead} onPress={() => toggle(m.id, stripOwner(m.role))}>
                      <View style={[styles.avatar, { backgroundColor: m.color }]}>
                        {m.photoUrl
                          ? <Image source={{ uri: m.photoUrl }} style={styles.avatarImg} />
                          : <Text style={styles.avatarText}>{initials(m.name)}</Text>}
                      </View>
                      <Text style={styles.name}>{m.name}</Text>
                      <View style={[styles.checkbox, on && { backgroundColor: ACCENT.solid, borderColor: ACCENT.solid }]}>
                        {on && <Icon name="check" size={13} color="#fff" strokeWidth={2.6} />}
                      </View>
                    </TouchableOpacity>
                    {on && (
                      <View style={styles.roleChips}>
                        {roleOptions.map(r => {
                          const active = roles[m.id] === r.name;
                          return (
                            <TouchableOpacity
                              key={r.id}
                              style={[styles.roleChip, active && styles.roleChipActive]}
                              onPress={() => setRoles(prev => ({ ...prev, [m.id]: r.name }))}
                            >
                              <Text style={[styles.roleChipText, active && styles.roleChipTextActive]}>{r.name}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>External crew</Text>
            <Text style={styles.sectionHint}>Add freelancers or guests who aren't on your team.</Text>

            {externals.length > 0 && (
              <View style={styles.list}>
                {externals.map((e, idx) => (
                  <View key={e.memberId} style={[styles.row, { borderColor: ACCENT.solid, backgroundColor: ACCENT.soft }]}>
                    <View style={styles.rowHead}>
                      <View style={[styles.avatar, { backgroundColor: e.color || '#9C95B4' }]}>
                        <Text style={styles.avatarText}>{initials(e.name || '')}</Text>
                      </View>
                      <Text style={styles.name}>{e.name}</Text>
                      <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => setExternals(prev => prev.filter((_, i) => i !== idx))}
                      >
                        <Icon name="close" size={15} color={COLORS.red} strokeWidth={2.2} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.roleChips}>
                      {roleOptions.map(r => {
                        const active = e.role === r.name;
                        return (
                          <TouchableOpacity
                            key={r.id}
                            style={[styles.roleChip, active && styles.roleChipActive]}
                            onPress={() => setExternals(prev => prev.map((x, i) => i === idx ? { ...x, role: r.name } : x))}
                          >
                            <Text style={[styles.roleChipText, active && styles.roleChipTextActive]}>{r.name}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.extForm}>
              <TextInput
                style={styles.extInput}
                placeholder="Name"
                placeholderTextColor={COLORS.textMuted}
                value={extName}
                onChangeText={setExtName}
              />
              <View style={styles.roleChips}>
                {roleOptions.map(r => {
                  const active = extRole === r.name;
                  return (
                    <TouchableOpacity
                      key={r.id}
                      style={[styles.roleChip, active && styles.roleChipActive]}
                      onPress={() => setExtRole(r.name)}
                    >
                      <Text style={[styles.roleChipText, active && styles.roleChipTextActive]}>{r.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity
                style={[styles.addExtBtn, !extName.trim() && { opacity: 0.4 }]}
                onPress={addExternal}
                disabled={!extName.trim()}
              >
                <Icon name="plus" size={16} color="#fff" strokeWidth={2.6} />
                <Text style={styles.addExtBtnText}>Add external crew</Text>
              </TouchableOpacity>
            </View>

            <AnimPressable onPress={handleSave} disabled={saving} style={styles.saveBtn}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save crew</Text>}
            </AnimPressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(20,12,45,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingTop: 8 },
  handle: { width: 38, height: 4, borderRadius: 3, backgroundColor: '#E2DEEE', alignSelf: 'center', marginBottom: 16 },
  title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: COLORS.textPrimary },
  sub: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: COLORS.textMuted, marginTop: 4, marginBottom: 16 },
  sectionLabel: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },
  sectionHint: { fontFamily: 'DMSans_400Regular', fontSize: 12.5, color: COLORS.textMuted, marginTop: -6, marginBottom: 12 },
  list: { gap: 9 },
  row: { borderRadius: 14, borderWidth: 1.5, borderColor: '#E6E3F0', backgroundColor: '#fff', padding: 10 },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: 38, height: 38, borderRadius: 19 },
  avatarText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#fff' },
  name: { flex: 1, fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14.5, color: COLORS.textPrimary },
  checkbox: {
    width: 24, height: 24, borderRadius: 8, borderWidth: 1.5, borderColor: '#D8D3E6',
    alignItems: 'center', justifyContent: 'center',
  },
  checkMark: { fontSize: 13, color: '#fff', fontWeight: 'bold' },
  roleInput: {
    marginTop: 10, height: 42, borderRadius: 11, borderWidth: 1.5, borderColor: '#E6E3F0',
    backgroundColor: '#fff', paddingHorizontal: 13, fontFamily: 'DMSans_400Regular',
    fontSize: 14, color: COLORS.textPrimary,
  },
  roleChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  roleChip: {
    paddingHorizontal: 12, height: 32, borderRadius: 10, borderWidth: 1.5,
    borderColor: '#E6E3F0', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  roleChipActive: { borderColor: ACCENT.solid, backgroundColor: ACCENT.solid },
  roleChipText: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 13, color: COLORS.textSecondary },
  roleChipTextActive: { color: '#fff' },
  removeBtn: {
    width: 30, height: 30, borderRadius: 10, backgroundColor: '#FFEDEA',
    alignItems: 'center', justifyContent: 'center',
  },
  extForm: { marginTop: 12, gap: 9 },
  extInput: {
    height: 46, borderRadius: 12, borderWidth: 1.5, borderColor: '#E6E3F0',
    backgroundColor: '#fff', paddingHorizontal: 14, fontFamily: 'DMSans_400Regular',
    fontSize: 14.5, color: COLORS.textPrimary,
  },
  addExtBtn: {
    height: 48, borderRadius: 13, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 7, backgroundColor: ACCENT.solid,
  },
  addExtBtnText: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14.5, color: '#fff' },
  saveBtn: {
    marginTop: 20, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    backgroundColor: ACCENT.solid,
  },
  saveBtnText: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 16, color: '#fff' },
});
