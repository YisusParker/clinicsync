"use server";

import { updatePatient } from "@/lib/patients";

// Wrapper to match Next.js form action type signature
export async function updatePatientAction(id: number, formData: FormData): Promise<void> {
  await updatePatient(id, formData);
}

