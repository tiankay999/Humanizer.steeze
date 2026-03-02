import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up",
    description: "Create a free Steeze Humanizer account to unlock unlimited AI text humanizations and history tracking.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function SignupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
