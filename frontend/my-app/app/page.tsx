"use client";

import { useState, useCallback } from "react";
import Header from "./components/Header";
import BackgroundEffects from "./components/BackgroundEffects";
import { InputCard, OutputCard } from "./components/EditorCards";
import ActionBar, { type Tone } from "./components/ActionBar";
import Toast from "./components/Toast";

/* ──────────────────────────────────────────────
   Mock humanize function
   ────────────────────────────────────────────── */
async function mockHumanize(text: string): Promise<string> {
  return new Promise((resolve) =>
    setTimeout(() => {
      const result = text
        .replace(/\s{2,}/g, " ")
        .replace(/\bvery\b/gi, "quite")
        .replace(/\buse\b/gi, "utilize")
        .replace(/\bin order to\b/gi, "to")
        .replace(/\bbasically\b/gi, "essentially");
      resolve(result);
    }, 900)
  );
}

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

  /* ── actions ── */
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }, []);

  const handleHumanize = useCallback(async () => {
    if (!inputText.trim()) {
      setError("Please paste some text before humanizing.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await mockHumanize(inputText);
      setOutputText(result);
    } finally {
      setLoading(false);
    }
  }, [inputText]);

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

  /* ═══════════════════════ JSX ═══════════════════════ */
  return (
    <div className="relative flex min-h-screen flex-col">
      <BackgroundEffects />
      <Header />

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

      {/* ════════ FOOTER ════════ */}
      <footer className="relative z-10 border-t border-card-border py-4 text-center text-xs text-foreground/30">
        © {new Date().getFullYear()} STEEZE TECH — All rights reserved.
      </footer>

      {/* Toast */}
      {toast && <Toast message={toast} />}
    </div>
  );
}
