import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing — 100% Free AI Text Humanizer",
    description:
        "Steeze Humanizer is completely free. No subscriptions, no hidden fees, no credit card. Humanize your AI text with unlimited use.",
    openGraph: {
        title: "Pricing — Steeze Humanizer | 100% Free AI Text Humanizer",
        description:
            "Steeze Humanizer is completely free. No subscriptions, no hidden fees. Humanize your AI text with unlimited use.",
        url: "/pricing",
    },
};

export default function PricingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
