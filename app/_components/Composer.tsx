"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function Composer({ onSend, disabled, placeholder = "Pregúntale a HAVI..." }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Auto-resize up to ~3 lines (60px).
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  };

  return (
    <div className="sticky bottom-0 z-30 border-t border-hey-divider bg-hey-bg/95 backdrop-blur-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="hey-app-frame flex items-end gap-2 px-4 pt-2 pb-6"
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          rows={1}
          disabled={disabled}
          placeholder={placeholder}
          className="min-h-[44px] flex-1 resize-none rounded-hey-pill border border-hey-outline bg-hey-surface-2 px-4 py-3 text-[15px] leading-snug text-hey-fg-1 placeholder:text-hey-fg-3 focus:border-hey-blue focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          aria-label="Enviar mensaje"
          className="inline-flex h-[38px] w-[38px] flex-none items-center justify-center self-end rounded-full bg-hey-blue text-white transition hover:bg-hey-blue-hover active:bg-hey-blue-press disabled:bg-hey-surface-3 disabled:text-hey-fg-disabled"
        >
          <Send size={18} strokeWidth={2.2} />
        </button>
      </form>
    </div>
  );
}
