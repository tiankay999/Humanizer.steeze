"use client";

import Link from "next/link";
import Header from "@/app/components/Header";
import BackgroundEffects from "@/app/components/BackgroundEffects";

/* ── Checkmark icon ── */
function CheckIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-teal shrink-0"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

/* ── Sparkle icon ── */
function SparkleIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-teal"
        >
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
    );
}

const FEATURES = [
    "Unlimited humanizations for logged-in users",
    "Multiple tone options (Casual, Formal, Neutral & more)",
    "Preserves your original meaning",
    "History — revisit past humanizations",
    "Lightning-fast AI processing",
    "No credit card required — ever",
];

const FAQS = [
    {
        q: "Is Steeze Humanizer really free?",
        a: "Yes — 100 % free. We believe everyone should have access to natural, human-sounding writing.",
    },
    {
        q: "Do I need to create an account?",
        a: "You can try 5 humanizations as a guest. Sign up for free to unlock unlimited use and history.",
    },
    {
        q: "Will there ever be a paid plan?",
        a: "We have no plans to charge for the core humanization features. If we introduce premium add-ons in the future, the base experience will remain free.",
    },
    {
        q: "Is my data safe?",
        a: "We never sell your data. Your text is processed securely and your history is only visible to you.",
    },
];

/* ─────────────────────────────────────
   Pricing Page
   ───────────────────────────────────── */
export default function PricingPage() {
    return (
        <div className="relative flex min-h-screen flex-col">
            <BackgroundEffects />
            <Header />

            <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-16 sm:px-6 lg:px-8">

                {/* ── Headline ── */}
                <section className="mb-14 text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/5 px-4 py-1.5 text-xs font-semibold tracking-widest text-teal uppercase">
                        <SparkleIcon />
                        Pricing
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                        Completely{" "}
                        <span className="bg-gradient-to-r from-teal to-teal-dark bg-clip-text text-transparent">
                            free.
                        </span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-foreground/55 sm:text-base">
                        No subscriptions, no hidden fees, no credit card.
                        Just paste your text and get natural, human-sounding results.
                    </p>
                </section>

                {/* ── Plan Card ── */}
                <section className="mx-auto mb-20 w-full max-w-md">
                    <div className="group relative overflow-hidden rounded-2xl border border-teal/20 bg-card-bg backdrop-blur-xl shadow-[0_0_80px_rgba(0,240,255,0.06)] transition hover:border-teal/35 hover:shadow-[0_0_100px_rgba(0,240,255,0.1)]">

                        {/* Glow bar */}
                        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-teal/60 to-transparent" />

                        <div className="px-8 py-10">
                            {/* Plan header */}
                            <div className="mb-8 text-center">
                                <span className="mb-2 inline-block rounded-full bg-teal/10 px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-teal uppercase">
                                    Forever Free
                                </span>
                                <div className="mt-4 flex items-baseline justify-center gap-1">
                                    <span className="text-5xl font-extrabold tracking-tight text-foreground">$0</span>
                                    <span className="text-sm font-medium text-foreground/40">/month</span>
                                </div>
                                <p className="mt-2 text-xs text-foreground/45">
                                    No strings attached
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="mb-6 h-px bg-gradient-to-r from-transparent via-card-border to-transparent" />

                            {/* Feature list */}
                            <ul className="mb-8 space-y-3.5">
                                {FEATURES.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm text-foreground/75">
                                        <CheckIcon />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <Link
                                href="/signup"
                                className="btn-glow block w-full rounded-xl bg-gradient-to-r from-teal to-teal-dark py-3.5 text-center text-sm font-bold tracking-wide text-[#0a0e1a] transition hover:brightness-110"
                            >
                                Get Started — It&apos;s Free
                            </Link>
                            <p className="mt-3 text-center text-[11px] text-foreground/35">
                                Already have an account?{" "}
                                <Link href="/login" className="text-teal/70 hover:text-teal transition-colors">
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── FAQ ── */}
                <section className="mx-auto w-full max-w-2xl">
                    <h2 className="mb-8 text-center text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {FAQS.map(({ q, a }) => (
                            <details
                                key={q}
                                className="group rounded-xl border border-card-border bg-card-bg/60 backdrop-blur-md transition-colors hover:border-teal/20 open:border-teal/25"
                            >
                                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-semibold text-foreground/85 transition select-none marker:content-none [&::-webkit-details-marker]:hidden">
                                    {q}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="shrink-0 text-foreground/30 transition-transform group-open:rotate-180"
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </summary>
                                <p className="px-6 pb-5 text-sm leading-relaxed text-foreground/55">
                                    {a}
                                </p>
                            </details>
                        ))}
                    </div>
                </section>
            </main>

            {/* ── Footer ── */}
            <footer className="relative z-10 border-t border-card-border py-4 text-center text-xs text-foreground/30">
                © {new Date().getFullYear()} STEEZE TECH — All rights reserved.
            </footer>
        </div>
    );
}
