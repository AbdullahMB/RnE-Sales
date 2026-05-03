import type { Metadata } from 'next';
import { ThemeProvider, ThemeScript } from '@humain-foundation/ui';
import './globals.css';

export const metadata: Metadata = {
  title: 'RnE Sales Toolkit',
  description: 'Execution & Intelligence Layer for Enterprise Sales',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript defaultTheme="light" />
      </head>
      <body>
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      </body>
    </html>
  );
}
