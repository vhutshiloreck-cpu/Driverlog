import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "DriverLog — Drive. Track. Know.",
  description: "Premium automotive driving, mileage, expense and vehicle management.",
  manifest: "/manifest.webmanifest",
};
export const viewport: Viewport = { themeColor: "#05070d", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
