"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import BackgroundEffects from "@/app/components/BackgroundEffects";
import { useRouter } from "next/navigation";

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

/* declare google global for TypeScript */
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: Record<string, unknown>) => void;
                    renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
                };
            };
        };
    }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

/* ─────────────────────────────────────
   Signup Page
   ───────────────────────────────────── */
export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const googleBtnRef = useRef<HTMLDivElement>(null);

    /* ── Load Google Identity Services script ── */
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
            if (window.google && googleBtnRef.current) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleResponse,
                });
                window.google.accounts.id.renderButton(googleBtnRef.current, {
                    theme: "filled_black",
                    size: "large",
                    width: "100%",
                    text: "signup_with",
                    shape: "pill",
                });
            }
        };
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── Handle Google credential response ── */
    async function handleGoogleResponse(response: { credential: string }) {
        try {
            setError("");
            setLoading(true);

            const res = await fetch(
                `${(process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "")}/login/google`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ credential: response.credential }),
                }
            );

            const data = await res.json();

            if (data.token) {
                localStorage.setItem("token", data.token);
                router.push("/");
            } else {
                setError(data.message || "Google sign-up failed. Please try again.");
            }
        } catch {
            setError("Google sign-up failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            if (!name.trim() || !email.trim() || !phone.trim() || !password) {
                setError("Please fill in all fields.");
                return;
            }
            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                return;
            }
            setError("");
            setLoading(true);

            const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')}/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password, phone }),
            });

            const data = await res.json();
            console.log(data);

            if (data.user) {
                // Signup successful — no token issued, redirect to login
                router.push("/login");
            } else {
                setError(data.message || "Signup failed. Please try again.");
            }
        } catch (error) {
            console.log(error);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
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
                        Create your account
                    </h1>
                    <p className="text-xs text-foreground/45 text-center leading-relaxed">
                        Join Steeze and start humanizing your text
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Name */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="name"
                            className="block text-xs font-semibold tracking-[0.14em] text-teal/80 uppercase"
                        >
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            autoComplete="name"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError(""); }}
                            placeholder="John Doe"
                            className="glow-ring w-full rounded-xl border border-card-border bg-input-bg px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition focus:border-teal/40 outline-none"
                        />
                    </div>

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

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="phone"
                            className="block text-xs font-semibold tracking-[0.14em] text-teal/80 uppercase"
                        >
                            Phone Number
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            autoComplete="tel"
                            value={phone}
                            onChange={(e) => { setPhone(e.target.value); setError(""); }}
                            placeholder="+233 555 000 000"
                            className="glow-ring w-full rounded-xl border border-card-border bg-input-bg px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition focus:border-teal/40 outline-none"
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="password"
                            className="block text-xs font-semibold tracking-[0.14em] text-teal/80 uppercase"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
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

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="confirmPassword"
                            className="block text-xs font-semibold tracking-[0.14em] text-teal/80 uppercase"
                        >
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirm ? "text" : "password"}
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                                placeholder="••••••••"
                                className="glow-ring w-full rounded-xl border border-card-border bg-input-bg px-4 py-3 pr-11 text-sm text-foreground placeholder:text-foreground/30 transition focus:border-teal/40 outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-teal transition-colors"
                                aria-label={showConfirm ? "Hide password" : "Show password"}
                            >
                                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
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
                                Creating account…
                            </span>
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center gap-3">
                    <span className="flex-1 h-px bg-card-border" />
                    <span className="text-xs text-foreground/30">or</span>
                    <span className="flex-1 h-px bg-card-border" />
                </div>

                {/* Google Sign-Up button (rendered by Google Identity Services) */}
                <div
                    ref={googleBtnRef}
                    className="flex items-center justify-center w-full [&>div]:!w-full"
                />

                {/* Sign in link */}
                <p className="mt-7 text-center text-xs text-foreground/40">
                    Already have an account?{" "}
                    <Link href="/login" className="text-teal hover:underline font-medium">
                        Sign in
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