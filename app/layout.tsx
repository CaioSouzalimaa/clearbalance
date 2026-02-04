import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/src/components/auth/session-provider";

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
    const storedTheme = localStorage.getItem('clearbalance-theme');
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (storedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    }
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
