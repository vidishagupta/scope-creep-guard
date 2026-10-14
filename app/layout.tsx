import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scope-Creep Guard | Local-First AI for Freelancers',
  description:
    'Protect your project scope and recover billable revenue. Local-first open-weight Gemma AI analyzes client messages against your contract with 100% privacy.',
  keywords: [
    'freelancer',
    'scope creep',
    'contract analysis',
    'open source ai',
    'gemma',
    'ollama',
    'side hustle',
    'hacktoberfest',
  ],
  authors: [{ name: 'Vidisha Gupta' }],
  openGraph: {
    title: 'Scope-Creep Guard | Local-First AI for Freelancers',
    description:
      'Defend contract scope and recover lost freelance revenue with private local Gemma AI.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
