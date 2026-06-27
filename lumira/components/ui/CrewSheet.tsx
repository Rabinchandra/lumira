import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { ACCENT, COLORS } from '../../constants/colors';
import { initials } from '../../constants/helpers';
import { Assignment } from '../../constants/data';
import { Pressable as AnimPressable } from './anim';
import Icon from './Icon';

type Props = { onClose: () => void; showToast: (m: string) => void };

// Avatar colors cycled through for external crew who have no team color.
const EXT_COLORS = ['#FF6B5E', '#12C9A6', '#2E8BFF', '#F59E0B', '#FF4D8D', '#7C5CFC'];

export default function CrewSheet({ onClose, showToast }: Props) {
  const { state, dispatch } = useApp();
  const insets = useSafeAreaInsets();
  const members = state.teams[state.teamId]?.members || [];
  const ev = (state.events[state.teamId] || []).find(e => e.id === state.openEventId);
  const isMember = (id: string) => members.some(m => m.id === id);

  // Working copy of the team crew, keyed by memberId -> role.
  const [roles, setRoles] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    ev?.assigned.forEach(a => { if (isMember(a.memberId)) init[a.memberId] = a.role; });
    return init;
  });

  // Working copy of external crew (people not on the team).
  const [externals, setExternals] = useState<Assignment[]>(
    () => (ev?.assigned || []).filter(a => !isMember(a.memberId)),
  );
  const [extName, setExtName] = useState('');
  const [extRole, setExtRole] = useState('');

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
        role: extRole.trim() || 'Crew',
        color: EXT_COLORS[prev.length % EXT_COLORS.length],
      },
    ]);
    setExtName('');
    setExtRole('');
  };

  const handleSave = () => {
    const teamAssigned: Assignment[] = members
      .filter(m => m.id in roles)
      .map(m => ({ memberId: m.id, role: (roles[m.id] || '').trim() || 'Crew' }));
    const extAssigned: Assignment[] = externals
      .map(e => ({ ...e, name: (e.name || '').trim(), role: (e.role || '').trim() || 'Crew' }))
      .filter(e => e.name);
    dispatch({ type: 'UPDATE_EVENT_CREW', eventId: ev.id, assigned: [...teamAssigned, ...extAssigned] });
    showToast('Crew updated');
    onClose();
  };

  return (
    <Modal transparent animationType="slide" visible>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 16, maxHeight: '88%' }]}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Edit crew</Text>
            <Text style={styles.sub}>Tap to add or remove. Edit the role for anyone on the team.</Text>

            <Text style={styles.sectionLabel}>Team</Text>
            <View style={styles.list}>
              {members.map(m => {
                const on = m.id in roles;
                return (
                  <View
                    key={m.id}
                    style={[styles.row, on && { borderColor: ACCENT.solid, backgroundColor: ACCENT.soft }]}
                  >
                    <TouchableOpacity style={styles.rowHead} onPress={() => toggle(m.id, m.role)}>
                      <View style={[styles.avatar, { backgroundColor: m.color }]}>
                        <Text style={styles.avatarText}>{initials(m.name)}</Text>
                      </View>
                      <Text style={styles.name}>{m.name}</Text>
                      <View style={[styles.checkbox, on && { backgroundColor: ACCENT.solid, borderColor: ACCENT.solid }]}>
                        {on && <Icon name="check" size={13} color="#fff" strokeWidth={2.6} />}
                      </View>
                    </TouchableOpacity>
                    {on && (
                      <TextInput
                        style={styles.roleInput}
                        placeholder="Role on this day"
                        placeholderTextColor={COLORS.textMuted}
                        value={roles[m.id]}
                        onChangeText={v => setRoles(prev => ({ ...prev, [m.id]: v }))}
                      />
                    )}
                  </View>
                );
              })}
            </View>

            <Text style={styles.sectionLabel}>External crew</Text>
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
                    <TextInput
                      style={styles.roleInput}
                      placeholder="Role on this day"
                      placeholderTextColor={COLORS.textMuted}
                      value={e.role}
                      onChangeText={v => setExternals(prev => prev.map((x, i) => i === idx ? { ...x, role: v } : x))}
                    />
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
              <TextInput
                style={styles.extInput}
                placeholder="Role (optional)"
                placeholderTextColor={COLORS.textMuted}
                value={extRole}
                onChangeText={setExtRole}
                onSubmitEditing={addExternal}
              />
              <TouchableOpacity
                style={[styles.addExtBtn, !extName.trim() && { opacity: 0.4 }]}
                onPress={addExternal}
                disabled={!extName.trim()}
              >
                <Icon name="plus" size={16} color="#fff" strokeWidth={2.6} />
                <Text style={styles.addExtBtnText}>Add external crew</Text>
              </TouchableOpacity>
            </View>

            <AnimPressable onPress={handleSave} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save crew</Text>
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
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
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
