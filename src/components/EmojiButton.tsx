"use client";

interface EmojiButtonProps {
  emoji: string;
  label: string;
  isSelected: boolean;
  hoverColor: string;
  onClick: () => void;
}

export default function EmojiButton({
  emoji,
  label,
  isSelected,
  hoverColor,
  onClick,
}: EmojiButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group flex flex-col items-center gap-2 p-4 rounded-2xl
        transition-all duration-200 ease-out
        ${isSelected
          ? "bg-white shadow-md scale-105 border-2 border-[#1a1a1a]/10"
          : `bg-white/50 border-2 border-transparent ${hoverColor} hover:shadow-sm`
        }
      `}
    >
      <span
        className={`text-4xl transition-transform duration-200 ${
          isSelected ? "scale-110" : "group-hover:scale-110"
        }`}
      >
        {emoji}
      </span>
      <span
        className={`text-xs font-light tracking-wide transition-colors duration-200 ${
          isSelected ? "text-[#1a1a1a]" : "text-[#8a8a8a]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

