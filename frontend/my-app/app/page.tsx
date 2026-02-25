"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Header from "./components/Header";
import BackgroundEffects from "./components/BackgroundEffects";
import { InputCard, OutputCard } from "./components/EditorCards";
import ActionBar, { type Tone } from "./components/ActionBar";
import Toast from "./components/Toast";
import HistoryPanel from "./components/HistoryPanel";

const API_BASE = "http://localhost:5000/api/llm";

/* ══════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════ */
export default function HomePage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [keepFormatting, setKeepFormatting] = useState(false);
  const [tone, setTone] = useState<Tone>("Neutral");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [guestUsesLeft, setGuestUsesLeft] = useState(5);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Sync guest uses from localStorage & check auth state
  useEffect(() => {
    const stored = localStorage.getItem("guestUsesLeft");
    if (stored !== null) setGuestUsesLeft(Number(stored));
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  /* ── actions ── */
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }, []);

  /** Save the text pair to history (fire-and-forget, only if logged in) */
  const saveToHistory = useCallback(
    async (original: string, humanized: string, usedTone: string) => {
      const token = localStorage.getItem("token");
      if (!token) return; // not logged in — skip silently

      try {
        await fetch(`${API_BASE}/history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: original,
            humanizedText: humanized,
            tone: usedTone,
          }),
        });
      } catch {
        // non-critical — don't block the user
        console.warn("Could not save to history");
      }
    },
    []
  );

  const handleHumanize = useCallback(async () => {
    if (!inputText.trim()) {
      setError("Please paste some text before humanizing.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/rewrite`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: inputText, targetMode: tone }),
      });

      // Handle guest limit reached
      if (res.status === 403) {
        const errData = await res.json().catch(() => null);
        if (errData?.requiresAuth) {
          setGuestUsesLeft(0);
          localStorage.setItem("guestUsesLeft", "0");
          setShowLimitModal(true);
          return;
        }
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Server error (${res.status})`);
      }

      // Update guest usage counter from response header
      const remaining = res.headers.get("X-Guest-Uses-Remaining");
      if (remaining !== null) {
        const rem = Number(remaining);
        setGuestUsesLeft(rem);
        localStorage.setItem("guestUsesLeft", String(rem));
      }

      const data = await res.json();
      const rewritten = data.rewritten ?? "";
      setOutputText(rewritten);

      // Auto-save to history
      if (rewritten) {
        saveToHistory(inputText, rewritten, tone);
      }

      // Show a brief summary of what was changed
      if (data.changes && data.changes.length > 0) {
        showToast(`${data.changes.length} change(s) applied`);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [inputText, tone, showToast, saveToHistory]);

  const handleClear = useCallback(() => {
    setInputText("");
    setOutputText("");
    setError("");
  }, []);

  const handleCopy = useCallback(async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      showToast("Copied to clipboard!");
    } catch {
      showToast("Copy failed – try selecting manually.");
    }
  }, [outputText, showToast]);

  /** Load a history entry back into the editor */
  const handleLoadEntry = useCallback((original: string, humanized: string) => {
    setInputText(original);
    setOutputText(humanized);
    showToast("Loaded from history");
  }, [showToast]);

  /* ═══════════════════════ JSX ═══════════════════════ */
  return (
    <div className="relative flex min-h-screen flex-col">
      <BackgroundEffects />
      <Header onOpenHistory={() => setHistoryOpen(true)} />

      {/* ════════ MAIN ════════ */}
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
        {/* Headline */}
        <section className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Humanize your text.{" "}
            <span className="bg-gradient-to-r from-teal to-teal-dark bg-clip-text text-transparent">
              Keep your meaning.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-foreground/55 sm:text-base">
            Paste your draft on the left. Get a cleaner, more natural version on
            the right.
          </p>
        </section>

        {/* Two-column editor grid */}
        <div className="grid flex-1 gap-6 lg:grid-cols-2">
          <InputCard
            inputText={inputText}
            error={error}
            onInputChange={setInputText}
            onClearError={() => setError("")}
          />
          <OutputCard outputText={outputText} onCopy={handleCopy} />
        </div>

        {/* Action bar */}
        <ActionBar
          loading={loading}
          keepFormatting={keepFormatting}
          tone={tone}
          onHumanize={handleHumanize}
          onClear={handleClear}
          onToggleFormatting={() => setKeepFormatting((v) => !v)}
          onToneChange={setTone}
        />
      </main>

      {/* ═══ Guest usage badge ═══ */}
      {!isLoggedIn && (
        <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full border border-teal/20 bg-[#0a0e1a]/90 px-4 py-2 text-xs font-medium text-foreground/70 shadow-lg backdrop-blur-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>
            <span className="text-teal font-bold">{guestUsesLeft}</span>/5 free uses left
          </span>
        </div>
      )}

      {/* ═══ Guest limit modal ═══ */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative mx-4 w-full max-w-md rounded-2xl border border-teal/20 bg-[#0d1224] p-8 text-center shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setShowLimitModal(false)}
              className="absolute right-4 top-4 text-foreground/40 transition hover:text-foreground"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Icon */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <h2 className="mb-2 text-xl font-bold text-foreground">
              Free limit reached
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-foreground/55">
              You&apos;ve used all <span className="font-semibold text-teal">5 free</span> humanizations.
              Create an account or log in to keep going — it&apos;s free!
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="inline-block rounded-lg bg-gradient-to-r from-teal to-teal-dark px-6 py-2.5 text-sm font-semibold text-[#0a0e1a] transition hover:brightness-110"
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                className="inline-block rounded-lg border border-teal/30 px-6 py-2.5 text-sm font-semibold text-teal transition hover:bg-teal/10"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ════════ FOOTER ════════ */}
      <footer className="relative z-10 border-t border-card-border py-4 text-center text-xs text-foreground/30">
        © {new Date().getFullYear()} STEEZE TECH — All rights reserved.
      </footer>

      {/* Toast */}
      {toast && <Toast message={toast} />}

      {/* History Panel */}
      <HistoryPanel
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onLoadEntry={handleLoadEntry}
      />
    </div>
  );
}
