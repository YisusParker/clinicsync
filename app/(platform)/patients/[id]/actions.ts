"use server";

import { deletePatient } from "@/lib/patients";

// Server action wrapper for deleting a patient
export async function deletePatientAction(formData: FormData): Promise<void> {
  const idStr = formData.get("id");
  if (!idStr || typeof idStr !== "string") {
    throw new Error("Patient ID is required");
  }
  const id = Number(idStr);
  if (isNaN(id)) {
    throw new Error("Invalid patient ID");
  }
  await deletePatient(id);
}

