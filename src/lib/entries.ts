import { getSupabaseClient, type Entry, type EntryInsert } from "./supabase";

/**
 * Kullanıcının tüm günlük girişlerini getirir
 */
export async function getEntries(): Promise<Entry[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching entries:", error);
    throw error;
  }

  return data || [];
}

/**
 * Yeni bir günlük girişi oluşturur
 */
export async function createEntry(
  entry: Omit<EntryInsert, "user_id">
): Promise<Entry> {
  const supabase = getSupabaseClient();
  
  // Mevcut kullanıcıyı al
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error("Kullanıcı oturumu bulunamadı");
  }

  const { data, error } = await supabase
    .from("entries")
    .insert({
      ...entry,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating entry:", error);
    throw error;
  }

  return data;
}

/**
 * Bir günlük girişini günceller
 */
export async function updateEntry(
  id: string,
  updates: Partial<Omit<Entry, "id" | "user_id" | "created_at">>
): Promise<Entry> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("entries")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating entry:", error);
    throw error;
  }

  return data;
}

/**
 * Bir günlük girişini siler
 */
export async function deleteEntry(id: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("entries")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting entry:", error);
    throw error;
  }
}

/**
 * Belirli bir günlük girişini getirir
 */
export async function getEntry(id: string): Promise<Entry | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Entry bulunamadı
    }
    console.error("Error fetching entry:", error);
    throw error;
  }

  return data;
}

