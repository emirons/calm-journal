"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, Feather, Loader2, AlertCircle } from "lucide-react";
import JournalCard from "@/components/JournalCard";
import EmojiButton from "@/components/EmojiButton";
import AuthButton from "@/components/AuthButton";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import type { Entry } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const moods = [
  { emoji: "😌", label: "Huzurlu", color: "hover:bg-emerald-50" },
  { emoji: "😊", label: "Mutlu", color: "hover:bg-amber-50" },
  { emoji: "😔", label: "Üzgün", color: "hover:bg-slate-100" },
  { emoji: "😤", label: "Sinirli", color: "hover:bg-rose-50" },
  { emoji: "😰", label: "Endişeli", color: "hover:bg-purple-50" },
  { emoji: "🥱", label: "Yorgun", color: "hover:bg-blue-50" },
];

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const supabase = getSupabaseClient();

  // Entries'leri çek
  const fetchEntries = useCallback(async () => {
    if (!user || !supabase) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Entries yüklenirken hata:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  // Auth durumunu izle
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    async function getUser() {
      const { data: { user } } = await supabase!.auth.getUser();
      setUser(user);
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  // User değiştiğinde entries'leri yeniden çek
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Yeni entry kaydet (Optimistic UI)
  async function handleSubmit() {
    if (!selectedMood || !text.trim() || isSaving || !user || !supabase) return;

    setIsSaving(true);

    // Optimistic UI: Hemen ekle
    const optimisticEntry: Entry = {
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
      user_id: user.id,
      mood_emoji: selectedMood,
      content: text.trim(),
      ai_summary: null,
    };

    setEntries((prev) => [optimisticEntry, ...prev]);
    const previousText = text;
    const previousMood = selectedMood;
    setSelectedMood(null);
    setText("");

    try {
      const { data, error } = await supabase
        .from("entries")
        .insert({
          user_id: user.id,
          mood_emoji: previousMood,
          content: previousText.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Gerçek veriyle değiştir
      setEntries((prev) =>
        prev.map((e) => (e.id === optimisticEntry.id ? data : e))
      );
    } catch (error) {
      console.error("Kayıt hatası:", error);
      // Hata durumunda geri al
      setEntries((prev) => prev.filter((e) => e.id !== optimisticEntry.id));
      setSelectedMood(previousMood);
      setText(previousText);
      alert("Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSaving(false);
    }
  }

  // Entry sil
  async function handleDelete(id: string) {
    if (!supabase) return;
    if (!confirm("Bu notu silmek istediğinize emin misiniz?")) return;

    const entryToDelete = entries.find((e) => e.id === id);
    
    // Optimistic: Hemen kaldır
    setEntries((prev) => prev.filter((e) => e.id !== id));

    try {
      const { error } = await supabase.from("entries").delete().eq("id", id);
      if (error) throw error;
    } catch (error) {
      console.error("Silme hatası:", error);
      // Hata durumunda geri ekle
      if (entryToDelete) {
        setEntries((prev) => [entryToDelete, ...prev]);
      }
      alert("Silme sırasında bir hata oluştu.");
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Supabase yapılandırılmamışsa uyarı göster
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-light text-[#1a1a1a] mb-4">
            Supabase Yapılandırılmamış
          </h1>
          <p className="text-[#8a8a8a] font-light mb-6">
            Uygulamayı kullanmak için Supabase projenizi bağlamanız gerekiyor.
          </p>
          <div className="bg-white rounded-xl p-6 text-left border border-[#ebebeb]">
            <p className="text-sm font-medium text-[#1a1a1a] mb-3">
              1. Proje kök dizininde <code className="bg-[#f0eeeb] px-1.5 py-0.5 rounded">.env.local</code> dosyası oluşturun:
            </p>
            <pre className="bg-[#1a1a1a] text-green-400 text-xs p-4 rounded-lg overflow-x-auto mb-4">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...`}
            </pre>
            <p className="text-sm text-[#8a8a8a]">
              2. Değerleri{" "}
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Supabase Dashboard
              </a>
              {" → Project Settings → API"} bölümünden alın.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Header */}
      <header className="pt-8 pb-6 px-6">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Feather className="w-6 h-6 text-[#1a1a1a]/70" strokeWidth={1.5} />
            <h1 className="text-2xl font-light tracking-wide text-[#1a1a1a]/80">
              Calm
            </h1>
          </div>
          <AuthButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-20">
        <div className="max-w-xl mx-auto">
          {/* Question Section */}
          <section className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-light text-[#1a1a1a] leading-tight tracking-tight mb-2">
              Bugün nasılsın?
            </h2>
            <p className="text-[#8a8a8a] text-lg font-light">
              {user
                ? "Bir duygu seç ve düşüncelerini paylaş"
                : "Başlamak için giriş yap"}
            </p>
          </section>

          {user ? (
            <>
              {/* Emoji Selection */}
              <section className="mb-8">
                <div className="flex justify-center gap-3 flex-wrap">
                  {moods.map((mood) => (
                    <EmojiButton
                      key={mood.emoji}
                      emoji={mood.emoji}
                      label={mood.label}
                      isSelected={selectedMood === mood.emoji}
                      hoverColor={mood.color}
                      onClick={() => setSelectedMood(mood.emoji)}
                    />
                  ))}
                </div>
              </section>

              {/* Text Input */}
              <section className="mb-12">
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      selectedMood
                        ? "Bu duyguyu biraz açıkla..."
                        : "Önce bir duygu seç..."
                    }
                    disabled={!selectedMood || isSaving}
                    className="w-full bg-white border border-[#ebebeb] rounded-2xl px-6 py-5 pr-14
                      text-lg font-light text-[#1a1a1a] placeholder:text-[#8a8a8a]/60
                      focus:outline-none focus:border-[#1a1a1a]/20 focus:ring-0
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200 min-h-[120px] shadow-sm"
                    rows={3}
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedMood || !text.trim() || isSaving}
                    className="absolute right-4 bottom-4 p-3 rounded-full
                      bg-[#1a1a1a] text-white
                      hover:bg-[#333] active:scale-95
                      disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#1a1a1a]
                      transition-all duration-200"
                  >
                    {isSaving ? (
                      <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />
                    ) : (
                      <Send className="w-5 h-5" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
                {selectedMood && (
                  <p className="text-center text-sm text-[#8a8a8a] mt-3 font-light">
                    Enter tuşuna bas veya butona tıkla
                  </p>
                )}
              </section>

              {/* Loading State */}
              {isLoading ? (
                <div className="text-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8a8a8a]" />
                </div>
              ) : (
                <>
                  {/* Divider */}
                  {entries.length > 0 && (
                    <div className="flex items-center gap-4 mb-8">
                      <div className="flex-1 h-px bg-[#ebebeb]" />
                      <span className="text-sm text-[#8a8a8a] font-light tracking-wide">
                        Geçmiş Notlar
                      </span>
                      <div className="flex-1 h-px bg-[#ebebeb]" />
                    </div>
                  )}

                  {/* Journal Entries */}
                  <section className="space-y-4">
                    {entries.map((entry, index) => (
                      <JournalCard
                        key={entry.id}
                        entry={entry}
                        onDelete={handleDelete}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      />
                    ))}
                  </section>

                  {/* Empty State */}
                  {entries.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 rounded-full bg-[#f0eeeb] flex items-center justify-center mx-auto mb-4">
                        <Feather className="w-7 h-7 text-[#8a8a8a]" strokeWidth={1.5} />
                      </div>
                      <p className="text-[#8a8a8a] font-light">
                        Henüz bir not yok. İlk notunu ekle!
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            /* Not Logged In State */
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-[#f0eeeb] flex items-center justify-center mx-auto mb-6">
                <Feather className="w-9 h-9 text-[#8a8a8a]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-light text-[#1a1a1a] mb-2">
                Günlüğüne Hoş Geldin
              </h3>
              <p className="text-[#8a8a8a] font-light mb-8 max-w-xs mx-auto">
                Duygularını kaydet, düşüncelerini yaz. Her şey güvende ve sadece sana özel.
              </p>
              <AuthButton />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
