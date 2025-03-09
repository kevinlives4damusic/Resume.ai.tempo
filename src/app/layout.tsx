import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { TempoInit } from "@/components/tempo-init";
import { ThemeProvider } from "@/components/theme-provider";
import MobileNav from "@/components/mobile-nav";
import { AuthProvider } from "@/components/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Resume Analyzer - AI-Powered CV Analysis",
  description: "Get instant feedback on your resume with AI-powered analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script src="https://api.tempolabs.ai/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <MobileNav />
          </ThemeProvider>
        </AuthProvider>
        <TempoInit />
      </body>
    </html>
  );
}
