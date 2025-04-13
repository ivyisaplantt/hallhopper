import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = "https://uurouwoszbnivsfhkxxv.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1cm91d29zemJuaXZzZmhreHh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MTc0MzgsImV4cCI6MjA2MDA5MzQzOH0.surp9b43A9QtVbk8lNOe2PPb_twSqXgh1s3tSXkahGE"

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);