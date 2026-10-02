import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout";
import { SITE_NAME } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Real-time Security Intelligence`,
    template: `%s | ${SITE_NAME}`,
  },
  description: "AI-verified war and security news, mapped in real time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: "#17171c" }}
      >
        <Providers>
          <Header />
          <main className="max-w-[1800px] mx-auto px-4">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
