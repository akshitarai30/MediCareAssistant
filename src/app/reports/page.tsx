'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { format } from 'date-fns';
import { FileText, UploadCloud, Trash2, Download } from 'lucide-react';

import { useUser, useFirestore, useStorage, useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { MedicalReport } from '@/lib/types';

import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { UploadReportDialog } from '@/components/upload-report-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

export default function ReportsPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  const reportsQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'reports') : null),
    [firestore, user]
  );

  const { data: reports, isLoading: isReportsLoading } = useCollection<MedicalReport>(reportsQuery);

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleUploadReport = async (file: File) => {
    if (!user || !file) return;

    setIsUploading(true);
    try {
      const storagePath = `users/${user.uid}/reports/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      
      await uploadBytes(storageRef, file);
      
      const reportsCollection = collection(firestore, 'users', user.uid, 'reports');
      const newReport: Omit<MedicalReport, 'id'> = {
        userId: user.uid,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadDate: serverTimestamp() as unknown as string,
        storagePath: storagePath,
      };

      addDocumentNonBlocking(reportsCollection, newReport);
      
      toast({
        title: 'Upload Successful',
        description: `${file.name} has been uploaded.`,
      });
    } catch (error) {
      console.error('Error uploading report:', error);
      toast({
        title: 'Upload Failed',
        description: 'Could not upload the report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setIsUploadDialogOpen(false);
    }
  };

  const handleDeleteReport = async (report: MedicalReport) => {
     if (!user) return;
     const reportDocRef = doc(firestore, 'users', user.uid, 'reports', report.id!);
     const storageRef = ref(storage, report.storagePath);

     try {
       await deleteDoc(reportDocRef);
       await deleteObject(storageRef);
       toast({
         title: 'Report Deleted',
         description: `${report.fileName} has been deleted.`,
       });
     } catch (error) {
       console.error("Error deleting report:", error);
       toast({
         title: 'Error',
         description: 'Could not delete the report. Please try again.',
         variant: 'destructive',
       });
     }
  };

  const handleDownloadReport = async (report: MedicalReport) => {
    try {
        const url = await getDownloadURL(ref(storage, report.storagePath));
        const a = document.createElement('a');
        a.href = url;
        a.download = report.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (error) {
        console.error("Error downloading report: ", error);
        toast({
            title: 'Download Failed',
            description: 'Could not download the report. Please try again.',
            variant: 'destructive'
        });
    }
  };


  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Medical Reports</h1>
                <p className="text-muted-foreground mt-1">Manage your uploaded medical documents.</p>
              </div>
              <Button onClick={() => setIsUploadDialogOpen(true)} disabled={isUploading}>
                <UploadCloud className="mr-2 h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload Report'}
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead className="hidden sm:table-cell">Uploaded On</TableHead>
                      <TableHead className="hidden md:table-cell text-right">Size</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isReportsLoading && (
                      [...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                          <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-2/3" /></TableCell>
                          <TableCell className="hidden md:table-cell text-right"><Skeleton className="h-5 w-1/2" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-16" /></TableCell>
                        </TableRow>
                      ))
                    )}
                    {!isReportsLoading && reports && reports.length > 0 ? (
                      reports.map(report => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground"/>
                            {report.fileName}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {report.uploadDate ? format(new Date((report.uploadDate as any).seconds * 1000), 'MMM d, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-right">{formatBytes(report.fileSize)}</TableCell>
                          <TableCell className="text-right">
                             <Button variant="ghost" size="icon" onClick={() => handleDownloadReport(report)} className="mr-2">
                                <Download className="h-4 w-4" />
                            </Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete the report: {report.fileName}.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteReport(report)} className="bg-destructive hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      !isReportsLoading && (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            No reports found.
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <UploadReportDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUpload={handleUploadReport}
        isUploading={isUploading}
      />
    </>
  );
}
