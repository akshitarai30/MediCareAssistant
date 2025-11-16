'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle2, XCircle, Bell, PauseCircle, Trash2, CalendarOff } from 'lucide-react';
import { useCountdown } from '@/hooks/use-countdown';
import { Medication, MedicationStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { format } from 'date-fns';


interface MedicationCardProps {
  medication: Medication;
  onStatusChange: (id: string, status: MedicationStatus) => void;
  onDoseDue: () => void;
  onNotifyCaregiver: () => void;
  onDelete: (id: string) => void;
  isCaregiverView?: boolean;
}

export function MedicationCard({ medication, onStatusChange, onDoseDue, onNotifyCaregiver, onDelete, isCaregiverView = false }: MedicationCardProps) {
  const { hours, minutes, seconds, isDue } = useCountdown(medication.nextDoseDate);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (isDue && medication.status === 'Upcoming') {
      onDoseDue();
    }
  }, [isDue, medication.status, onDoseDue]);

  const cardBorderColor = 
    medication.status === 'Taken' ? 'border-status-taken-fg' :
    medication.status === 'Missed' ? 'border-status-missed-fg' :
    medication.status === 'Snoozed' ? 'border-status-snoozed-fg' :
    'border-border';

  const CountdownDisplay = () => {
    if (!medication.nextDoseDate) {
        return (
          <div className="text-center text-status-taken-fg font-semibold flex flex-col items-center gap-2">
            <CheckCircle2 className="h-8 w-8" />
            <span>Prescription complete!</span>
          </div>
        );
    }
     if (medication.status === 'Taken') {
        return <div className="text-center text-status-taken-fg font-semibold">Dose complete! Next dose soon.</div>;
    }
    if (medication.status === 'Missed') {
        return <div className="text-center text-status-missed-fg font-semibold">Dose missed!</div>;
    }
    
    return (
        <div className={cn("text-center font-mono text-4xl font-bold tracking-tight", isDue ? 'text-destructive animate-pulse' : 'text-primary')}>
            {`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
        </div>
    );
  };

  return (
    <Card className={cn('flex flex-col transition-all duration-300 border-2', cardBorderColor, medication.status !== 'Upcoming' && !isDue ? 'bg-muted/30' : '')}>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-xl">{medication.name}</CardTitle>
                <CardDescription>{medication.dosage}</CardDescription>
                 {medication.prescriptionEndDate && (
                    <CardDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <CalendarOff className="h-3 w-3" />
                        Ends on: {format(new Date(medication.prescriptionEndDate as string), 'MMM d, yyyy')}
                    </CardDescription>
                )}
            </div>
            {!isCaregiverView && (
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the medication
                      and all of its history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(medication.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center">
        <div className="text-sm text-muted-foreground mb-2 flex items-center justify-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Next dose at {medication.nextDoseTime || 'N/A'}</span>
        </div>
        <div className="bg-primary/10 p-4 rounded-lg">
            <CountdownDisplay />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        {!isCaregiverView && medication.status !== 'Missed' && !!medication.nextDoseDate && (
             <RadioGroup
                value={medication.status}
                onValueChange={(value) => onStatusChange(medication.id, value as MedicationStatus)}
                className="grid grid-cols-3 gap-2 w-full"
                disabled={medication.status === 'Taken' && !isDue}
              >
                <Label htmlFor={`taken-${medication.id}`} className={cn("flex flex-col items-center justify-center rounded-md border-2 p-3 font-semibold cursor-pointer hover:bg-status-taken-bg/80", medication.status === 'Taken' ? 'border-status-taken-fg bg-status-taken-bg text-status-taken-fg' : 'border-input bg-green-500/10 text-green-700', medication.status === 'Taken' && !isDue && 'cursor-not-allowed opacity-50')}>
                    <RadioGroupItem value="Taken" id={`taken-${medication.id}`} className="sr-only" />
                    <CheckCircle2 className="mb-2 h-6 w-6"/> Taken
                </Label>
                <Label htmlFor={`snoozed-${medication.id}`} className={cn("flex flex-col items-center justify-center rounded-md border-2 p-3 font-semibold cursor-pointer hover:bg-status-snoozed-bg/80", medication.status === 'Snoozed' ? 'border-status-snoozed-fg bg-status-snoozed-bg text-status-snoozed-fg' : 'border-input bg-yellow-500/10 text-yellow-700', medication.status === 'Taken' && !isDue && 'cursor-not-allowed opacity-50')}>
                    <RadioGroupItem value="Snoozed" id={`snoozed-${medication.id}`} className="sr-only" disabled={medication.status === 'Taken' && !isDue} />
                    <PauseCircle className="mb-2 h-6 w-6"/> Snooze
                </Label>
                <Label htmlFor={`missed-${medication.id}`} className={cn("flex flex-col items-center justify-center rounded-md border-2 p-3 font-semibold cursor-pointer hover:bg-status-missed-bg/80", medication.status === 'Missed' ? 'border-status-missed-fg bg-status-missed-bg text-status-missed-fg' : 'border-input bg-red-500/10 text-red-700', medication.status === 'Taken' && !isDue && 'cursor-not-allowed opacity-50')}>
                    <RadioGroupItem value="Missed" id={`missed-${medication.id}`} className="sr-only" disabled={medication.status === 'Taken' && !isDue} />
                    <XCircle className="mb-2 h-6 w-6"/> Missed
                </Label>
             </RadioGroup>
        )}
        {!isCaregiverView && medication.status === 'Missed' && (
            <Button variant="outline" className="w-full border-accent text-accent-foreground hover:bg-accent/80" onClick={onNotifyCaregiver}>
                <Bell className="mr-2 h-4 w-4" />
                Notify Caregiver
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}

    