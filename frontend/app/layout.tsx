import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/src/presentation/providers/ClientLayout";

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
    <html lang="ru">
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
