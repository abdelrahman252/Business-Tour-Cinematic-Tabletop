import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cinematic Tabletop Scene',
  description: 'Premium tabletop game architecture',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
