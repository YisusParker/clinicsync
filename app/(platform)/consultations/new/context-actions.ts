"use server";

import { getPatientQuickContext } from "@/lib/patients";

export async function getPatientQuickContextAction(id: number) {
  return await getPatientQuickContext(id);
}

