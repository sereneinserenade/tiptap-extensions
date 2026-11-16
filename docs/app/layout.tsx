import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Provider } from '@/components/provider';
import { appName } from '@/lib/shared';
import './global.css';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: { template: `%s · ${appName}`, default: appName },
  description: 'Nine Tiptap 3 extensions in one tree-shakable package.',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
