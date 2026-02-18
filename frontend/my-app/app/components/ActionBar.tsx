const TONES = ["Neutral", "Formal", "Casual"] as const;
export type Tone = (typeof TONES)[number];

interface ActionBarProps {
    loading: boolean;
    keepFormatting: boolean;
    tone: Tone;
    onHumanize: () => void;
    onClear: () => void;
    onToggleFormatting: () => void;
    onToneChange: (tone: Tone) => void;
}

export default function ActionBar({
    loading,
    keepFormatting,
    tone,
    onHumanize,
    onClear,
    onToggleFormatting,
    onToneChange,
}: ActionBarProps) {
    return (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {/* Humanize */}
            <button
                onClick={onHumanize}
                disabled={loading}
                className="btn-glow glow-ring inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal to-teal-dark px-7 py-3 text-sm font-bold tracking-wide text-[#0a0e1a] uppercase shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <span className="spinner" />
                        Processing…
                    </>
                ) : (
                    "Humanize"
                )}
            </button>

            {/* Clear */}
            <button
                onClick={onClear}
                disabled={loading}
                className="btn-glow glow-ring rounded-xl border border-teal/30 px-6 py-3 text-sm font-semibold tracking-wide text-teal uppercase transition hover:bg-teal/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Clear
            </button>

            {/* Divider */}
            <span className="hidden h-8 w-px bg-card-border sm:block" />

            {/* Keep-formatting toggle */}
            <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground/50">
                <button
                    role="switch"
                    aria-checked={keepFormatting}
                    onClick={onToggleFormatting}
                    className={`glow-ring relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-teal/30 transition ${keepFormatting ? "bg-teal/30" : "bg-white/5"
                        }`}
                >
                    <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-teal shadow transition ${keepFormatting ? "translate-x-4" : "translate-x-0.5"
                            }`}
                    />
                </button>
                Keep formatting
            </label>

            {/* Tone selector */}
            <div className="relative">
                <label htmlFor="tone-select" className="sr-only">
                    Tone
                </label>
                <select
                    id="tone-select"
                    value={tone}
                    onChange={(e) => onToneChange(e.target.value as Tone)}
                    className="glow-ring appearance-none rounded-lg border border-teal/25 bg-white/5 px-4 py-2 pr-8 text-xs font-medium text-foreground/70 transition hover:border-teal/40 focus:border-teal/50"
                >
                    {TONES.map((t) => (
                        <option key={t} value={t} className="bg-[#0d1826]">
                            Tone: {t}
                        </option>
                    ))}
                </select>
                {/* chevron */}
                <svg
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40"
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>
        </div>
    );
}
