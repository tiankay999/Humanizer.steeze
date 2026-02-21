"use client";

import { useState, useEffect, useCallback } from "react";

interface HistoryEntry {
    id: number;
    text: string;
    humanizedText: string;
    tone: string;
    createdAt: string;
}

interface HistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadEntry: (original: string, humanized: string) => void;
}

const API_BASE = "http://localhost:5000/api/llm";

export default function HistoryPanel({ isOpen, onClose, onLoadEntry }: HistoryPanelProps) {
    const [entries, setEntries] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchHistory = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/history`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const data = await res.json();
            setEntries(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load history");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) fetchHistory();
    }, [isOpen, fetchHistory]);

    if (!isOpen) return null;

    return (
        <>
            {/* ── Backdrop overlay ── */}
            <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* ── Drawer ── */}
            <aside
                className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-card-border bg-[#0a0e1a]/95 shadow-2xl backdrop-blur-xl history-slide-in"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-card-border px-5 py-4">
                    <div className="flex items-center gap-2.5">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-teal"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <h2 className="text-sm font-bold tracking-[0.14em] text-teal uppercase">
                            History
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="glow-ring rounded-lg p-1.5 text-foreground/50 transition hover:bg-white/5 hover:text-foreground"
                        aria-label="Close history"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <span className="spinner" />
                            <span className="ml-3 text-xs text-foreground/50">Loading history…</span>
                        </div>
                    )}

                    {error && (
                        <p className="rounded-lg border border-red-400/30 bg-red-400/5 px-4 py-3 text-xs text-red-400">
                            {error}
                        </p>
                    )}

                    {!loading && !error && entries.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-foreground/15">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <p className="text-sm text-foreground/30">No history yet</p>
                            <p className="mt-1 text-xs text-foreground/20">
                                Humanized text will appear here
                            </p>
                        </div>
                    )}

                    {!loading && entries.map((entry) => (
                        <button
                            key={entry.id}
                            onClick={() => {
                                onLoadEntry(entry.text, entry.humanizedText);
                                onClose();
                            }}
                            className="glow-ring group w-full rounded-xl border border-card-border bg-card-bg p-4 text-left transition hover:border-teal/30 hover:bg-white/[0.03]"
                        >
                            {/* Top row: tone badge + date */}
                            <div className="mb-2.5 flex items-center justify-between">
                                <span className="rounded-md border border-teal/20 bg-teal/5 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-teal/80 uppercase">
                                    {entry.tone}
                                </span>
                                <time className="text-[10px] text-foreground/30">
                                    {new Date(entry.createdAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </time>
                            </div>

                            {/* Original text preview */}
                            <p className="mb-1 text-[10px] font-semibold tracking-wider text-foreground/30 uppercase">
                                Original
                            </p>
                            <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-foreground/50">
                                {entry.text}
                            </p>

                            {/* Humanized preview */}
                            <p className="mb-1 text-[10px] font-semibold tracking-wider text-teal/50 uppercase">
                                Humanized
                            </p>
                            <p className="line-clamp-2 text-xs leading-relaxed text-foreground/70 group-hover:text-foreground/90">
                                {entry.humanizedText}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Footer */}
                {entries.length > 0 && (
                    <div className="border-t border-card-border px-5 py-3 text-center text-[10px] text-foreground/25">
                        {entries.length} entr{entries.length === 1 ? "y" : "ies"} · Click to load
                    </div>
                )}
            </aside>
        </>
    );
}
