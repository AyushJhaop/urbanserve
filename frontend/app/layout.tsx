import type { Metadata } from "next";
import { Inter, Open_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AIAssistantWidget from "@/components/ai/AIAssistantWidget";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UrbanServe - On-Demand Local Service Marketplace Platform",
  description: "Connect directly with verified local professionals for cleaning, plumbing, electrical, and urgent emergency repairs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isRealClerkKey = Boolean(
    clerkKey && 
    !clerkKey.includes('demo') && 
    !clerkKey.includes('placeholder') &&
    (clerkKey.startsWith('pk_test_') || clerkKey.startsWith('pk_live_'))
  );

  const content = (
    <html lang="en" className={`${inter.variable} ${openSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-body bg-neutral-lighter text-neutral-dark">
        <Header />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
        <AIAssistantWidget />
      </body>
    </html>
  );

  if (isRealClerkKey) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
