
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabaseInstance: SupabaseClient | null = null;
let initError: string | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
  initError = 'Supabase URL ve Anon Anahtarı AI Studio "Secrets" panelinde tanımlanmalıdır.';
} else {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e: any) {
    initError = `Supabase istemcisi başlatılamadı: ${e.message}`;
  }
}

// App.tsx, SupabaseInitError'ı kontrol ederek null durumunu ele alır.
// Her bileşende null kontrolünden kaçınmak için burada cast işlemi yapıyoruz.
// App.tsx'teki korumalar, bileşenlerin null bir supabase nesnesi kullanmasını engeller.
export const supabase = supabaseInstance as SupabaseClient;
export const SupabaseInitError = initError;
