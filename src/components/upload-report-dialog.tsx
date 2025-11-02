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
import { UploadCloud, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File) => void;
  isUploading: boolean;
}

export function UploadReportDialog({ open, onOpenChange, onUpload, isUploading }: UploadReportDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        // Basic file type validation (example: allow PDF and images)
        if (!['application/pdf', 'image/jpeg', 'image/png'].includes(selectedFile.type)) {
            toast({
                title: 'Invalid File Type',
                description: 'Please select a PDF or an image file.',
                variant: 'destructive',
            });
            return;
        }
        // Basic size validation (example: 5MB limit)
        if (selectedFile.size > 5 * 1024 * 1024) {
            toast({
                title: 'File Too Large',
                description: 'Please select a file smaller than 5MB.',
                variant: 'destructive',
            });
            return;
        }
        setFile(selectedFile);
    }
  };

  const handleUploadClick = () => {
    if (file) {
      onUpload(file);
    } else {
        toast({
            title: 'No File Selected',
            description: 'Please select a file to upload.',
            variant: 'destructive',
        });
    }
  };
  
  React.useEffect(() => {
    if (!open) {
      setFile(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Medical Report</DialogTitle>
          <DialogDescription>
            Select a file from your device to upload. Supported formats: PDF, JPG, PNG. Max size: 5MB.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="report-file" className="text-right">
              File
            </Label>
            <div className="col-span-3">
              <div 
                className="flex justify-center items-center w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                  <label htmlFor="report-file-input" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                          {file ? (
                               <p className="font-semibold text-primary">{file.name}</p>
                          ) : (
                            <>
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-muted-foreground">PDF, PNG, JPG (MAX. 5MB)</p>
                            </>
                          )}
                      </div>
                      <input id="report-file-input" ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="application/pdf,image/jpeg,image/png"/>
                  </label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUploadClick} disabled={!file || isUploading}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
