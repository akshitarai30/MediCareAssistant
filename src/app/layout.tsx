'use client';

import * as React from 'react';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { AiAssistantSheet } from '@/components/ai-assistant-sheet';
import { AiFab } from '@/components/ai-fab';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isAssistantOpen, setIsAssistantOpen] = React.useState(false);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased min-h-screen bg-background')}>
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
        <AiFab onOpen={() => setIsAssistantOpen(true)} />
        <AiAssistantSheet open={isAssistantOpen} onOpenChange={setIsAssistantOpen} />
      </body>
    </html>
  );
}
