import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meetify - Video Conferencing",
  description: "Modern video conferencing platform built with Next.js and Spring Boot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
