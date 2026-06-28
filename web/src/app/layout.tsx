import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KB教练 — AI 健身康复师',
  description: 'AI 驱动的体态分析、训练方案、饮食指导。下载 APP 即可体验。',
  openGraph: {
    type: 'website',
    siteName: 'KB教练',
    title: 'KB教练 — AI 健身康复师',
    description: 'AI 驱动的体态分析、训练方案、饮食指导。下载 APP 即可体验。',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f766e',
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
      <body className="min-h-screen" style={{backgroundColor:'#f6f8f7'}}>
        {children}
      </body>
    </html>
  );
}
