'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getLocalAIResponse } from '@/lib/local-ai';
import { cn } from '@/lib/utils';

interface AiAssistantSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export function AiAssistantSheet({ open, onOpenChange }: AiAssistantSheetProps) {
  const [messages, setMessages] = React.useState<Message[]>([
    { sender: 'bot', text: 'Hello! I am your local health assistant. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = React.useState('');
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const userMessage: Message = { sender: 'user', text: inputValue };
    const botResponseText = getLocalAIResponse(inputValue);
    const botMessage: Message = { sender: 'bot', text: botResponseText };

    setMessages(prev => [...prev, userMessage, botMessage]);
    setInputValue('');
  };

  React.useEffect(() => {
    if (scrollAreaRef.current) {
        // A bit of a hack to scroll to the bottom.
        // Direct scrollIntoView was not consistently working.
        setTimeout(() => {
            if(scrollAreaRef.current) {
                scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
            }
        }, 100);
    }
  }, [messages]);
  

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bot /> AI Health Assistant
          </SheetTitle>
          <SheetDescription>
            Ask common health questions. This assistant works offline.
            <span className="font-bold block mt-1">Disclaimer: This is not medical advice.</span>
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 my-4 -mx-6 px-6" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.sender === 'bot' && (
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <AvatarFallback><Bot size={20} /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-xs rounded-lg p-3 text-sm',
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  {message.text}
                </div>
                 {message.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><User size={20} /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2 p-2 bg-background border-t -mx-6 px-6">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask a question..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="icon">
            <Send />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
