import { createClient } from "@supabase/supabase-js";

// Sua URL da API que descobrimos no passo anterior
const supabaseUrl = "https://ahiyxrdplhecskzoiogd.supabase.co";

// A sua anon public key que você acabou de enviar
const supabaseKey = "sb_publishable_KCdYC5fikO2d1VLV6k8tFw_G73NtVRI";

export const supabase = createClient(supabaseUrl, supabaseKey);