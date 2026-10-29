import { createClient } from '@supabase/supabase-js'

// Credenciais padrão da nuvem Supabase do projeto (Anon Key pública)
const DEFAULT_SUPABASE_URL = 'https://lhabdkzgdprarlhjujbh.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoYWJka3pnZHByYXJsaGp1amJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMDU2MTQsImV4cCI6MjEwODg4MTYxNH0.3M96HwnuBUkbB_QEaDzc7lcHV0RbYyZYNHgs9_o8JBo'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://placeholder.supabase.co'
)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    },
  },
})

