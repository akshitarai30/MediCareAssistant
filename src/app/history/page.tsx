'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { collection } from 'firebase/firestore';
import { format } from 'date-fns';
import { Calendar, CheckCircle2, PauseCircle, XCircle, Pill } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { MedicationLog } from '@/lib/types';
import { AppHeader } from '@/components/app-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const logsQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'medicationlogs') : null),
    [firestore, user]
  );
  
  const { data: medicationLogs, isLoading: isLogsLoading } = useCollection<MedicationLog>(logsQuery);

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Taken':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'Snoozed':
        return <PauseCircle className="h-5 w-5 text-yellow-500" />;
      case 'Missed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Pill className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Taken':
        return 'default';
      case 'Snoozed':
        return 'secondary';
      case 'Missed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const groupedLogs = React.useMemo(() => {
    if (!medicationLogs) return {};
    return medicationLogs.reduce((acc, log) => {
      const date = format(new Date((log.timestamp as any).seconds * 1000), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(log);
      acc[date].sort((a, b) => (b.timestamp as any).seconds - (a.timestamp as any).seconds);
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Medication History</h1>
            <p className="text-muted-foreground mt-1">A complete log of your medication consumption.</p>
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
                      <div key={log.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                        <div className="p-2 bg-background rounded-full">
                           {getStatusIcon(log.status)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{log.medicationName}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date((log.timestamp as any).seconds * 1000), 'p')}
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
