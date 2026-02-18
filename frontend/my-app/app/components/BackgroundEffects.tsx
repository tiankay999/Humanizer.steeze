import Image from "next/image";

export default function BackgroundEffects() {
    return (
        <>
            {/* Circuit-line grid overlay */}
            <div className="circuit-bg" aria-hidden="true" />

            {/* Animated floating blobs */}
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
        </>
    );
}
