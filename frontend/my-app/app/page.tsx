"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";

/* ──────────────────────────────────────────────
   Inline Toast component
   ────────────────────────────────────────────── */
function Toast({ message }: { message: string }) {
  return (
    <div className="toast-enter fixed bottom-6 right-6 z-50 rounded-lg border border-teal/30 bg-[#0d1826] px-5 py-3 text-sm font-medium text-teal shadow-lg shadow-teal/10">
      {message}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Constants
   ────────────────────────────────────────────── */
const MAX_CHARS = 5000;
const TONES = ["Neutral", "Formal", "Casual"] as const;

/* ──────────────────────────────────────────────
   Mock humanize function
   ────────────────────────────────────────────── */
async function mockHumanize(text: string): Promise<string> {
  return new Promise((resolve) =>
    setTimeout(() => {
      // Lightweight mock transformation
      const result = text
        .replace(/\s{2,}/g, " ") // collapse extra spaces
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
  const [tone, setTone] = useState<(typeof TONES)[number]>("Neutral");

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
      {/* ── Ambient background layers ── */}
      <div className="circuit-bg" aria-hidden="true" />
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />
      <div className="blob blob-3" aria-hidden="true" />

      {/* Faint watermark logo */}
      <div
        className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <Image
          src="/steeze-logo.png"
          alt=""
          width={480}
          height={480}
          className="opacity-[0.025] select-none"
          priority={false}
        />
      </div>

      {/* ════════ HEADER ════════ */}
      <header className="sticky top-0 z-30 border-b border-card-border bg-[#0a0e1a]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* logo + brand */}
          <div className="flex items-center gap-3">
            <Image
              src="/steeze-logo.png"
              alt="Steeze Humanizer logo"
              width={36}
              height={36}
              className="drop-shadow-[0_0_6px_rgba(0,240,255,0.5)]"
              priority
            />
            <span className="text-sm font-bold tracking-[0.18em] text-teal uppercase sm:text-base">
              Steeze Humanizer
            </span>
          </div>

          {/* nav */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {["Docs", "Pricing", "Login"].map((label) => (
              <button
                key={label}
                className="glow-ring rounded-md px-3 py-1.5 text-xs font-medium tracking-wide text-foreground/70 transition hover:bg-white/5 hover:text-teal sm:text-sm"
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ════════ MAIN ════════ */}
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
        {/* ── Headline ── */}
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

        {/* ── Two‑column grid ── */}
        <div className="grid flex-1 gap-6 lg:grid-cols-2">
          {/* LEFT CARD — Original Text */}
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
                  setInputText(e.target.value);
                  if (error) setError("");
                }
              }}
              placeholder="Paste your text here…"
              className="glow-ring flex-1 resize-none rounded-xl border border-card-border bg-input-bg px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-foreground/30 transition focus:border-teal/40"
              rows={12}
            />

            <div className="mt-2 flex items-center justify-between text-xs text-foreground/40">
              <span>Max {MAX_CHARS.toLocaleString()} chars</span>
              <span
                className={
                  inputText.length >= MAX_CHARS ? "text-red-400" : ""
                }
              >
                {inputText.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </span>
            </div>

            {error && (
              <p className="mt-2 text-xs font-medium text-red-400" role="alert">
                {error}
              </p>
            )}
          </div>

          {/* RIGHT CARD — Humanized Output */}
          <div className="flex flex-col rounded-2xl border border-card-border bg-card-bg p-5 backdrop-blur-lg">
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="output-text"
                className="text-xs font-semibold tracking-[0.14em] text-teal/80 uppercase"
              >
                Humanized Output
              </label>

              <button
                onClick={handleCopy}
                disabled={!outputText}
                className="glow-ring flex items-center gap-1.5 rounded-lg border border-teal/20 px-3 py-1 text-xs font-medium text-teal transition hover:bg-teal/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {/* clipboard icon */}
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
        </div>

        {/* ── Action bar ── */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {/* Humanize */}
          <button
            onClick={handleHumanize}
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
            onClick={handleClear}
            disabled={loading}
            className="btn-glow glow-ring rounded-xl border border-teal/30 px-6 py-3 text-sm font-semibold tracking-wide text-teal uppercase transition hover:bg-teal/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Clear
          </button>

          {/* Divider */}
          <span className="hidden h-8 w-px bg-card-border sm:block" />

          {/* Keep‑formatting toggle */}
          <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground/50">
            <button
              role="switch"
              aria-checked={keepFormatting}
              onClick={() => setKeepFormatting((v) => !v)}
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
              onChange={(e) =>
                setTone(e.target.value as (typeof TONES)[number])
              }
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
      </main>

      {/* ════════ FOOTER ════════ */}
      <footer className="relative z-10 border-t border-card-border py-4 text-center text-xs text-foreground/30">
        © {new Date().getFullYear()} Steeze Humanizer — All rights reserved.
      </footer>

      {/* ── Toast ── */}
      {toast && <Toast message={toast} />}
    </div>
  );
}
