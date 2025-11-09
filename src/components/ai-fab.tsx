'use client';

import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AiFabProps {
  onOpen: () => void;
}

export function AiFab({ onOpen }: AiFabProps) {
  return (
    <Button
      onClick={onOpen}
      size="icon"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
    >
      <Bot className="h-7 w-7" />
      <span className="sr-only">Open AI Assistant</span>
    </Button>
  );
}
