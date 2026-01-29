import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PesoWise | Master Your Money",
  description: "A simple, smart expense tracker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          socialButtonsPlacement: 'bottom',
          socialButtonsVariant: 'iconButton',
        },
        variables: {
          colorPrimary: '#0f172a', // Matches Slate-900
          colorText: '#0f172a',
          fontFamily: inter.style.fontFamily,
          borderRadius: '1rem',
        },
        elements: {
          card: "shadow-2xl rounded-[2rem] border border-gray-100", // The main modal card
          headerTitle: "font-black text-slate-900",
          headerSubtitle: "text-gray-500 font-medium",
          formButtonPrimary: "bg-slate-900 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 !rounded-xl normal-case text-sm font-bold",
          socialButtonsIconButton: "hover:bg-gray-50 border border-gray-200 !rounded-xl transition-all",
          formFieldInput: "rounded-xl border-gray-200 focus:border-slate-900 focus:ring-slate-900",
          footerActionLink: "text-emerald-600 hover:text-emerald-700 font-bold",
          // The dropdown that appears when you click your avatar
          userButtonPopoverCard: "shadow-2xl rounded-2xl border border-gray-100",
          userButtonPopoverActions: "p-2",
          userButtonPopoverActionButton: "hover:bg-gray-50 rounded-xl text-slate-700 font-medium",
        }
      }}
    >
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}