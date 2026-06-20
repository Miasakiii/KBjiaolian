import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/lib/AuthContext';
import AuthGuard from '@/components/AuthProvider';
import { Toaster } from 'sonner';
import UpdatePrompt from '@/components/UpdatePrompt';

export const metadata: Metadata = {
  title: 'KB教练 — AI 健身康复师',
  description: 'AI 驱动的体态分析、训练方案、饮食指导',
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
    description: 'AI 驱动的体态分析、训练方案、饮食指导',
  },
};

export const viewport: Viewport = {
  // 与 tailwind primary-500 一致，统一绿白清新风格
  themeColor: '#22c55e',
  width: 'device-width',
  initialScale: 1,
  // 允许用户缩放，符合 WCAG 1.4.4 (Resize text)
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
      <body className="bg-primary-50 min-h-screen flex flex-col">
        <AuthProvider>
          <AuthGuard>
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </AuthGuard>
        </AuthProvider>
        <Toaster position="top-center" richColors closeButton />
        <UpdatePrompt />
      </body>
    </html>
  );
}
