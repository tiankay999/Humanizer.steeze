"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const NAV_LINKS = [
    { label: "Docs", href: "/docs" },
    { label: "Pricing", href: "/pricing" },
];

interface HeaderProps {
    onOpenHistory?: () => void;
}

export default function Header({ onOpenHistory }: HeaderProps) {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check for token on mount (and whenever storage changes in this tab)
    useEffect(() => {
        const check = () => setIsLoggedIn(!!localStorage.getItem("token"));
        check();
        window.addEventListener("storage", check);
        return () => window.removeEventListener("storage", check);
    }, []);

    function handleLogout() {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        router.push("/login");
    }

    return (
        <header className="sticky top-0 z-30 border-b border-card-border bg-[#0a0e1a]/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

                {/* Logo + Brand */}
                <Link href="/" className="flex items-center gap-3">
                    <Image
                        src="/STEEZE2 (1).png"
                        alt="Steeze Humanizer logo"
                        width={36}
                        height={36}
                        className="drop-shadow-[0_0_6px_rgba(0,240,255,0.5)] rounded-2xl"
                    />
                    <span className="text-sm font-bold tracking-[0.18em] text-teal uppercase sm:text-base">
                        Steeze Humanizer
                    </span>
                </Link>

                {/* Nav */}
                <nav className="flex items-center gap-1 sm:gap-2">
                    {NAV_LINKS.map(({ label, href }) => (
                        <Link
                            key={label}
                            href={href}
                            className="glow-ring rounded-md px-3 py-1.5 text-xs font-medium tracking-wide text-foreground/70 transition hover:bg-white/5 hover:text-teal sm:text-sm"
                        >
                            {label}
                        </Link>
                    ))}

                    {/* History button — only visible when logged in */}
                    {isLoggedIn && onOpenHistory && (
                        <button
                            onClick={onOpenHistory}
                            className="glow-ring flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium tracking-wide text-foreground/70 transition hover:bg-white/5 hover:text-teal sm:text-sm"
                            aria-label="View history"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            History
                        </button>
                    )}

                    {isLoggedIn ? (
                        /* ── Logged-in state ── */
                        <button
                            onClick={handleLogout}
                            className="glow-ring ml-2 rounded-md px-3 py-1.5 text-xs font-medium tracking-wide text-foreground/70 transition hover:bg-white/5 hover:text-red-400 sm:text-sm"
                        >
                            Log out
                        </button>
                    ) : (
                        /* ── Logged-out state ── */
                        <Link
                            href="/login"
                            className="glow-ring ml-2 rounded-md border border-teal/30 px-3 py-1.5 text-xs font-semibold tracking-wide text-teal transition hover:bg-teal/10 sm:text-sm"
                        >
                            Login
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

