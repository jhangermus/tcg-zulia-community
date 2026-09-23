import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Cliente público de Supabase (browser-safe).
 * Usado únicamente para subir archivos a Storage desde el admin.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
