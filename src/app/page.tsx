'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bell, Check, Clock, Trash2, User as UserIcon, ArrowLeft, Users } from 'lucide-react';
import { add, differenceInSeconds, parse, toDate } from 'date-fns';
import { collection, doc, serverTimestamp, Timestamp, getDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/app-header';
import { AddPrescriptionDialog } from '@/components/add-prescription-dialog';
import { EmptyState } from '@/components/empty-state';
import { MedicationCard } from '@/components/medication-card';
import type { Medication, MedicationEntry, MedicationStatus, MedicationLog, UserAccount } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { AddMedicationCard } from '@/components/add-medication-card';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  
  const patientId = searchParams.get('patientId');
  const targetUserId = patientId || user?.uid;
  
  const [isCaregiverView, setIsCaregiverView] = React.useState(false);
  const [patientInfo, setPatientInfo] = React.useState<{username: string} | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = React.useState<UserAccount | null>(null);

  const { toast } = useToast();
  const spokenAlerts = React.useRef<Set<string>>(new Set());
  const notificationShownRef = React.useRef(false);

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  React.useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserAccount;
          setCurrentUserProfile(profile);

          if (profile.role === 'caregiver' && !patientId && !notificationShownRef.current) {
            notificationShownRef.current = true; // Prevents showing multiple times
            toast({
              title: 'Welcome Caregiver!',
              description: (
                <div className="flex flex-col gap-2">
                  <span>You are in caregiver mode.</span>
                  <Button asChild size="sm">
                    <Link href="/patients">
                      <Users className="mr-2" /> Go to Patients
                    </Link>
                  </Button>
                </div>
              ),
              duration: 10000,
            });
          }
        }
      }
    };
    fetchUserProfile();
  }, [user, firestore, toast, patientId]);

  React.useEffect(() => {
    if (patientId && currentUserProfile) {
        if (currentUserProfile.role === 'caregiver') {
            setIsCaregiverView(true);
            const fetchPatientInfo = async () => {
              const patientDocRef = doc(firestore, 'users', patientId);
              const patientDoc = await getDoc(patientDocRef);
              if (patientDoc.exists()) {
                  setPatientInfo({ username: patientDoc.data().username });
              }
            };
            fetchPatientInfo();
        } else {
            // Not a caregiver, redirect
            router.push('/');
        }
    } else {
        setIsCaregiverView(false);
    }
  }, [patientId, currentUserProfile, firestore, router]);


  const medicationsQuery = useMemoFirebase(() => 
    targetUserId ? collection(firestore, 'users', targetUserId, 'medications') : null
  , [firestore, targetUserId]);

  const { data: medications, isLoading: isMedicationsLoading } = useCollection<Medication>(medicationsQuery);

  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  const handleOpenAddDialog = () => setIsAddDialogOpen(true);

  const handleAddMedication = async (medicationData: MedicationEntry) => {
    if (!targetUserId) return;

    setIsAddDialogOpen(false);
    
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
      
      const prescriptionEndDate = add(now, { days: medicationData.durationDays });

      const newMedication = {
        name: medicationData.name,
        dosage: medicationData.dosage,
        timings: timings,
        status: 'Upcoming' as MedicationStatus,
        nextDoseTime,
        nextDoseDate: nextDoseDate ? Timestamp.fromDate(nextDoseDate) : null,
        prescriptionEndDate: Timestamp.fromDate(prescriptionEndDate),
        userId: targetUserId,
      };

      const medicationsCollection = collection(firestore, 'users', targetUserId, 'medications');
      addDocumentNonBlocking(medicationsCollection, newMedication);

      toast({
        title: 'Medication Added',
        description: `${newMedication.name} has been added.`,
      });

    } catch (error) {
      console.error('Failed to add medication:', error);
      toast({
        title: 'Failed to Add',
        description: 'Could not add the medication. Please check the timings format (HH:mm) and try again.',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = (id: string, status: MedicationStatus) => {
    if(!targetUserId) return;
    
    const med = medications?.find(m => m.id === id);
    if (!med) return;

    const medicationDocRef = doc(firestore, 'users', targetUserId, 'medications', id);
    const logsCollectionRef = collection(firestore, 'users', targetUserId, 'medicationlogs');
    
    let description = `You've marked ${med.name} as ${status.toLowerCase()}.`;
    if (isCaregiverView) {
        description = `${patientInfo?.username} medication ${med.name} marked as ${status.toLowerCase()}.`;
    }
    let updatedMedication: Partial<Medication> = { status };

    if (status === 'Snoozed') {
        const newDate = add(new Date(), { minutes: 10 });
        updatedMedication.nextDoseDate = Timestamp.fromDate(newDate);
        description = `${med.name} has been snoozed for 10 minutes.`;
         if (isCaregiverView) {
            description = `${patientInfo?.username} medication ${med.name} has been snoozed.`;
        }
    }

    if (status === 'Taken') {
        const now = new Date();
        const timings = med.timings.map(t => t.trim()).filter(Boolean);
        
        const sortedTimings = timings
          .map((t: string) => parse(t, 'HH:mm', now))
          .sort((a: Date, b: Date) => a.getTime() - b.getTime());

        let nextDose = sortedTimings.find((t: Date) => differenceInSeconds(t, now) > 0);
        if (!nextDose) {
          nextDose = add(sortedTimings[0], { days: 1 });
        }
        
        const prescriptionEndDate = med.prescriptionEndDate && typeof med.prescriptionEndDate !== 'string' && 'seconds' in med.prescriptionEndDate 
            ? toDate((med.prescriptionEndDate as any).seconds * 1000) 
            : med.prescriptionEndDate;

        if (prescriptionEndDate && nextDose.getTime() > (prescriptionEndDate as Date).getTime()) {
            updatedMedication.nextDoseDate = null;
            updatedMedication.nextDoseTime = null;
            updatedMedication.status = 'Taken'; // Or maybe a new 'Completed' status
            description = `You have completed your prescription for ${med.name}.`;
            if(isCaregiverView) description = `${patientInfo?.username} has completed the prescription for ${med.name}.`
        } else {
            updatedMedication.nextDoseDate = Timestamp.fromDate(nextDose);
            updatedMedication.nextDoseTime = `${String(nextDose.getHours()).padStart(2, '0')}:${String(nextDose.getMinutes()).padStart(2, '0')}`;
            updatedMedication.status = 'Upcoming'; // Reset to upcoming for the next dose
        }
    }
    
    if (status === 'Missed') {
        // When a dose is missed, a caregiver on their device (not in caregiver view) should be notified
        if (!isCaregiverView) { 
            handleNotifyCaregiver(med.name);
        }
    }

    updateDocumentNonBlocking(medicationDocRef, updatedMedication);
    
    const logEntry: Omit<MedicationLog, 'id'> = {
        userId: targetUserId,
        medicationId: id,
        medicationName: med.name,
        status: status,
        timestamp: serverTimestamp() as unknown as string,
    };
    addDocumentNonBlocking(logsCollectionRef, logEntry);

    toast({
        title: `Medication Updated`,
        description,
        icon: <Check className="h-5 w-5 text-green-500" />,
    });
  };

  const handleDeleteMedication = (id: string) => {
    if (!targetUserId) return;
    const med = medications?.find(m => m.id === id);
    if (!med) return;

    const medicationDocRef = doc(firestore, 'users', targetUserId, 'medications', id);
    deleteDocumentNonBlocking(medicationDocRef);

    toast({
      title: 'Medication Deleted',
      description: `${med.name} has been removed.`,
      icon: <Trash2 className="h-5 w-5 text-destructive" />,
    });
  };
  
  const handleNotifyCaregiver = (medicationName: string) => {
    const patientName = user?.displayName || 'The patient';
    const notificationMessage = `${patientName} has missed their dose of ${medicationName}.`;
    
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(notificationMessage);
        window.speechSynthesis.speak(utterance);
    }
    
    toast({
        title: 'Caregiver Notified',
        description: `A notification for the missed dose of ${medicationName} has been sent.`,
        icon: <Bell className="h-5 w-5 text-primary" />,
    });
  };

  const handleDoseDue = React.useCallback((med: Medication) => {
    const alertId = `${med.id}-${med.nextDoseTime}`;
    if (spokenAlerts.current.has(alertId)) return;
    if(isCaregiverView) return; // Don't show alerts for patients

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

    // Set a timer to mark the dose as missed if no action is taken
    setTimeout(async () => {
        if (!targetUserId) return;
        
        // Fetch the latest state of the medication before updating
        const medDocRef = doc(firestore, 'users', targetUserId, 'medications', med.id);
        const currentMedDoc = await getDoc(medDocRef);

        if (currentMedDoc.exists()) {
            const currentMedData = currentMedDoc.data() as Medication;
            // Only mark as missed if the status is still 'Upcoming'
            if (currentMedData.status === 'Upcoming') {
                updateDocumentNonBlocking(medDocRef, { status: 'Missed' });
                // Log the missed dose
                 const logsCollectionRef = collection(firestore, 'users', targetUserId, 'medicationlogs');
                 const logEntry: Omit<MedicationLog, 'id'> = {
                    userId: targetUserId,
                    medicationId: med.id,
                    medicationName: med.name,
                    status: 'Missed',
                    timestamp: serverTimestamp() as unknown as string,
                };
                addDocumentNonBlocking(logsCollectionRef, logEntry);
                // After marking as missed, notify the caregiver
                handleNotifyCaregiver(med.name);
            }
        }
    }, 1000 * 60 * 5); // 5 minutes after due time

  }, [toast, targetUserId, firestore, isCaregiverView, user?.displayName]);


  if (isUserLoading || !targetUserId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  const processedMedications = (medications || []).map(med => ({
    ...med,
    nextDoseDate: med.nextDoseDate && typeof med.nextDoseDate !== 'string' && 'seconds' in med.nextDoseDate 
      ? toDate((med.nextDoseDate as any).seconds * 1000) 
      : med.nextDoseDate,
    prescriptionEndDate: med.prescriptionEndDate && typeof med.prescriptionEndDate !== 'string' && 'seconds' in med.prescriptionEndDate
      ? toDate((med.prescriptionEndDate as any).seconds * 1000)
      : med.prescriptionEndDate
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
             {isCaregiverView && patientInfo ? (
                <>
                  <Link href="/patients" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Patients
                  </Link>
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-8 w-8 text-primary" />
                    <div>
                      <h1 className="text-3xl font-bold text-foreground tracking-tight">{patientInfo.username}'s Dashboard</h1>
                      <p className="text-muted-foreground mt-1">Viewing and managing medication for your patient.</p>
                    </div>
                  </div>
                </>
              ) : (
                 <>
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">Medication Dashboard</h1>
                  <p className="text-muted-foreground mt-1">Your daily medication schedule and tracker.</p>
                </>
              )}
            </div>
          </div>

          {(isMedicationsLoading || processedMedications.length === 0) && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isMedicationsLoading && [...Array(3)].map((_, i) => (
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

          {!isMedicationsLoading && processedMedications.length === 0 && <EmptyState onAdd={handleOpenAddDialog} />}
          
          {!isMedicationsLoading && processedMedications.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedMedications.map(med => (
                <MedicationCard 
                    key={med.id} 
                    medication={med as Medication}
                    onStatusChange={handleStatusChange} 
                    onDoseDue={() => handleDoseDue(med as Medication)}
                    onNotifyCaregiver={() => handleNotifyCaregiver(med.name)}
                    onDelete={handleDeleteMedication}
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
