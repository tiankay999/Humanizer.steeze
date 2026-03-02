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

        </>
    );
}
