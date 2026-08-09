import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "CSE Community — Our campus. Unfiltered.",
  description:
    "The modern digital commons for Computer Science & Engineering students. Read anonymous confessions, download verified lecture notes & PYQs, discover hackathons, and attend campus tech events.",
  keywords: [
    "CSE Community",
    "Computer Science Engineering",
    "Campus Confessions",
    "Engineering Notes",
    "Solved PYQ",
    "Hackathons 2026",
    "CSE Placements",
  ],
  authors: [{ name: "CSE Community" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://csecommunity.org"),
  openGraph: {
    title: "CSE Community — Our campus. Unfiltered.",
    description: "The digital commons for CSE students. Anonymous confessions, verified study vaults, and hackathons.",
    url: "https://csecommunity.org",
    siteName: "CSE Community",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSE Community — Our campus. Unfiltered.",
    description: "The digital commons for CSE students. Anonymous confessions, verified study vaults, and hackathons.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-[#080b14] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200`}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
