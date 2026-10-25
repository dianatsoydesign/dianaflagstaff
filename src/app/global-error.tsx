"use client";

import { Tenor_Sans, Pontano_Sans } from "next/font/google";
import { ErrorState } from "@/components/error-state";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const display = Tenor_Sans({ variable: "--font-display", subsets: ["latin"], weight: "400" });
const sans = Pontano_Sans({ variable: "--font-sans", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <html lang="en" className={`${display.variable} ${sans.variable} antialiased`} suppressHydrationWarning>
    <head><title>Something went wrong · Diana&apos;s art</title><meta name="robots" content="noindex" /></head>
    <body className="min-h-screen font-sans"><ThemeProvider><main><ErrorState retry={retry} /></main></ThemeProvider></body>
  </html>;
}
