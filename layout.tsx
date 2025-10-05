import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { Toaster } from "@/components/ui/toaster";
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  metadataBase: new URL('https://www.agrokalkulator.online'),
  title: 'AgroKalkulator - Kalkulator Kosztów Transportu Maszyn Rolniczych',
  description: 'Prosty i szybki kalkulator do szacowania kosztów transportu i usług dodatkowych dla maszyn rolniczych. Oblicz koszty dla ciągników, kombajnów i innych.',
  keywords: ['kalkulator rolniczy', 'transport maszyn', 'koszty dostawy', 'maszyny rolnicze', 'ciągnik', 'kombajn', 'wycena transportu', 'AgroKalkulator'],
  openGraph: {
    title: 'AgroKalkulator - Kalkulator Kosztów Transportu Maszyn Rolniczych',
    description: 'Oszacuj koszty transportu maszyn rolniczych za pomocą nowoczesnego kalkulatora online.',
    url: 'https://www.agrokalkulator.online',
    siteName: 'AgroKalkulator',
    images: [
      {
        url: '/og-image.png', // Zakładam, że stworzysz taki plik
        width: 1200,
        height: 630,
        alt: 'AgroKalkulator - logo na tle maszyny rolniczej',
      },
    ],
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={cn('min-h-screen font-sans antialiased', 'bg-slate-50')}>
        <SpeedInsights/>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
