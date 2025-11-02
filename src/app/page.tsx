'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Clock, PlusCircle } from 'lucide-react';
import { add, differenceInSeconds, parse } from 'date-fns';

import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/app-header';
import { AddPrescriptionDialog } from '@/components/add-prescription-dialog';
import { EmptyState } from '@/components/empty-state';
import { MedicationCard } from '@/components/medication-card';
import type { Medication, MedicationEntry, MedicationStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { AddMedicationCard } from '@/components/add-medication-card';
import { useUser } from '@/firebase';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [medications, setMedications] = React.useState<Medication[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const spokenAlerts = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleOpenAddDialog = () => setIsAddDialogOpen(true);

  const handleAddMedication = async (medicationData: MedicationEntry) => {
    setIsLoading(true);
    setIsAddDialogOpen(false);
    
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const now = new Date();
      const timings = medicationData.timings.split(',').map(t => t.trim()).filter(Boolean);

      let nextDoseTime: string | null = null;
      let nextDoseDate: Date | null = null;

      if (timings && timings.length > 0) {
        const sortedTimings = timings
          .map((t: string) => parse(t, 'HH:mm', now))
          .sort((a: Date, b: Date) => a.getTime() - b.getTime());

        let nextDose = sortedTimings.find((t: Date) => differenceInSeconds(t, now) > 0);

        if (!nextDose) {
          nextDose = add(sortedTimings[0], { days: 1 });
        }
        nextDoseTime = `${String(nextDose.getHours()).padStart(2, '0')}:${String(nextDose.getMinutes()).padStart(2, '0')}`;
        nextDoseDate = nextDose;
      }

      const newMedication: Medication = {
        id: `${new Date().getTime()}`,
        name: medicationData.name,
        dosage: medicationData.dosage,
        timings: timings,
        status: 'Upcoming',
        nextDoseTime,
        nextDoseDate,
      };

      setMedications(prevMeds => [...prevMeds, newMedication]);
      toast({
        title: 'Medication Added',
        description: `${newMedication.name} has been added to your dashboard.`,
      });

    } catch (error) {
      console.error('Failed to add medication:', error);
      toast({
        title: 'Failed to Add',
        description: 'Could not add the medication. Please check the timings format (HH:mm) and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleStatusChange = (id: string, status: MedicationStatus) => {
    setMedications(meds =>
      meds.map(med => {
        if (med.id === id) {
          let description = `You've marked ${med.name} as ${status.toLowerCase()}.`;
          if (status === 'Snoozed' && med.nextDoseDate) {
            const newDate = add(new Date(), { minutes: 10 });
            description = `${med.name} has been snoozed for 10 minutes.`;
            return { ...med, status, nextDoseDate: newDate };
          }
          toast({
            title: `Medication Updated`,
            description,
            icon: <Check className="h-5 w-5 text-green-500" />,
          });
          return { ...med, status };
        }
        return med;
      })
    );
  };
  
  const handleNotifyCaregiver = (medicationName: string) => {
    toast({
        title: 'Caregiver Notified',
        description: `A notification for the missed dose of ${medicationName} has been sent.`,
        icon: <Bell className="h-5 w-5 text-primary" />,
    });
  };

  const handleDoseDue = React.useCallback((med: Medication) => {
    const alertId = `${med.id}-${med.nextDoseTime}`;
    if (spokenAlerts.current.has(alertId)) return;

    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`Time to take your ${med.name}.`);
        window.speechSynthesis.speak(utterance);
    }
    
    toast({
        title: 'Medication Due',
        description: `It's time to take your ${med.name} (${med.dosage}).`,
        duration: 10000,
        icon: <Clock className="h-5 w-5 text-blue-500" />,
    });
    
    spokenAlerts.current.add(alertId);

    setTimeout(() => {
        setMedications(meds => meds.map(m => {
            if (m.id === med.id && m.status === 'Upcoming') {
                return {...m, status: 'Missed'};
            }
            return m;
        }));
    }, 1000 * 60 * 5);

  }, [toast]);

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Medication Dashboard</h1>
              <p className="text-muted-foreground mt-1">Your daily medication schedule and tracker.</p>
            </div>
          </div>

          {(isLoading || medications.length === 0) && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3 p-6 rounded-xl border bg-card">
                        <Skeleton className="h-6 w-3/5 rounded-md" />
                        <Skeleton className="h-4 w-4/5 rounded-md" />
                        <div className="pt-4 space-y-4">
                           <Skeleton className="h-10 w-full rounded-md" />
                           <Skeleton className="h-16 w-full rounded-md" />
                        </div>
                    </div>
                ))}
             </div>
          )}

          {!isLoading && medications.length === 0 && <EmptyState onAdd={handleOpenAddDialog} />}
          
          {!isLoading && medications.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medications.map(med => (
                <MedicationCard 
                    key={med.id} 
                    medication={med} 
                    onStatusChange={handleStatusChange} 
                    onDoseDue={() => handleDoseDue(med)}
                    onNotifyCaregiver={() => handleNotifyCaregiver(med.name)}
                />
              ))}
              <AddMedicationCard onAdd={handleOpenAddDialog} />
            </div>
          )}
        </div>
      </main>
      <AddPrescriptionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddMedication={handleAddMedication}
      />
    </div>
  );
}
