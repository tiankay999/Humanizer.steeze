const MAX_CHARS = 5000;

/* ── Clipboard icon (inline SVG) ── */
function ClipboardIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
    );
}

/* ══════════════════════════════════════════════
   Input Card — "Original Text"
   ══════════════════════════════════════════════ */
interface InputCardProps {
    inputText: string;
    error: string;
    onInputChange: (value: string) => void;
    onClearError: () => void;
}

export function InputCard({
    inputText,
    error,
    onInputChange,
    onClearError,
}: InputCardProps) {
    return (
        <div className="flex flex-col rounded-2xl border border-card-border bg-card-bg p-5 backdrop-blur-lg">
            <label
                htmlFor="input-text"
                className="mb-2 text-xs font-semibold tracking-[0.14em] text-teal/80 uppercase"
            >
                Original Text
            </label>

            <textarea
                id="input-text"
                value={inputText}
                onChange={(e) => {
                    if (e.target.value.length <= MAX_CHARS) {
                        onInputChange(e.target.value);
                        if (error) onClearError();
                    }
                }}
                placeholder="Paste your text here…"
                className="glow-ring flex-1 resize-none rounded-xl border border-card-border bg-input-bg px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-foreground/30 transition focus:border-teal/40"
                rows={12}
            />

            <div className="mt-2 flex items-center justify-between text-xs text-foreground/40">
                <span>Max {MAX_CHARS.toLocaleString()} chars</span>
                <span className={inputText.length >= MAX_CHARS ? "text-red-400" : ""}>
                    {inputText.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </span>
            </div>

            {error && (
                <p className="mt-2 text-xs font-medium text-red-400" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════
   Output Card — "Humanized Output"
   ══════════════════════════════════════════════ */
interface OutputCardProps {
    outputText: string;
    onCopy: () => void;
}

export function OutputCard({ outputText, onCopy }: OutputCardProps) {
    return (
        <div className="flex flex-col rounded-2xl border border-card-border bg-card-bg p-5 backdrop-blur-lg">
            <div className="mb-2 flex items-center justify-between">
                <label
                    htmlFor="output-text"
                    className="text-xs font-semibold tracking-[0.14em] text-teal/80 uppercase"
                >
                    Humanized Output
                </label>

                <button
                    onClick={onCopy}
                    disabled={!outputText}
                    className="glow-ring flex items-center gap-1.5 rounded-lg border border-teal/20 px-3 py-1 text-xs font-medium text-teal transition hover:bg-teal/10 disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <ClipboardIcon />
                    Copy
                </button>
            </div>

            <div
                id="output-text"
                role="textbox"
                aria-readonly="true"
                aria-label="Humanized output text"
                className="flex-1 overflow-auto rounded-xl border border-card-border bg-input-bg px-4 py-3 text-sm leading-relaxed text-foreground/85 whitespace-pre-wrap"
                style={{ minHeight: "280px" }}
            >
                {outputText || (
                    <span className="text-foreground/25 italic">
                        Your humanized text will appear here…
                    </span>
                )}
            </div>
        </div>
    );
}
