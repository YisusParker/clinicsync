"use server";

import { searchPatients } from "@/lib/patients";

export async function searchPatientsAction(query: string) {
  return await searchPatients(query);
}

