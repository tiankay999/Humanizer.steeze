"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import BackgroundEffects from "@/app/components/BackgroundEffects";

/* ── Eye icon SVGs ── */
function EyeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}
function EyeOffIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );
}

/* ─────────────────────────────────────
   Login Page
   ───────────────────────────────────── */
export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim() || !password) {
            setError("Please fill in all fields.");
            return;
        }
        setError("");
        setLoading(true);
        // TODO: wire up to real auth endpoint
        await new Promise((r) => setTimeout(r, 1200));
        setLoading(false);
        // placeholder: just clear
        setEmail("");
        setPassword("");
    }

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center">
            <BackgroundEffects />

            {/* ── Card ── */}
            <div
                className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-card-border bg-card-bg backdrop-blur-xl px-8 py-10 shadow-[0_0_60px_rgba(0,240,255,0.06)]"
            >
                {/* Logo + Brand */}
                <div className="flex flex-col items-center gap-3 mb-8">
                    <div className="relative">
                        <div
                            className="absolute inset-0 rounded-full blur-2xl"
                            style={{ background: "rgba(0,240,255,0.25)", scale: "1.4" }}
                            aria-hidden="true"
                        />
                        <Image
                            src="/STEEZE2 (1).png"
                            alt="Steeze Humanizer logo"
                            width={52}
                            height={52}
                            className="relative drop-shadow-[0_0_10px_rgba(0,240,255,0.6)] rounded-2xl"
                            priority
                        />
                    </div>
                    <span className="text-sm font-bold tracking-[0.2em] text-teal uppercase">
                        Steeze Humanizer
                    </span>
                    <h1 className="text-xl font-extrabold tracking-tight text-foreground mt-1">
                        Welcome back
                    </h1>
                    <p className="text-xs text-foreground/45 text-center leading-relaxed">
                        Sign in to continue humanizing your text
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    {/* Email */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="email"
                            className="block text-xs font-semibold tracking-[0.14em] text-teal/80 uppercase"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(""); }}
                            placeholder="you@example.com"
                            className="glow-ring w-full rounded-xl border border-card-border bg-input-bg px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition focus:border-teal/40 outline-none"
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="password"
                                className="block text-xs font-semibold tracking-[0.14em] text-teal/80 uppercase"
                            >
                                Password
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-xs text-teal/60 hover:text-teal transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                placeholder="••••••••"
                                className="glow-ring w-full rounded-xl border border-card-border bg-input-bg px-4 py-3 pr-11 text-sm text-foreground placeholder:text-foreground/30 transition focus:border-teal/40 outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-teal transition-colors"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-xs font-medium text-red-400" role="alert">
                            {error}
                        </p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-glow w-full rounded-xl bg-gradient-to-r from-teal to-teal-dark py-3 text-sm font-bold tracking-wide text-[#0a0e1a] transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="spinner" />
                                Signing in…
                            </span>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center gap-3">
                    <span className="flex-1 h-px bg-card-border" />
                    <span className="text-xs text-foreground/30">or</span>
                    <span className="flex-1 h-px bg-card-border" />
                </div>

                {/* Google OAuth placeholder */}
                <button
                    type="button"
                    className="glow-ring btn-glow w-full flex items-center justify-center gap-3 rounded-xl border border-card-border bg-white/[0.04] hover:bg-white/[0.08] px-4 py-3 text-sm font-medium text-foreground/70 hover:text-foreground transition"
                >
                    {/* Google G icon */}
                    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                {/* Sign up link */}
                <p className="mt-7 text-center text-xs text-foreground/40">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="text-teal hover:underline font-medium">
                        Create one for free
                    </Link>
                </p>
            </div>

            {/* Footer */}
            <p className="relative z-10 mt-6 text-xs text-foreground/25">
                © {new Date().getFullYear()} STEEZE TECH — All rights reserved.
            </p>
        </div>
    );
}