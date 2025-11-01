'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import placeholderImage from '@/lib/placeholder-images.json';

interface EmptyStateProps {
  onScan: () => void;
}

export function EmptyState({ onScan }: EmptyStateProps) {
  const image = placeholderImage.placeholderImages[0];

  return (
    <div className="text-center bg-card p-8 rounded-xl border border-dashed flex flex-col items-center justify-center min-h-[400px]">
       <Image
        src={image.imageUrl}
        alt={image.description}
        width={300}
        height={200}
        className="rounded-lg object-cover mb-6"
        data-ai-hint={image.imageHint}
      />
      <h2 className="text-2xl font-semibold text-foreground">Welcome to MediScan Assist</h2>
      <p className="mt-2 text-muted-foreground max-w-md mx-auto">
        Your medication dashboard is empty. Get started by scanning your first prescription.
      </p>
      <Button onClick={onScan} className="mt-6" size="lg">
        <Camera className="mr-2 h-5 w-5" />
        Scan Prescription
      </Button>
    </div>
  );
}
