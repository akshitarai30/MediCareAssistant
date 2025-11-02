export type MedicationStatus = "Taken" | "Snoozed" | "Missed" | "Upcoming";

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  timings: string[];
  status: MedicationStatus;
  nextDoseTime: string | null;
  nextDoseDate: Date | string | null; // Allow string for Firestore timestamp
  userId: string;
  prescriptionEndDate?: Date | string | null;
}

export interface MedicationEntry {
  name: string;
  dosage: string;
  timings: string;
  durationDays: number;
}

export interface MedicationLog {
    id?: string;
    userId: string;
    medicationId: string;
    medicationName: string;
    status: MedicationStatus;
    timestamp: Date | string;
}
