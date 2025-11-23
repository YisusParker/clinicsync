"use server";

import { deleteConsultation } from "@/lib/consultations";

// Server action wrapper for deleting a consultation
export async function deleteConsultationAction(formData: FormData): Promise<void> {
  const idStr = formData.get("id");
  if (!idStr || typeof idStr !== "string") {
    throw new Error("Consultation ID is required");
  }
  const id = Number(idStr);
  if (isNaN(id)) {
    throw new Error("Invalid consultation ID");
  }
  await deleteConsultation(id);
}

