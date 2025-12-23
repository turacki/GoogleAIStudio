
import { createClient } from '@supabase/supabase-js';
import { User, PuantajEntry } from '../types';

const SUPABASE_URL = 'https://oytpzotrsvhnvznqzinj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95dHB6b3Ryc3ZobnZ6bnF6aW5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDMyODUsImV4cCI6MjA4MTkxOTI4NX0.lAr9M7yLpDbE7KSNFZIyssAlAyNMH1YOohpSg5l9Yxc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SQL_FIX = `GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries DISABLE ROW LEVEL SECURITY;`;

export const db = {
  getUsers: async (): Promise<User[]> => {
    console.log("[DB] Personeller getiriliyor...");
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error("[DB] Personel Getirme Hatası:", error);
      throw new Error(`VERI_ALINAMADI: ${error.message} (Kod: ${error.code})`);
    }
    return (data || []).map(u => ({
      id: u.id,
      name: u.name,
      role: u.role,
      hourlyRate: Number(u.hourly_rate),
      avatar: u.avatar
    }));
  },
  
  upsertUser: async (user: User) => {
    console.log("[DB] Personel kaydediliyor/güncelleniyor:", user.id);
    const { error } = await supabase.from('users').upsert({
      id: user.id,
      name: user.name,
      role: user.role,
      hourly_rate: user.hourlyRate,
      avatar: user.avatar
    });
    if (error) {
      console.error("[DB] Upsert Hatası:", error);
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    console.log("[DB] Personel silme işlemi başlatıldı:", id);
    
    // 1. Önce personelin kayıtlarını temizle
    const { data: eData, error: eError } = await supabase
      .from('entries')
      .delete()
      .eq('user_id', id)
      .select();
    
    if (eError) {
      console.error("[DB] Kayıt silme hatası:", eError);
      throw new Error(`KAYIT_TEMIZLEME_FAIL: ${eError.message}`);
    }

    // 2. Personeli sil
    const { data: uData, error: uError } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .select();
    
    if (uError) {
      console.error("[DB] Personel silme hatası:", uError);
      if (uError.code === '42501') {
        throw new Error(`PERM_DENIED: Yetki Hatası! SQL Editor'de tamir kodunu çalıştır kanka.`);
      }
      throw new Error(`PERSONEL_SILME_FAIL: ${uError.message}`);
    }

    if (!uData || uData.length === 0) {
      console.warn("[DB] Silme başarılı dendi ama 0 satır etkilendi. RLS engeli!");
      throw new Error(`RLS_BLOCK: Supabase silme izni vermedi. Veri hala duruyor.`);
    }
    
    console.log("[DB] Personel başarıyla silindi.");
    return true;
  },

  getEntries: async (): Promise<PuantajEntry[]> => {
    const { data, error } = await supabase.from('entries').select('*');
    if (error) throw error;
    return (data || []).map(e => ({
      id: e.id,
      userId: e.user_id,
      type: e.type,
      amount: Number(e.amount),
      date: e.date,
      note: e.note
    }));
  },

  upsertEntry: async (entry: PuantajEntry) => {
    const { error } = await supabase.from('entries').upsert({
      id: entry.id,
      user_id: entry.userId,
      type: entry.type,
      amount: entry.amount,
      date: entry.date,
      note: entry.note
    });
    if (error) throw error;
  },

  deleteEntry: async (id: string) => {
    console.log("[DB] Kayıt siliniyor:", id);
    const { data, error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id)
      .select();
    
    if (error) {
      console.error("[DB] Kayıt silme hatası:", error);
      throw new Error(`KAYIT_SILME_FAIL: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error("RLS_BLOCK: Kayıt silinemedi (RLS Engeli).");
    }
    console.log("[DB] Kayıt silindi.");
  },

  wipeAllData: async (adminId: string) => {
    const { error: eError } = await supabase.from('entries').delete().neq('id', 'WIPE_PROTECT');
    if (eError) throw eError;

    const { error: uError } = await supabase.from('users').delete().neq('id', adminId);
    if (uError) throw uError;
  }
};
