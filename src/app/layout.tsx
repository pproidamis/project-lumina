import type { Metadata, Viewport } from 'next';
import './globals.css';
import { BottomNav } from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Project Lumina — Loud Quiet Mind™',
  description: 'Real-time co-regulation system for parents of children with ADHD.',
};

export const viewport: Viewport = {
  themeColor: '#0F172A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0F172A] text-slate-100 antialiased selection:bg-amber-500/30">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
