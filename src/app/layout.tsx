import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spentree - Gamified Expense Tracking System",
  description: "The Precision Naturalist. A hand-illustrated field guide that breathes and glows for your financial tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} ${manrope.variable} antialiased bg-surface text-on-surface min-h-screen font-body`}
      >
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
