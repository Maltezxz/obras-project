import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Para modo de desenvolvimento, usar valores padrão se as variáveis não estiverem definidas
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
