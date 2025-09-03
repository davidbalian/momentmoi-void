import type { Metadata } from "next";
import { Lato } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

// Local font - Ivy Presto Display
const ivyPrestoDisplay = localFont({
  src: "../../public/fonts/ivy-presto-display-light.otf",
  variable: "--font-ivy-presto",
  display: "swap",
});

// Google Font - Lato
const lato = Lato({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MomentMoi - Event Planning Platform",
  description:
    "Sophisticated event planning platform for couples, vendors, and event planners",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ivyPrestoDisplay.variable} ${lato.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
