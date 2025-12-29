"use client";

import { useState, useEffect } from "react";
import { LogOut, User } from "lucide-react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function AuthButton() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Mevcut oturumu kontrol et
    async function getUser() {
      const { data: { user } } = await supabase!.auth.getUser();
      setUser(user);
      setIsLoading(false);
    }

    getUser();

    // Auth değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function signInWithGoogle() {
    if (!supabase) return;
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async function signOut() {
    if (!supabase) return;
    setIsLoading(true);
    await supabase.auth.signOut();
    setIsLoading(false);
  }

  if (!isSupabaseConfigured) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-[#f0eeeb] animate-pulse" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Profil"
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#f0eeeb] flex items-center justify-center">
              <User className="w-4 h-4 text-[#8a8a8a]" />
            </div>
          )}
          <span className="text-sm text-[#8a8a8a] font-light hidden sm:inline">
            {user.user_metadata?.full_name || user.email?.split("@")[0]}
          </span>
        </div>
        <button
          onClick={signOut}
          className="p-2 hover:bg-[#f0eeeb] rounded-lg transition-colors"
          title="Çıkış Yap"
        >
          <LogOut className="w-4 h-4 text-[#8a8a8a]" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-[#ebebeb] 
        rounded-xl hover:bg-[#f9f9f9] hover:border-[#ddd] transition-all duration-200
        text-sm font-light text-[#1a1a1a]"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span>Google ile Giriş</span>
    </button>
  );
}
