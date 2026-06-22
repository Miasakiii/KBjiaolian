import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import UpdatePrompt from '@/components/UpdatePrompt';

export const metadata: Metadata = {
  title: 'KB教练 — AI 健身康复师',
  description: 'AI 驱动的体态分析、训练方案、饮食指导。下载 APP 即可体验。',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KB教练',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'KB教练',
    title: 'KB教练 — AI 健身康复师',
    description: 'AI 驱动的体态分析、训练方案、饮食指导。下载 APP 即可体验。',
  },
};

export const viewport: Viewport = {
  themeColor: '#22c55e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="bg-white min-h-screen">
        {children}
        <Toaster position="top-center" richColors closeButton />
        <UpdatePrompt />
      </body>
    </html>
  );
}
