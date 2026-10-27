import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AltajProvider } from '@/context/AltajContext';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata: Metadata = {
  title: 'ALTAJ LEATHER | التاج للمصنوعات الجلدية الطبيعية — صناعة يدوية مغربية أصيلة',
  description:
    'متجر التاج للمصنوعات الجلدية الطبيعية 100% المصنوعة يدوياً بحرفية مغربية عالية. محافظ راقية، أغلفة جواز سفر، محافظ بطاقات. توصيل سريع لجميع مدن المغرب والدفع نقداً عند الاستلام بعد المعاينة.',
  keywords: [
    'ALTAJ LEATHER',
    'التاج ليذر',
    'جلد طبيعي المغرب',
    'محافظ جلد طبيعي',
    'صناعة يدوية مغربية',
    'محفظة جواز السفر المغربي',
    'الدفع عند الاستلام المغرب',
  ],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1A1615',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth" suppressHydrationWarning>
      <body className="min-h-screen bg-[#FBF9F5] text-[#1E1C1A] antialiased font-sans selection:bg-[#B89563]/20 selection:text-[#5A4031]" suppressHydrationWarning>
        <LanguageProvider>
          <AltajProvider>
            {children}
          </AltajProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

