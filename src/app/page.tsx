'use client';

import * as React from 'react';
import { Suspense } from 'react';
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
import { AppLayout } from '@/components/app-layout';


export default function HomeWrapper() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    }>
      <Home />
    </Suspense>
  );
}

// 🧩 Your original Home component stays the same
function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ now safely inside Suspense
  const firestore = useFirestore();

  