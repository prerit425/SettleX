import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SettleX — Split expenses, keep friends",
  description: "A playful, simple way to share expenses and settle up with friends.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
