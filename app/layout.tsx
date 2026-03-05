import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/session-provider";
import { ToastProvider } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clear Balance",
  description:
    "Domine suas finanças com o ClearBalance. Simplicidade na gestão de gastos e inteligência na análise de ativos. Junte-se à nossa comunidade e simplifique sua jornada financeira.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
    (function() {
      const storedTheme = localStorage.getItem('clearbalance-theme');
      if (storedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.style.backgroundColor = '#0f172a';
      } else if (storedTheme === 'light') {
        document.documentElement.classList.remove('dark');
        document.body.style.backgroundColor = '#f8f9fa';
      } else {
        // Default to light if no preference
        document.body.style.backgroundColor = '#f8f9fa';
      }
    })();
  `;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
