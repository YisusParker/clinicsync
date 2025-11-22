"use server";

import { updatePatient } from "@/lib/patients";

// Wrapper to match Next.js form action type signature
export function createUpdatePatientAction(id: number) {
  return async function updatePatientAction(formData: FormData): Promise<void> {
    await updatePatient(id, formData);
  };
}

