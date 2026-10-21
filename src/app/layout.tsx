import type { Metadata, Viewport } from "next";
import { Jost, Tenor_Sans, Pontano_Sans } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { InquiryCartProvider } from "@/lib/inquiry-cart";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE_NAME } from "@/lib/site";
import "./globals.css";

/** Ventura Fluid uses Tenor Sans for titles/headings */
const display = Tenor_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

/** Ventura Fluid uses Pontano Sans for body/UI */
const sans = Pontano_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

/** Thin type for the "made in Flagstaff" tagline */
const tagline = Jost({
  variable: "--font-tagline",
  subsets: ["latin"],
  weight: "200",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} • made in Flagstaff`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Handmade crochet in Flagstaff, at Mountainaire General Store and for friends & family. No shipping. Venmo handoff.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${tagline.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        <ThemeProvider>
          <InquiryCartProvider>
            <SiteHeader />
            <main className="flex-1 pb-16">{children}</main>
          </InquiryCartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
