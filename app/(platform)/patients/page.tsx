import { getPatients } from "@/lib/patients";
import PatientsListClient from "./PatientsListClient";

export default async function PatientsPage() {
  const patients = await getPatients();

  return <PatientsListClient initialPatients={patients} />;
}

