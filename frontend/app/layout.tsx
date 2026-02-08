import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChatApp",
  description: "A simple real time chat application built with Next.js and go",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b0f1a] text-slate-100 flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
