'use client';

import * as React from 'react';
import { HeartPulse, Siren } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmergencyDialog } from '@/components/emergency-dialog';

export function AppHeader() {
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="mr-4 flex items-center">
            <HeartPulse className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold">MediScan Assist</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <Button
              variant="destructive"
              className="font-bold shadow-md hover:shadow-lg transition-shadow"
              onClick={() => setIsEmergencyDialogOpen(true)}
            >
              <Siren className="mr-2 h-5 w-5" />
              Emergency
            </Button>
          </div>
        </div>
      </header>
      <EmergencyDialog open={isEmergencyDialogOpen} onOpenChange={setIsEmergencyDialogOpen} />
    </>
  );
}
