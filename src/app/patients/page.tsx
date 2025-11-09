'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import {
  UserPlus,
  Users,
  Trash2,
  Eye,
  HeartPulse,
} from 'lucide-react';

import { useUser, useFirestore } from '@/firebase';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';

interface Patient {
  id: string;
  email: string;
  username: string;
}

export default function PatientsPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [patientEmail, setPatientEmail] = React.useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchPatients();
    }
  }, [user, isUserLoading, router]);

  const fetchPatients = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDocs(query(collection(firestore, 'users'), where('__name__', '==', user.uid)));
      const userData = userDoc.docs[0]?.data();
      
      if (userData && userData.patientEmails?.length > 0) {
        const patientsQuery = query(collection(firestore, 'users'), where('email', 'in', userData.patientEmails));
        const patientsSnapshot = await getDocs(patientsQuery);
        const patientsList = patientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Patient[];
        setPatients(patientsList);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error("Error fetching patients: ", error);
      toast({
        title: 'Error',
        description: 'Could not fetch your patients list.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPatient = async () => {
    if (!user || !patientEmail) return;
    
    try {
      // Find patient by email
      const patientQuery = query(collection(firestore, 'users'), where('email', '==', patientEmail));
      const patientSnapshot = await getDocs(patientQuery);
      
      if (patientSnapshot.empty) {
        toast({ title: 'Patient not found', description: 'No user exists with that email address.', variant: 'destructive' });
        return;
      }
      
      const patientDoc = patientSnapshot.docs[0];
      const patientId = patientDoc.id;

      // Add patient to caregiver's list and caregiver to patient's list
      const caregiverDocRef = doc(firestore, 'users', user.uid);
      const patientDocRef = doc(firestore, 'users', patientId);

      await updateDoc(caregiverDocRef, { patientEmails: arrayUnion(patientEmail) });
      await updateDoc(patientDocRef, { caregiverEmails: arrayUnion(user.email) });
      
      toast({ title: 'Patient Added', description: `${patientDoc.data().username} is now linked to your account.` });
      setPatientEmail('');
      setIsAddDialogOpen(false);
      fetchPatients(); // Refresh the list
    } catch (error) {
      console.error("Error adding patient: ", error);
      toast({ title: 'Error', description: 'Could not add patient.', variant: 'destructive' });
    }
  };

  const handleRemovePatient = async (patient: Patient) => {
    if (!user) return;
    try {
        const caregiverDocRef = doc(firestore, 'users', user.uid);
        const patientDocRef = doc(firestore, 'users', patient.id);

        await updateDoc(caregiverDocRef, { patientEmails: arrayRemove(patient.email) });
        await updateDoc(patientDocRef, { caregiverEmails: arrayRemove(user.email) });
        
        toast({ title: 'Patient Removed', description: `${patient.username} has been unlinked.` });
        fetchPatients(); // Refresh
    } catch (error) {
        console.error("Error removing patient: ", error);
        toast({ title: 'Error', description: 'Could not remove patient.', variant: 'destructive' });
    }
  };

  const handleViewPatientDashboard = (patientId: string) => {
    router.push(`/?patientId=${patientId}`);
  };

  if (isUserLoading || !user) {
    return <div className="flex items-center justify-center min-h-screen"><Skeleton className="h-12 w-12 rounded-full" /></div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">My Patients</h1>
              <p className="text-muted-foreground mt-1">Manage and view your patients' dashboards.</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Patient
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a New Patient</DialogTitle>
                  <DialogDescription>Enter the email address of the patient you wish to monitor.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="patient-email">Patient's Email</Label>
                  <Input 
                    id="patient-email"
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="patient@example.com"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddPatient}>Add Patient</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
            </div>
          )}

          {!isLoading && patients.length === 0 && (
            <Card className="text-center p-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No Patients Found</h3>
              <p className="mt-1 text-sm text-muted-foreground">Add a patient to start monitoring their medication.</p>
            </Card>
          )}

          {!isLoading && patients.length > 0 && (
            <div className="space-y-4">
              {patients.map(p => (
                <Card key={p.id}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <HeartPulse className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-lg">{p.username}</p>
                            <p className="text-sm text-muted-foreground">{p.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewPatientDashboard(p.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will unlink {p.username} from your account. You will no longer be able to view their dashboard.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemovePatient(p)}>Remove</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
