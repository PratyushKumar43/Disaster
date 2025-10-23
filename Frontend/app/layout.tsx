import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import QueryProvider from "./providers/QueryProvider";
import { ThemeProvider } from "../components/providers/ThemeProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Disaster Management India - Real-time Emergency Response Platform",
  description: "Comprehensive disaster management application for India enabling real-time coordination, resource management, and emergency response for government agencies, NGOs, and emergency responders.",
  keywords: ["disaster management", "emergency response", "India", "resource tracking", "relief operations"],
  authors: [{ name: "Disaster Management Team" }],
};

export const viewport: Viewport = {
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
        className={`${outfit.variable} font-outfit antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          defaultTheme="system"
          storageKey="theme"
        >
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
