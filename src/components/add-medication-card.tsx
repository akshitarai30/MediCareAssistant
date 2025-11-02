'use client';

import { PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AddMedicationCardProps {
    onAdd: () => void;
}

export function AddMedicationCard({ onAdd }: AddMedicationCardProps) {
  return (
    <Card 
        className="flex items-center justify-center border-2 border-dashed bg-muted/50 hover:border-primary hover:bg-primary/10 transition-all cursor-pointer min-h-[350px]"
        onClick={onAdd}
    >
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <PlusCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Add New Medication</h3>
        <p className="text-sm text-muted-foreground mt-1">Click here to add a new prescription</p>
      </CardContent>
    </Card>
  );
}
