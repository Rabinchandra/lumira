import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

const AVATAR_BUCKET = 'avatars';

export type Profile = {
  displayName: string;
  phone: string;
  photoUrl: string | null;
  email: string;
};

export function profileFromUser(
  user: { email?: string | null; user_metadata?: Record<string, any> } | null,
): Profile {
  const meta = user?.user_metadata ?? {};
  return {
    displayName: meta.display_name ?? '',
    phone: meta.phone ?? '',
    photoUrl: meta.photo_url ?? null,
    email: user?.email ?? '',
  };
}

// Opens the photo library, uploads the chosen image to Storage, and returns its
// public URL. Returns null if the user cancels or denies permission.
export async function pickAndUploadAvatar(userId: string): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('Permission needed', 'Allow photo library access to choose a profile picture.');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
    base64: true,
  });
  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  if (!asset.base64) throw new Error('Could not read the selected image.');

  const contentType = asset.mimeType ?? 'image/jpeg';
  const ext = contentType.split('/')[1] ?? 'jpg';
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, decode(asset.base64), { contentType, upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  // Cache-bust so a re-uploaded avatar at the same path refreshes in the UI.
  return `${data.publicUrl}?v=${Date.now()}`;
}

export async function saveProfile(input: {
  displayName: string;
  phone: string;
  photoUrl: string | null;
}) {
  const { error } = await supabase.auth.updateUser({
    data: {
      display_name: input.displayName,
      phone: input.phone,
      photo_url: input.photoUrl,
    },
  });
  if (error) throw error;
}
