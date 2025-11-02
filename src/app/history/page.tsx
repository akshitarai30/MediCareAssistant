'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { collection, writeBatch, getDocs, query, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { Calendar, CheckCircle2, PauseCircle, XCircle, Pill, Trash2 } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { MedicationLog } from '@/lib/types';
import { AppHeader } from '@/components/app-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const logsQuery = useMemoFirebase(
    () => (user ? query(collection(firestore, 'users', user.uid, 'medicationlogs'), orderBy('timestamp', 'desc')) : null),
    [firestore, user]
  );
  
  const { data: medicationLogs, isLoading: isLogsLoading, error } = useCollection<MedicationLog>(logsQuery);

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);
  
  const handleClearHistory = async () => {
    if (!user || !firestore) return;
    const logsCollection = collection(firestore, 'users', user.uid, 'medicationlogs');

    setIsDeleting(true);
    try {
      const batch = writeBatch(firestore);
      const querySnapshot = await getDocs(logsCollection);
      querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      toast({
        title: 'History Cleared',
        description: 'All medication logs have been deleted.',
      });
    } catch (e) {
      console.error("Error clearing history: ", e);
      toast({
        title: 'Error',
        description: 'Could not clear medication history. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Taken':
        return <CheckCircle2 className="h-5 w-5 text-status-taken-fg" />;
      case 'Snoozed':
        return <PauseCircle className="h-5 w-5 text-status-snoozed-fg" />;
      case 'Missed':
        return <XCircle className="h-5 w-5 text-status-missed-fg" />;
      default:
        return <Pill className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: string): "taken" | "snoozed" | "missed" | "outline" => {
    switch (status) {
      case 'Taken':
        return 'taken';
      case 'Snoozed':
        return 'snoozed';
      case 'Missed':
        return 'missed';
      default:
        return 'outline';
    }
  };

  const groupedLogs = React.useMemo(() => {
    if (!medicationLogs) return {};
    return medicationLogs.reduce((acc, log) => {
      if (!log.timestamp) return acc;
      // Convert Firestore Timestamp to JS Date for formatting
      const logDate = (log.timestamp as any).toDate ? (log.timestamp as any).toDate() : new Date(log.timestamp as string);
      const dateKey = format(logDate, 'yyyy-MM-dd');

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(log);
      return acc;
    }, {} as Record<string, MedicationLog[]>);
  }, [medicationLogs]);
  
  const sortedDates = Object.keys(groupedLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

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
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Medication History</h1>
              <p className="text-muted-foreground mt-1">A complete log of your medication consumption.</p>
            </div>
            {medicationLogs && medicationLogs.length > 0 && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isDeleting}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting ? 'Clearing...' : 'Clear History'}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all your medication history logs.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearHistory} className="bg-destructive hover:bg-destructive/90">
                            Yes, delete all history
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
          </div>

          {isLogsLoading && (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-4 w-2/5" />
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-4 w-2/5" />
                        </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLogsLoading && sortedDates.length === 0 && (
            <Card className="text-center p-12">
              <Pill className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No History Found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Once you start taking or missing medications, your history will appear here.
              </p>
            </Card>
          )}

          {!isLogsLoading && sortedDates.length > 0 && (
            <div className="space-y-6">
              {sortedDates.map(date => (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      {format(new Date(date), 'MMMM do, yyyy')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {groupedLogs[date].map(log => (
                      <div key={log.id} className="flex items-center gap-4 p-3 rounded-lg bg-background">
                        <div className="p-2 bg-muted/50 rounded-full">
                           {getStatusIcon(log.status)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{log.medicationName}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.timestamp && (log.timestamp as any).seconds ? format(new Date((log.timestamp as any).seconds * 1000), 'p') : 'No time'}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(log.status)}>{log.status}</Badge>
                      </div>
                    ))}
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
