import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

export async function signUpWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  return data;
}

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function clearAuthStorage() {
  await supabase.auth.signOut({ scope: 'local' });
  const keys = await AsyncStorage.getAllKeys();
  const authKeys = keys.filter(
    (k) => k.startsWith('sb-') || k.includes('supabase'),
  );
  if (authKeys.length) await AsyncStorage.multiRemove(authKeys);
}
