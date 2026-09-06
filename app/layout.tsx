import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SkillConnect | Build skills. Find your place.',
  description:
    'Connect students, industry, faculty and institutions through skills, learning and meaningful opportunities.',
  metadataBase: new URL(
    'https://skillconnect-maaz-sih-2026.abdullahumar6565.chatgpt.site',
  ),
  openGraph: {
    title: 'SkillConnect',
    description: 'Build skills. Find your place.',
    images: [
      {
        url: 'https://skillconnect-maaz-sih-2026.abdullahumar6565.chatgpt.site/og.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillConnect',
    description: 'Build skills. Find your place.',
    images: [
      'https://skillconnect-maaz-sih-2026.abdullahumar6565.chatgpt.site/og.png',
    ],
  },
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
