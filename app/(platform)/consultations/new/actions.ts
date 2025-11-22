"use server";

import { createConsultation } from "@/lib/consultations";

// Wrapper to match Next.js form action type signature
export async function createConsultationAction(formData: FormData): Promise<void> {
  await createConsultation(formData);
}

