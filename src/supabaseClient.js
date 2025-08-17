import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// DEBUGGING LOGS: These will appear in your VS Code terminal and browser console
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key:", supabaseAnonKey ? "Loaded" : "NOT LOADED or EMPTY");

export const supabase = createClient(supabaseUrl, supabaseAnonKey)