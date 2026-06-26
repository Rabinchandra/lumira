import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = { message: string; bottomOffset?: number };

export default function Toast({ message, bottomOffset = 96 }: Props) {
  return (
    <View style={[styles.toast, { bottom: bottomOffset }]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#1A1430',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    zIndex: 100,
  },
  text: { fontFamily: 'DMSans_600SemiBold', fontSize: 13.5, color: '#fff' },
});
