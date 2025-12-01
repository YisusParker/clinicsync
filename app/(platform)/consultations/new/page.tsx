import { getPatients } from "@/lib/patients";
import NewConsultationClient from "./NewConsultationClient";

export default async function NewConsultationPage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const { patientId } = await searchParams;
  const patients = await getPatients();

  return <NewConsultationClient initialPatients={patients} initialPatientId={patientId} />;
}

