import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Log In",
    description: "Sign in to your Steeze Humanizer account to access unlimited humanizations and history.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
