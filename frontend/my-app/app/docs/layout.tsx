import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Documentation — How to Use Steeze Humanizer",
    description:
        "Learn how to use Steeze Humanizer. Step-by-step guides, features overview, FAQs, and everything about turning AI-generated text into natural human writing.",
    openGraph: {
        title: "Documentation — Steeze Humanizer",
        description:
            "Guides, features, and FAQs for Steeze Humanizer. Turn AI text into natural, human-sounding prose.",
        url: "/docs",
    },
};

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
