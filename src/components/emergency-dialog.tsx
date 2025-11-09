'use client';

import { PhoneCall, Loader2 } from 'lucide-react';
import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface EmergencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmergencyDialog({ open, onOpenChange }: EmergencyDialogProps) {
  const { toast } = useToast();
  const [isLocating, setIsLocating] = React.useState(false);

  const handleCall = () => {
    if (!('geolocation' in navigator)) {
      toast({
        title: 'Geolocation Not Supported',
        description: "Your browser doesn't support location services.",
        variant: 'destructive',
        duration: 5000,
      });
      onOpenChange(false);
      return;
    }
    
    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        toast({
          title: 'Emergency Services Contacted',
          description: `An ambulance has been dispatched to your location: Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}.`,
          duration: 10000,
        });
        setIsLocating(false);
        onOpenChange(false);
      },
      (error) => {
        let errorMessage = 'Could not get your location. Please check your browser settings.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable it in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out.';
            break;
        }
        toast({
          title: 'Location Error',
          description: errorMessage,
          variant: 'destructive',
          duration: 7000,
        });
        setIsLocating(false);
        onOpenChange(false);
      }
    );
  };

  React.useEffect(() => {
    if (!open) {
      setIsLocating(false);
    }
  }, [open]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure this is an emergency?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will attempt to get your current location and simulate contacting emergency services. Only proceed if this is a genuine medical emergency.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLocating}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleCall} className="bg-destructive hover:bg-destructive/90" disabled={isLocating}>
            {isLocating ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Location...
                </>
            ) : (
                <>
                    <PhoneCall className="mr-2 h-4 w-4" />
                    Yes, Call Ambulance
                </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
