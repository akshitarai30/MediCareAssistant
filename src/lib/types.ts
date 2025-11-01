export type MedicationStatus = "Taken" | "Snoozed" | "Missed" | "Upcoming";

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  timings: string[];
  status: MedicationStatus;
  nextDoseTime: string | null;
  nextDoseDate: Date | null;
}
