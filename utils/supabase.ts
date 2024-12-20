import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dsfqnxuodizieqkmikoq.supabase.co';
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzZnFueHVvZGl6aWVxa21pa29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NjYzNTIsImV4cCI6MjA1MDI0MjM1Mn0.kg2GEZG4qokkwV_fLsE0GpR3JIyinNVVthf_Fe1oNy0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
