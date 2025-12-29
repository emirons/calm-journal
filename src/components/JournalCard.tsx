"use client";

import { CSSProperties } from "react";
import { Trash2 } from "lucide-react";
import type { Entry } from "@/lib/supabase";

interface JournalCardProps {
  entry: Entry;
  onDelete?: (id: string) => void;
  style?: CSSProperties;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Bugün";
  } else if (diffDays === 1) {
    return "Dün";
  } else if (diffDays < 7) {
    return `${diffDays} gün önce`;
  } else {
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
    });
  }
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function JournalCard({ entry, onDelete, style }: JournalCardProps) {
  return (
    <article
      className="group bg-white rounded-2xl p-6 shadow-sm border border-[#ebebeb]/50
        animate-fade-in-up opacity-0"
      style={style}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{entry.mood_emoji}</span>
          <div>
            <span className="text-sm text-[#8a8a8a] font-light">
              {formatDate(entry.created_at)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <time className="text-xs text-[#8a8a8a]/70 font-light">
            {formatTime(entry.created_at)}
          </time>
          {onDelete && (
            <button
              onClick={() => onDelete(entry.id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-50 
                rounded-lg transition-all duration-200"
              title="Sil"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="text-[#1a1a1a]/80 leading-relaxed font-light text-lg">
        {entry.content}
      </p>

      {/* AI Summary */}
      {entry.ai_summary && (
        <div className="mt-4 pt-4 border-t border-[#ebebeb]">
          <p className="text-sm text-[#8a8a8a] font-light italic">
            ✨ {entry.ai_summary}
          </p>
        </div>
      )}
    </article>
  );
}
