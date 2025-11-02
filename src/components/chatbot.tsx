'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, X, Send, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { recommendDiet } from '@/ai/flows/diet-recommender-flow';
import { cn } from '@/lib/utils';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          sender: 'bot',
          text: "Hello! I'm your AI health assistant. How can I help you with your diet today? For example, you can ask 'What's a good diet for high blood pressure?'.",
        },
      ]);
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        // A slight delay to allow the new message to render
        setTimeout(() => {
             const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
             if(viewport) {
                viewport.scrollTop = viewport.scrollHeight;
             }
        }, 100);
    }
  }, [messages]);


  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const result = await recommendDiet({ healthQuery: input });
        const botMessage: Message = { sender: 'bot', text: result.recommendation };
        setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
        console.error('Error getting diet recommendation:', error);
        const errorMessage: Message = {
            sender: 'bot',
            text: 'Sorry, I encountered an error. Please try again later.',
        };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 sm:right-8 z-50"
          >
            <Card className="w-[calc(100vw-32px)] sm:w-96 h-[60vh] flex flex-col shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="h-6 w-6 text-primary" />
                  Diet Advisor
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full" ref={scrollAreaRef}>
                  <div className="space-y-4 pr-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={cn(
                          'flex items-start gap-3',
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                         {message.sender === 'bot' && (
                            <div className="p-2 bg-muted rounded-full">
                                <Bot className="h-5 w-5 text-primary" />
                            </div>
                         )}
                        <div
                          className={cn(
                            'max-w-xs rounded-xl px-4 py-3 text-sm whitespace-pre-wrap',
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {message.text}
                        </div>
                         {message.sender === 'user' && (
                            <div className="p-2 bg-muted rounded-full">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                         )}
                      </div>
                    ))}
                    {isLoading && (
                       <div className="flex items-start gap-3 justify-start">
                           <div className="p-2 bg-muted rounded-full">
                                <Bot className="h-5 w-5 text-primary" />
                            </div>
                           <div className="bg-muted text-muted-foreground rounded-xl px-4 py-3 text-sm flex items-center">
                               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                               <span>Thinking...</span>
                           </div>
                       </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                 <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex w-full items-center space-x-2"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about a health condition..."
                        disabled={isLoading}
                        autoFocus
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="lg"
        className="fixed bottom-4 right-4 sm:right-8 z-50 rounded-full h-16 w-16 shadow-2xl"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Chatbot"
      >
        {isOpen ? <X className="h-7 w-7" /> : <Bot className="h-7 w-7" />}
      </Button>
    </>
  );
}
