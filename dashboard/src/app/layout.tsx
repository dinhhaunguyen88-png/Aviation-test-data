import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aviation Dashboard - Open Source Aviation Data",
  description:
    "Interactive dashboard for exploring 85K+ airports, routes, runways, and aviation data worldwide. Built with open-source data from OurAirports and OpenFlights.",
  keywords: [
    "aviation",
    "airports",
    "dashboard",
    "ICAO",
    "IATA",
    "runways",
    "routes",
    "open data",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased">
        <Sidebar />
        <main
          className="min-h-screen"
          style={{ marginLeft: "var(--sidebar-width)" }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
