'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeartPulse, Siren, LogOut, History, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmergencyDialog } from '@/components/emergency-dialog';
import { useAuth, useUser } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export function AppHeader() {
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = React.useState(false);
  const auth = useAuth();
  const { user } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();
  const [isCaregiver, setIsCaregiver] = React.useState(false);

  React.useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().role === 'caregiver') {
          setIsCaregiver(true);
        } else {
          setIsCaregiver(false);
        }
      }
    };
    checkUserRole();
  }, [user, firestore]);

  const handleLogout = () => {
    auth.signOut();
  };

  const isPatientDashboard = pathname === '/' && isCaregiver;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="mr-4 flex items-center">
             <Link href="/" className="flex items-center gap-2">
                <HeartPulse className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold">MediCare Assist</span>
            </Link>
          </div>
          <nav className="flex items-center space-x-2 ml-6">
            {!isPatientDashboard && (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/history">
                      <History className="mr-2 h-5 w-5" />
                      History
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                    <Link href="/reports">
                        <FileText className="mr-2 h-5 w-5" />
                        Reports
                    </Link>
                </Button>
              </>
            )}
            {isCaregiver && (
              <Button variant="ghost" asChild>
                  <Link href="/patients">
                      <Users className="mr-2 h-5 w-5" />
                      Patients
                  </Link>
              </Button>
            )}
          </nav>
          <div className="flex flex-1 items-center justify-end space-x-2">
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
