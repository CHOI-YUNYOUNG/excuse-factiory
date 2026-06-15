import { createClient } from '@supabase/supabase-js'
import type { Excuse } from '../types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type { Excuse }

export interface Database {
  excuses: Excuse
}
