import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { ACCENT, COLORS } from '../../constants/colors';
import { formatINR, getPaidAmount } from '../../constants/helpers';

const METHODS = ['UPI', 'Cash', 'Bank transfer', 'Card'];

type Props = { onClose: () => void; showToast: (m: string) => void };

export default function PaymentSheet({ onClose, showToast }: Props) {
  const { state, dispatch } = useApp();
  const insets = useSafeAreaInsets();

  const ev = (state.events[state.teamId] || []).find(e => e.id === state.openEventId);
  const pend = ev ? ev.total - getPaidAmount(ev.payments) : 0;

  const handleSubmit = () => {
    const amt = parseInt(state.payAmount, 10);
    if (!amt || amt <= 0) { showToast('Enter an amount'); return; }
    dispatch({ type: 'ADD_PAYMENT', eventId: state.openEventId!, amount: amt, method: state.payMethod });
    showToast(`Payment of ${formatINR(amt)} recorded`);
    onClose();
  };

  return (
    <Modal transparent animationType="slide" visible>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>Record payment</Text>
          <Text style={styles.sub}>Pending balance {formatINR(pend)}</Text>

          {/* Amount input */}
          <View style={styles.amtInput}>
            <Text style={styles.rupee}>₹</Text>
            <TextInput
              style={styles.amtField}
              placeholder="0"
              placeholderTextColor={COLORS.textMuted}
              value={state.payAmount}
              onChangeText={v => dispatch({ type: 'SET_PAY_AMOUNT', amount: v.replace(/[^0-9]/g, '') })}
              keyboardType="numeric"
              autoFocus
            />
          </View>

          {/* Method chips */}
          <View style={styles.methods}>
            {METHODS.map(m => {
              const on = state.payMethod === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[styles.methodChip, on && { backgroundColor: ACCENT.soft, borderColor: ACCENT.solid }]}
                  onPress={() => dispatch({ type: 'SET_PAY_METHOD', method: m })}
                >
                  <Text style={[styles.methodText, on && { color: ACCENT.ink }]}>{m}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity onPress={handleSubmit} activeOpacity={0.85} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save payment</Text>
          </TouchableOpacity>
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
  sub: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: COLORS.textMuted, marginTop: 3, marginBottom: 18 },
  amtInput: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F6F5FB', borderWidth: 1.5, borderColor: '#E6E3F0',
    borderRadius: 16, paddingHorizontal: 16, height: 62, marginBottom: 12,
  },
  rupee: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 26, color: COLORS.textMuted },
  amtField: { flex: 1, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 26, color: COLORS.textPrimary, paddingLeft: 8 },
  methods: { flexDirection: 'row', gap: 8, marginBottom: 18, flexWrap: 'wrap' },
  methodChip: {
    flex: 1, textAlign: 'center', paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#F6F5FB', borderWidth: 1.5, borderColor: '#E6E3F0',
    alignItems: 'center',
  },
  methodText: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: COLORS.textSecondary },
  saveBtn: { height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: ACCENT.solid },
  saveBtnText: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 16, color: '#fff' },
});
