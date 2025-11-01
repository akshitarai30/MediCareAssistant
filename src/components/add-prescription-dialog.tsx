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
import { Textarea } from '@/components/ui/textarea';
import { Wand2 } from 'lucide-react';

interface AddPrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (prescriptionText: string) => void;
}

const placeholderText = `Example:
Dr. Emily Carter
Date: 2024-07-29

Patient: John Doe

1. Lisinopril
   - Dosage: 10mg
   - Instructions: Take one tablet daily in the morning.
   - Timings: 08:00

2. Metformin
   - Dosage: 500mg
   - Instructions: Take one tablet twice daily with meals.
   - Timings: 08:00, 20:00`;

export function AddPrescriptionDialog({ open, onOpenChange, onGenerate }: AddPrescriptionDialogProps) {
  const [prescriptionText, setPrescriptionText] = React.useState('');

  const handleGenerateClick = () => {
    onGenerate(prescriptionText);
    setPrescriptionText(''); // Clear text area after generation
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Prescription</DialogTitle>
          <DialogDescription>
            Enter the prescription details below. Our AI will automatically create your medication schedule.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder={placeholderText}
            className="min-h-[200px] text-sm"
            value={prescriptionText}
            onChange={(e) => setPrescriptionText(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleGenerateClick}>
            <Wand2 className="mr-2 h-4 w-4" />
            Generate Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
