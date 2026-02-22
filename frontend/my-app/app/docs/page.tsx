"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../components/Header";
import BackgroundEffects from "../components/BackgroundEffects";

/* ══════════════════════════════════════════════
   Docs – Table of Contents
   ══════════════════════════════════════════════ */
const TOC = [
    { id: "getting-started", label: "Getting Started" },
    { id: "how-it-works", label: "How It Works" },
    { id: "features", label: "Features" },
    { id: "api-reference", label: "API Reference" },
    { id: "account", label: "Account & Auth" },
    { id: "faq", label: "FAQ" },
] as const;

/* ── Reusable section wrapper ── */
function Section({
    id,
    title,
    children,
}: {
    id: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section id={id} className="scroll-mt-24">
            <h2 className="mb-5 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                <span className="bg-gradient-to-r from-teal to-teal-dark bg-clip-text text-transparent">
                    #
                </span>{" "}
                {title}
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-foreground/70">
                {children}
            </div>
        </section>
    );
}

/* ── Inline code badge ── */
function Code({ children }: { children: React.ReactNode }) {
    return (
        <code className="rounded-md border border-teal/20 bg-teal/[0.06] px-1.5 py-0.5 text-xs font-mono text-teal">
            {children}
        </code>
    );
}

/* ── Step card for "How it works" ── */
function Step({
    number,
    title,
    description,
}: {
    number: number;
    title: string;
    description: string;
}) {
    return (
        <div className="flex gap-4 items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal to-teal-dark text-xs font-bold text-[#0a0e1a]">
                {number}
            </div>
            <div>
                <h4 className="text-sm font-bold text-foreground">{title}</h4>
                <p className="mt-1 text-foreground/60">{description}</p>
            </div>
        </div>
    );
}

/* ── Feature card ── */
function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="group rounded-xl border border-card-border bg-card-bg p-5 backdrop-blur-lg transition hover:border-teal/30 hover:shadow-[0_0_30px_rgba(0,240,255,0.06)]">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-teal/10 text-teal transition group-hover:bg-teal/20">
                {icon}
            </div>
            <h4 className="text-sm font-bold text-foreground">{title}</h4>
            <p className="mt-2 text-xs leading-relaxed text-foreground/55">
                {description}
            </p>
        </div>
    );
}

/* ── FAQ item ── */
function FaqItem({
    question,
    answer,
}: {
    question: string;
    answer: string;
}) {
    const [open, setOpen] = useState(false);
    return (
        <div className="rounded-xl border border-card-border bg-card-bg backdrop-blur-lg overflow-hidden transition hover:border-teal/25">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-foreground transition hover:text-teal"
            >
                {question}
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
                    className={`shrink-0 text-teal/50 transition-transform duration-300 ${open ? "rotate-180" : ""
                        }`}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            <div
                className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
            >
                <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-xs leading-relaxed text-foreground/55">
                        {answer}
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ── Endpoint card ── */
function EndpointCard({
    method,
    path,
    description,
    body,
    response,
}: {
    method: string;
    path: string;
    description: string;
    body?: string;
    response?: string;
}) {
    return (
        <div className="rounded-xl border border-card-border bg-card-bg p-5 backdrop-blur-lg space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
                <span className="rounded-md bg-teal/15 px-2.5 py-1 text-xs font-bold tracking-wider text-teal uppercase">
                    {method}
                </span>
                <code className="text-sm font-mono text-foreground/80">{path}</code>
            </div>
            <p className="text-xs text-foreground/60">{description}</p>
            {body && (
                <div>
                    <span className="text-xs font-semibold tracking-wide text-teal/70 uppercase">
                        Request Body
                    </span>
                    <pre className="mt-1.5 overflow-x-auto rounded-lg border border-card-border bg-input-bg px-4 py-3 text-xs font-mono leading-relaxed text-foreground/70">
                        {body}
                    </pre>
                </div>
            )}
            {response && (
                <div>
                    <span className="text-xs font-semibold tracking-wide text-teal/70 uppercase">
                        Response
                    </span>
                    <pre className="mt-1.5 overflow-x-auto rounded-lg border border-card-border bg-input-bg px-4 py-3 text-xs font-mono leading-relaxed text-foreground/70">
                        {response}
                    </pre>
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════
   Docs Page
   ══════════════════════════════════════════════ */
export default function DocsPage() {
    const [activeSection, setActiveSection] = useState<string>("getting-started");
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    /* ── Intersection Observer for active section tracking ── */
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                }
            },
            { rootMargin: "-20% 0px -70% 0px" }
        );

        for (const { id } of TOC) {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        }
        return () => observer.disconnect();
    }, []);

    return (
        <div className="relative flex min-h-screen flex-col">
            <BackgroundEffects />
            <Header />

            <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
                {/* ═══ Sidebar (desktop) ═══ */}
                <aside className="hidden lg:block lg:w-56 shrink-0 pr-8">
                    <nav className="sticky top-24 space-y-1">
                        <h3 className="mb-4 text-xs font-bold tracking-[0.2em] text-teal/60 uppercase">
                            Documentation
                        </h3>
                        {TOC.map(({ id, label }) => (
                            <a
                                key={id}
                                href={`#${id}`}
                                className={`block rounded-lg px-3 py-2 text-xs font-medium transition ${activeSection === id
                                        ? "bg-teal/10 text-teal border-l-2 border-teal"
                                        : "text-foreground/50 hover:bg-white/5 hover:text-foreground/80"
                                    }`}
                            >
                                {label}
                            </a>
                        ))}

                        {/* Back to app link */}
                        <div className="pt-6">
                            <Link
                                href="/"
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground/40 transition hover:text-teal"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="19" y1="12" x2="5" y2="12" />
                                    <polyline points="12 19 5 12 12 5" />
                                </svg>
                                Back to Editor
                            </Link>
                        </div>
                    </nav>
                </aside>

                {/* ═══ Mobile TOC toggle ═══ */}
                <div className="fixed bottom-6 right-6 z-40 lg:hidden">
                    <button
                        onClick={() => setMobileNavOpen((v) => !v)}
                        className="btn-glow flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-teal to-teal-dark text-[#0a0e1a] shadow-lg"
                        aria-label="Toggle table of contents"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="15" y2="12" />
                            <line x1="3" y1="18" x2="18" y2="18" />
                        </svg>
                    </button>

                    {/* Mobile nav dropdown */}
                    {mobileNavOpen && (
                        <div className="absolute bottom-16 right-0 w-56 rounded-xl border border-card-border bg-[#0a0e1a]/95 backdrop-blur-xl p-3 shadow-2xl">
                            {TOC.map(({ id, label }) => (
                                <a
                                    key={id}
                                    href={`#${id}`}
                                    onClick={() => setMobileNavOpen(false)}
                                    className={`block rounded-lg px-3 py-2 text-xs font-medium transition ${activeSection === id
                                            ? "bg-teal/10 text-teal"
                                            : "text-foreground/50 hover:text-foreground/80"
                                        }`}
                                >
                                    {label}
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {/* ═══ Content ═══ */}
                <div className="min-w-0 flex-1 space-y-16">
                    {/* Hero */}
                    <div className="rounded-2xl border border-card-border bg-card-bg p-8 backdrop-blur-lg sm:p-10">
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                            Steeze Humanizer{" "}
                            <span className="bg-gradient-to-r from-teal to-teal-dark bg-clip-text text-transparent">
                                Docs
                            </span>
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/55 sm:text-base">
                            Everything you need to know about turning AI-generated text into
                            natural, human-sounding prose — fast and ethically.
                        </p>

                        {/* Quick-links */}
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/"
                                className="btn-glow inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal to-teal-dark px-5 py-2.5 text-xs font-bold tracking-wide text-[#0a0e1a] uppercase shadow-md transition"
                            >
                                Open Editor
                            </Link>
                            <a
                                href="#how-it-works"
                                className="btn-glow inline-flex items-center gap-2 rounded-xl border border-teal/30 px-5 py-2.5 text-xs font-semibold tracking-wide text-teal uppercase transition hover:bg-teal/10"
                            >
                                Quick Start →
                            </a>
                        </div>
                    </div>

                    {/* ──────── GETTING STARTED ──────── */}
                    <Section id="getting-started" title="Getting Started">
                        <p>
                            <strong className="text-foreground">Steeze Humanizer</strong> is an
                            AI-powered writing tool that rewrites text to sound more natural and
                            human while preserving your original meaning. It&apos;s designed for
                            students, professionals, and content creators who want polished,
                            authentic-sounding copy.
                        </p>
                        <div className="rounded-xl border border-card-border bg-card-bg p-5 backdrop-blur-lg">
                            <h4 className="text-xs font-bold tracking-[0.14em] text-teal/80 uppercase mb-3">
                                Quick checklist to get going
                            </h4>
                            <ul className="space-y-2.5">
                                {[
                                    "Navigate to the Editor (home page)",
                                    "Paste or type your text in the left panel",
                                    "Choose a tone (Neutral, Formal, or Casual)",
                                    'Click "Humanize" and wait a moment',
                                    "Copy the result from the right panel",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal/10 text-[10px] font-bold text-teal">
                                            {i + 1}
                                        </span>
                                        <span className="text-foreground/65">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <p>
                            No account is required to use the humanizer. However,{" "}
                            <a href="#account" className="text-teal hover:underline font-medium">
                                creating an account
                            </a>{" "}
                            unlocks history tracking so you can revisit previous rewrites.
                        </p>
                    </Section>

                    {/* ──────── HOW IT WORKS ──────── */}
                    <Section id="how-it-works" title="How It Works">
                        <p>
                            Under the hood, Steeze Humanizer uses a large language model (LLM) to
                            analyze your text and produce a rewritten version. Here&apos;s the flow:
                        </p>
                        <div className="space-y-5 rounded-xl border border-card-border bg-card-bg p-6 backdrop-blur-lg">
                            <Step
                                number={1}
                                title="Paste your text"
                                description="Enter up to 5,000 characters in the input panel. This can be an essay, email, report, or any written content."
                            />
                            <Step
                                number={2}
                                title="Select your tone"
                                description="Choose between Neutral (balanced), Formal (professional), or Casual (conversational). The tone guides how the LLM rewrites your text."
                            />
                            <Step
                                number={3}
                                title='Click "Humanize"'
                                description="Your text is sent to the backend API, which passes it to the LLM with a specialized rewrite prompt. The model returns a more natural version."
                            />
                            <Step
                                number={4}
                                title="Review & copy"
                                description="The humanized output appears in the right panel. Use the Copy button to grab it, or manually adjust the text as needed."
                            />
                        </div>
                        <p>
                            If you&apos;re logged in, each successful rewrite is automatically saved
                            to your <strong className="text-foreground">History</strong> for later
                            reference.
                        </p>
                    </Section>

                    {/* ──────── FEATURES ──────── */}
                    <Section id="features" title="Features">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <FeatureCard
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                    </svg>
                                }
                                title="Smart Rewriting"
                                description="Our LLM analyzes sentence structure, word choice, and flow to produce naturally-worded text that retains your original meaning."
                            />
                            <FeatureCard
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
                                    </svg>
                                }
                                title="Tone Selection"
                                description="Switch between Neutral, Formal, and Casual tones with a single click. Each adjusts vocabulary, sentence length, and formality level."
                            />
                            <FeatureCard
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                }
                                title="One-Click Copy"
                                description="Instantly copy the humanized output to your clipboard with a single button press. No manual selection required."
                            />
                            <FeatureCard
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                    </svg>
                                }
                                title="History Tracking"
                                description="When logged in, every rewrite is automatically saved. Browse, reload, or reference past humanizations from the History panel."
                            />
                            <FeatureCard
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" /><polyline points="14 2 14 8 20 8" /><path d="M2 15h10" /><path d="m9 18 3-3-3-3" />
                                    </svg>
                                }
                                title="Keep Formatting"
                                description="Toggle 'Keep formatting' to preserve your original paragraph structure, bullet points, and line breaks during rewriting."
                            />
                            <FeatureCard
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                }
                                title="Secure Auth"
                                description="Create an account with email & password. JWT-based authentication keeps your data safe and your sessions private."
                            />
                        </div>
                    </Section>

                    {/* ──────── API REFERENCE ──────── */}
                    <Section id="api-reference" title="API Reference">
                        <p>
                            The Steeze Humanizer backend exposes a REST API at{" "}
                            <Code>http://localhost:5000/api/llm</Code>. Below are the primary
                            endpoints used by the frontend.
                        </p>

                        <div className="space-y-4">
                            <EndpointCard
                                method="POST"
                                path="/api/llm/rewrite"
                                description="Rewrites the given text using the specified tone. This is the core humanization endpoint."
                                body={`{
  "text": "Your text to humanize...",
  "targetMode": "Neutral" | "Formal" | "Casual"
}`}
                                response={`{
  "rewritten": "The humanized output text...",
  "changes": [
    "Changed passive voice to active",
    "Simplified complex sentence"
  ]
}`}
                            />

                            <EndpointCard
                                method="POST"
                                path="/api/llm/history"
                                description="Saves a rewrite entry to the authenticated user's history. Requires a valid JWT token in the Authorization header."
                                body={`{
  "text": "Original input text",
  "humanizedText": "Rewritten output",
  "tone": "Neutral"
}

Headers: {
  "Authorization": "Bearer <token>"
}`}
                                response={`{
  "success": true,
  "entry": { ... }
}`}
                            />

                            <EndpointCard
                                method="GET"
                                path="/api/llm/history"
                                description="Retrieves all history entries for the authenticated user. Requires JWT."
                                response={`{
  "history": [
    {
      "id": 1,
      "text": "Original text",
      "humanizedText": "Rewritten text",
      "tone": "Formal",
      "createdAt": "2026-02-22T12:00:00Z"
    }
  ]
}`}
                            />

                            <EndpointCard
                                method="POST"
                                path="/users"
                                description="Creates a new user account."
                                body={`{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "phone": "+1234567890"
}`}
                                response={`{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}`}
                            />
                        </div>
                    </Section>

                    {/* ──────── ACCOUNT & AUTH ──────── */}
                    <Section id="account" title="Account & Auth">
                        <p>
                            You can use Steeze Humanizer without an account — just open the
                            editor and start humanizing. However, signing up gives you access to
                            these perks:
                        </p>
                        <div className="rounded-xl border border-card-border bg-card-bg p-5 backdrop-blur-lg space-y-3">
                            {[
                                {
                                    title: "Rewrite History",
                                    desc: "Every humanization is saved so you can revisit, compare, or re-load past entries.",
                                },
                                {
                                    title: "Persistent Sessions",
                                    desc: "Stay logged in across browser sessions using JWT tokens stored locally.",
                                },
                                {
                                    title: "Future Features",
                                    desc: "Upcoming features like custom style profiles, bulk processing, and analytics will be account-only.",
                                },
                            ].map(({ title, desc }) => (
                                <div key={title} className="flex items-start gap-3">
                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal" />
                                    <div>
                                        <h4 className="text-sm font-bold text-foreground">{title}</h4>
                                        <p className="text-foreground/55">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h3 className="text-base font-bold text-foreground mt-2">
                            Signing up
                        </h3>
                        <p>
                            Click{" "}
                            <Link href="/signup" className="text-teal hover:underline font-medium">
                                Sign Up
                            </Link>{" "}
                            and provide your name, email, phone number, and a password. After
                            registration you&apos;ll be redirected to the{" "}
                            <Link href="/login" className="text-teal hover:underline font-medium">
                                Login
                            </Link>{" "}
                            page to authenticate.
                        </p>
                        <h3 className="text-base font-bold text-foreground">Logging in</h3>
                        <p>
                            Enter your email and password on the login page. A JWT token is
                            generated and stored in{" "}
                            <Code>localStorage</Code> so you stay signed in until you explicitly
                            log out.
                        </p>
                    </Section>

                    {/* ──────── FAQ ──────── */}
                    <Section id="faq" title="FAQ">
                        <div className="space-y-3">
                            <FaqItem
                                question="Is Steeze Humanizer free to use?"
                                answer="Yes! The core humanization feature is completely free. You can paste text and get a rewritten version without creating an account or paying anything."
                            />
                            <FaqItem
                                question="What is the character limit?"
                                answer="You can humanize up to 5,000 characters per request. This is roughly 750–1,000 words, enough for most essays, emails, and blog posts."
                            />
                            <FaqItem
                                question="What tones are available?"
                                answer="Currently three tones are supported: Neutral (balanced, general-purpose), Formal (professional, academic), and Casual (conversational, friendly). More tones may be added in the future."
                            />
                            <FaqItem
                                question="Does it support languages other than English?"
                                answer="Right now the humanizer is optimized for English text. Support for additional languages is on our roadmap."
                            />
                            <FaqItem
                                question="Is my text stored or shared?"
                                answer="Your input text is sent to the backend for processing and is not permanently stored unless you are logged in — in which case only the rewrite pair is saved to your private history."
                            />
                            <FaqItem
                                question="Can I use this for academic work?"
                                answer="Steeze Humanizer is intended as a writing improvement tool — not a plagiarism bypass tool. Our built-in guardrails detect and refuse requests that attempt to evade plagiarism detection. Always use responsibly and in compliance with your institution's policies."
                            />
                            <FaqItem
                                question="How do I delete my history?"
                                answer="You can manage your history from the History panel (accessible from the header when logged in). Individual entries can be deleted, or you can clear all history at once."
                            />
                        </div>
                    </Section>

                    {/* ──────── CTA ──────── */}
                    <div className="rounded-2xl border border-card-border bg-card-bg p-8 backdrop-blur-lg text-center sm:p-10">
                        <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                            Ready to{" "}
                            <span className="bg-gradient-to-r from-teal to-teal-dark bg-clip-text text-transparent">
                                humanize
                            </span>
                            ?
                        </h2>
                        <p className="mx-auto mt-3 max-w-md text-sm text-foreground/50">
                            Head back to the editor and paste your text. It takes just seconds.
                        </p>
                        <Link
                            href="/"
                            className="btn-glow mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal to-teal-dark px-7 py-3 text-sm font-bold tracking-wide text-[#0a0e1a] uppercase shadow-md transition"
                        >
                            Open the Editor
                        </Link>
                    </div>
                </div>
            </main>

            {/* ════════ FOOTER ════════ */}
            <footer className="relative z-10 border-t border-card-border py-4 text-center text-xs text-foreground/30">
                © {new Date().getFullYear()} STEEZE TECH — All rights reserved.
            </footer>
        </div>
    );
}