import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./Scrollbar.css";
import { ClerkProvider } from '@clerk/nextjs';
import { ClientProviders } from '@/components/ClientProviders';

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "PesoWise | Master Your Money",
  description: "A smart, beautiful expense tracker that helps you take control of your finances. Track expenses, manage subscriptions, and visualize your spending habits.",
  keywords: ["expense tracker", "budget", "finance", "money management", "personal finance"],
  authors: [{ name: "PesoWise" }],
  creator: "PesoWise",
  openGraph: {
    title: "PesoWise | Master Your Money",
    description: "Take control of your finances with PesoWise",
    type: "website",
  },
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
          colorPrimary: '#0f172a',
          colorText: '#0f172a',
          colorSuccess: '#10b981',
          colorDanger: '#ef4444',
          fontFamily: inter.style.fontFamily,
          fontSize: '0.875rem',
          fontWeight: {
            normal: '500',
            medium: '600',
            bold: '700',
          },
          borderRadius: '1rem',
        },
        elements: {
          card: "shadow-2xl rounded-[2rem] border border-gray-100 overflow-hidden",
          headerTitle: "font-black text-slate-900 text-2xl",
          headerSubtitle: "text-gray-500 font-medium text-sm",
          formButtonPrimary: `
            bg-gradient-to-r from-slate-900 to-slate-800
            hover:from-slate-800 hover:to-slate-700
            transition-all duration-200
            shadow-lg shadow-slate-900/20
            hover:shadow-xl
            !rounded-xl
            normal-case
            text-sm font-bold
            py-3
          `,
          formFieldInput: `
            rounded-xl
            border-2 border-gray-200
            focus:border-slate-900
            focus:ring-2 focus:ring-slate-900
            bg-gray-50
            focus:bg-white
            transition-all
            px-4 py-3
            font-medium
          `,
          formFieldLabel: "text-xs font-bold text-gray-500 uppercase tracking-wider mb-2",
          socialButtonsIconButton: `
            hover:bg-gray-50
            border border-gray-200
            !rounded-xl
            transition-all duration-200
            hover:border-gray-300
            hover:shadow-sm
          `,
          footerActionLink: "text-emerald-600 hover:text-emerald-700 font-bold transition-colors",
          userButtonPopoverCard: "shadow-2xl rounded-2xl border border-gray-100 overflow-hidden",
          userButtonPopoverActions: "p-2",
          userButtonPopoverActionButton: `
            hover:bg-gray-50
            rounded-xl
            text-slate-700 font-medium
            transition-colors duration-200
            py-2.5
          `,
          userButtonPopoverActionButtonIcon: "text-gray-500",
          avatarBox: "rounded-xl",
          badge: "bg-emerald-100 text-emerald-700 font-bold rounded-lg px-2 py-1",
          dividerLine: "bg-gray-200",
          dividerText: "text-gray-400 text-xs font-medium",
        }
      }}
    >
      <html lang="en" className={inter.variable} suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    const theme = localStorage.getItem('theme');
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    
                    if (theme === 'dark' || (!theme && prefersDark)) {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  } catch (e) {}
                })();
              `,
            }}
          />
        </head>
        <body className={`${inter.className} antialiased bg-[#F2F2F7] dark:bg-slate-950 transition-colors duration-300 min-h-screen`}>
          <ClientProviders>
            {children}
          </ClientProviders>
        </body>
      </html>
    </ClerkProvider>
  );
}