import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/providers';

export const metadata: Metadata = {
  title: 'Paythos — Spend Controls for AI Agents',
  description: 'An early-stage Arc Testnet prototype for policy-controlled agent payments.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#09090b] text-zinc-100 antialiased selection:bg-zinc-800">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
