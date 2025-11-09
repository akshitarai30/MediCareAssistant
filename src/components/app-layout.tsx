'use client';

import * as React from 'react';
import { useUser } from '@/firebase';
import { AiFab } from '@/components/ai-fab';
import { AiAssistantSheet } from '@/components/ai-assistant-sheet';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useUser();
  const [isAssistantOpen, setIsAssistantOpen] = React.useState(false);

  return (
    <>
      {children}
      {user && (
        <>
          <AiFab onOpen={() => setIsAssistantOpen(true)} />
          <AiAssistantSheet open={isAssistantOpen} onOpenChange={setIsAssistantOpen} />
        </>
      )}
    </>
  );
}
