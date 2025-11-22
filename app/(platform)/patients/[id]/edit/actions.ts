"use server";

import { updatePatient } from "@/lib/patients";

// Server action that reads id from FormData
export async function updatePatientAction(formData: FormData): Promise<void> {
  const idStr = formData.get("id");
  if (!idStr || typeof idStr !== "string") {
    throw new Error("Patient ID is required");
  }
  const id = Number(idStr);
  if (isNaN(id)) {
    throw new Error("Invalid patient ID");
  }
  await updatePatient(id, formData);
}

