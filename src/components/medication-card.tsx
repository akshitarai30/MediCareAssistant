'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle2, XCircle, Bell, PauseCircle, AlertTriangle } from 'lucide-react';
import { useCountdown } from '@/hooks/use-countdown';
import { Medication, MedicationStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface MedicationCardProps {
  medication: Medication;
  onStatusChange: (id: string, status: MedicationStatus) => void;
  onDoseDue: () => void;
  onNotifyCaregiver: () => void;
}

export function MedicationCard({ medication, onStatusChange, onDoseDue, onNotifyCaregiver }: MedicationCardProps) {
  const { hours, minutes, seconds, isDue } = useCountdown(medication.nextDoseDate);

  React.useEffect(() => {
    if (isDue && medication.status === 'Upcoming') {
      onDoseDue();
    }
  }, [isDue, medication.status, onDoseDue]);

  const cardBorderColor = 
    medication.status === 'Taken' ? 'border-green-500/50' :
    medication.status === 'Missed' ? 'border-red-500/50' :
    medication.status === 'Snoozed' ? 'border-yellow-500/50' :
    'border-border';

  const CountdownDisplay = () => {
    if (medication.status === 'Taken') {
        return <div className="text-center text-green-600 font-semibold">Dose complete for today!</div>;
    }
    if (medication.status === 'Missed') {
        return <div className="text-center text-red-600 font-semibold">Dose missed!</div>;
    }
    if (!medication.nextDoseDate) {
        return <div className="text-center text-muted-foreground">No upcoming dose.</div>;
    }
    
    return (
        <div className={cn("text-center font-mono text-4xl font-bold tracking-tight", isDue ? 'text-destructive animate-pulse' : 'text-primary')}>
            {`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
        </div>
    );
  };

  return (
    <Card className={cn('flex flex-col transition-all duration-300', cardBorderColor, medication.status !== 'Upcoming' ? 'bg-muted/30' : '')}>
      <CardHeader>
        <CardTitle className="text-xl">{medication.name}</CardTitle>
        <CardDescription>{medication.dosage}</CardDescription>
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
        {medication.status !== 'Missed' && (
             <RadioGroup
                defaultValue={medication.status}
                onValueChange={(value) => onStatusChange(medication.id, value as MedicationStatus)}
                className="grid grid-cols-3 gap-2 w-full"
                disabled={medication.status === 'Taken'}
              >
                <Label htmlFor={`taken-${medication.id}`} className={cn("flex flex-col items-center justify-center rounded-md border-2 p-3 font-semibold cursor-pointer hover:bg-accent hover:text-accent-foreground", medication.status === 'Taken' && 'border-green-500 bg-green-500/10 text-green-700')}>
                    <RadioGroupItem value="Taken" id={`taken-${medication.id}`} className="sr-only" />
                    <CheckCircle2 className="mb-2 h-6 w-6"/> Taken
                </Label>
                <Label htmlFor={`snoozed-${medication.id}`} className={cn("flex flex-col items-center justify-center rounded-md border-2 p-3 font-semibold cursor-pointer hover:bg-accent hover:text-accent-foreground", medication.status === 'Snoozed' && 'border-yellow-500 bg-yellow-500/10 text-yellow-700')}>
                    <RadioGroupItem value="Snoozed" id={`snoozed-${medication.id}`} className="sr-only" />
                    <PauseCircle className="mb-2 h-6 w-6"/> Snooze
                </Label>
                <Label htmlFor={`missed-${medication.id}`} className={cn("flex flex-col items-center justify-center rounded-md border-2 p-3 font-semibold cursor-pointer hover:bg-accent hover:text-accent-foreground", medication.status === 'Missed' && 'border-red-500 bg-red-500/10 text-red-700')}>
                    <RadioGroupItem value="Missed" id={`missed-${medication.id}`} className="sr-only" />
                    <XCircle className="mb-2 h-6 w-6"/> Missed
                </Label>
             </RadioGroup>
        )}
        {medication.status === 'Missed' && (
            <Button variant="outline" className="w-full border-accent text-accent-foreground hover:bg-accent/80" onClick={onNotifyCaregiver}>
                <Bell className="mr-2 h-4 w-4" />
                Notify Caregiver
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
