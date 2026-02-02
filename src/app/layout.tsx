import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "YGPT Dashboard",
  description: "Event management dashboard for YGPT operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${body.className} antialiased`}>
        <div className="min-h-screen bg-background text-foreground">
          <AppShell>{children}</AppShell>
        </div>
      </body>
    </html>
  );
}
