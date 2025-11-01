'use client';

import { PhoneCall } from 'lucide-react';
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

  const handleCall = () => {
    toast({
      title: 'Contacting Emergency Services',
      description: 'An ambulance has been dispatched to your location.',
      duration: 5000,
    });
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure this is an emergency?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will immediately contact emergency services. Only proceed if you are in a genuine medical emergency.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleCall} className="bg-destructive hover:bg-destructive/90">
            <PhoneCall className="mr-2 h-4 w-4" />
            Yes, Call Ambulance
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
