'use client';

import * as React from 'react';
import Link from 'next/link';
import { HeartPulse, Siren, LogOut, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmergencyDialog } from '@/components/emergency-dialog';
import { useAuth } from '@/firebase';

export function AppHeader() {
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = React.useState(false);
  const auth = useAuth();

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="mr-4 flex items-center">
             <Link href="/" className="flex items-center gap-2">
                <HeartPulse className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold">Medicare Assist</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
             <Button variant="ghost" asChild>
                <Link href="/history">
                    <History className="mr-2 h-5 w-5" />
                    History
                </Link>
            </Button>
            <Button
              variant="destructive"
              className="font-bold shadow-md hover:shadow-lg transition-shadow"
              onClick={() => setIsEmergencyDialogOpen(true)}
            >
              <Siren className="mr-2 h-5 w-5" />
              Emergency
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <EmergencyDialog open={isEmergencyDialogOpen} onOpenChange={setIsEmergencyDialogOpen} />
    </>
  );
}
