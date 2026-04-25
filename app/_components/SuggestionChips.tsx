// Pill-shaped suggestion chips above the composer. Tapping fires `onPick(text)`
// which the chat page injects into HAVI as if typed. Horizontal scroll without
// visible scrollbar (hey-scroll-x-hidden in globals.css).

type Props = {
  suggestions: readonly string[];
  onPick: (text: string) => void;
};

export function SuggestionChips({ suggestions, onPick }: Props) {
  return (
    <div className="hey-app-frame hey-scroll-x-hidden flex gap-2 px-4 py-2">
      {suggestions.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          className="flex-none rounded-hey-pill border border-hey-outline bg-hey-surface-2 px-4 py-2 text-[13px] font-medium text-hey-fg-1 transition hover:bg-hey-surface-3 active:opacity-60"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
