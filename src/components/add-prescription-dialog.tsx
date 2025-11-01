'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { MedicationEntry } from '@/lib/types';

interface AddPrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMedication: (data: MedicationEntry) => void;
}

const FormSchema = z.object({
  name: z.string().min(1, 'Medication name is required.'),
  dosage: z.string().min(1, 'Dosage is required.'),
  timings: z
    .string()
    .min(1, 'At least one timing is required.')
    .regex(/^(\d{2}:\d{2})(,\s*\d{2}:\d{2})*$/, 'Use HH:mm format, comma separated.'),
});

export function AddPrescriptionDialog({ open, onOpenChange, onAddMedication }: AddPrescriptionDialogProps) {
  const form = useForm<MedicationEntry>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      dosage: '',
      timings: '',
    },
  });

  const onSubmit: SubmitHandler<MedicationEntry> = (data) => {
    onAddMedication(data);
    form.reset();
  };
  
  React.useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Medication</DialogTitle>
          <DialogDescription>
            Enter the details for your medication below to add it to your dashboard.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medication Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Lisinopril" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dosage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosage</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 10mg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timings</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 08:00, 20:00" {...field} />
                  </FormControl>
                   <p className="text-xs text-muted-foreground">
                    Enter times in HH:mm format, separated by commas.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter>
                <Button type="submit">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Medication
                </Button>
              </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
