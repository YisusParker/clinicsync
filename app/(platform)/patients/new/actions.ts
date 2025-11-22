"use server";

import { createPatient } from "@/lib/patients";

// Wrapper to match Next.js form action type signature
export async function createPatientAction(formData: FormData): Promise<void> {
  await createPatient(formData);
}

