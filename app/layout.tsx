import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProviderWrapper } from "@/components/auth-provider-wrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StepUp Admin OS",
  description: "NGO Management Platform for English Teaching",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProviderWrapper>{children}</AuthProviderWrapper>
      </body>
    </html>
  );
}
