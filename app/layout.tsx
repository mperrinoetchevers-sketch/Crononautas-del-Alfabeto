import type { Metadata, Viewport } from 'next';
import './globals.css';
import PWAProvider from '@/components/PWAProvider';

export const metadata: Metadata = {
  title: 'Crononautas del Alfabeto - Viaje en el Tiempo',
  description: 'Videojuego 2D educativo de alfabetización para niños. Aprende sílabas, palabras y oraciones viajando en el tiempo.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Crononautas',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-amber-400 selection:text-slate-950 font-sans flex flex-col justify-between overflow-x-hidden">
        <PWAProvider>
          {children}
        </PWAProvider>
      </body>
    </html>
  );
}
