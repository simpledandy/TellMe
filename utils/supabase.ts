import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL');
}

if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
