import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { ThemeProvider } from "@/components/site/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SimplyDone — One place for life's little tasks",
  description:
    "A fast, minimal home for everyday digital utilities. Convert, compress, generate, and clean up files in one consistent place — no accounts, no clutter, no learning curve.",
  keywords: [
    "online tools",
    "image converter",
    "PDF merge",
    "QR code generator",
    "JSON formatter",
    "file compressor",
    "everyday utilities",
  ],
  authors: [{ name: "SimplyDone" }],
  applicationName: "SimplyDone",
  openGraph: {
    title: "SimplyDone",
    description: "One place for life's little tasks.",
    type: "website",
    siteName: "SimplyDone",
  },
  twitter: {
    card: "summary_large_image",
    title: "SimplyDone",
    description: "One place for life's little tasks.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#18181b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
