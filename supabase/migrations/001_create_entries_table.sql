-- Calm Journal - Entries Table
-- Bu migration dosyası Supabase Dashboard > SQL Editor'da çalıştırılmalıdır

-- 1. Entries tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    mood_emoji TEXT NOT NULL,
    content TEXT NOT NULL,
    ai_summary TEXT DEFAULT NULL
);

-- 2. Tabloya index ekle (performans için)
CREATE INDEX IF NOT EXISTS entries_user_id_idx ON public.entries(user_id);
CREATE INDEX IF NOT EXISTS entries_created_at_idx ON public.entries(created_at DESC);

-- 3. Row Level Security (RLS) etkinleştir
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- 4. RLS Politikaları

-- Kullanıcılar sadece kendi entries'lerini görebilir
CREATE POLICY "Users can view their own entries"
    ON public.entries
    FOR SELECT
    USING (auth.uid() = user_id);

-- Kullanıcılar sadece kendi entries'lerini oluşturabilir
CREATE POLICY "Users can insert their own entries"
    ON public.entries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar sadece kendi entries'lerini güncelleyebilir
CREATE POLICY "Users can update their own entries"
    ON public.entries
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar sadece kendi entries'lerini silebilir
CREATE POLICY "Users can delete their own entries"
    ON public.entries
    FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Realtime subscription için tablo yayınla (opsiyonel)
ALTER PUBLICATION supabase_realtime ADD TABLE public.entries;

-- Tablo yapısı özeti:
-- ┌─────────────┬──────────────────────────────┬─────────────────────────────────┐
-- │ Sütun       │ Tip                          │ Açıklama                        │
-- ├─────────────┼──────────────────────────────┼─────────────────────────────────┤
-- │ id          │ UUID (auto-generated)        │ Benzersiz kimlik                │
-- │ created_at  │ TIMESTAMP WITH TIME ZONE     │ Oluşturulma zamanı (UTC)        │
-- │ user_id     │ UUID (foreign key)           │ auth.users referansı            │
-- │ mood_emoji  │ TEXT                         │ Seçilen duygu emojisi           │
-- │ content     │ TEXT                         │ Günlük giriş içeriği            │
-- │ ai_summary  │ TEXT (nullable)              │ AI tarafından oluşturulan özet  │
-- └─────────────┴──────────────────────────────┴─────────────────────────────────┘

