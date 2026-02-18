import Image from "next/image";

const NAV_LINKS = ["Docs", "Pricing", "Login"];

export default function Header() {
    return (
        <header className="sticky top-0 z-30 border-b border-card-border bg-[#0a0e1a]/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                {/* logo + brand */}
                <div className="flex items-center gap-3 ">
                    <Image
                        src="/STEEZE2 (1).png"
                        alt="Steeze Humanizer logo"
                        width={36}
                        height={36}
                        className="drop-shadow-[0_0_6px_rgba(0,240,255,0.5)]    rounded-2xl"
                    />
                    <span className="text-sm font-bold tracking-[0.18em] text-teal uppercase sm:text-base">
                        Steeze Humanizer
                    </span>
                </div>

                {/* nav */}
                <nav className="flex items-center gap-1 sm:gap-2">
                    {NAV_LINKS.map((label) => (
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
    );
}
