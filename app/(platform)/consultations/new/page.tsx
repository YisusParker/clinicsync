import { createConsultation } from "@/lib/consultations";
import { getPatients } from "@/lib/patients";
import { ArrowLeft, Save, Calendar } from "lucide-react";
import Link from "next/link";

// Wrapper to match Next.js form action type signature
async function createConsultationAction(formData: FormData): Promise<void> {
  await createConsultation(formData);
}

export default async function NewConsultationPage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const { patientId } = await searchParams;
  const patients = await getPatients();

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Nueva consulta
          </h1>
          <p className="text-slate-500 mt-1">
            Registra el resumen de la consulta médica
          </p>
        </div>
      </div>

      {/* FORM */}
      <form action={createConsultationAction} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="space-y-6">
          {/* Patient Selection */}
          <div>
            <label htmlFor="patientId" className="block text-sm font-medium text-slate-700 mb-2">
              Paciente *
            </label>
            <select
              id="patientId"
              name="patientId"
              required
              defaultValue={patientId || ""}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A6CBD] focus:border-transparent"
            >
              <option value="">Seleccionar paciente</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-2">
              Fecha de la consulta
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                id="date"
                name="date"
                defaultValue={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A6CBD] focus:border-transparent"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
          </div>

          {/* Summary */}
          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-slate-700 mb-2">
              Resumen de la consulta *
            </label>
            <textarea
              id="summary"
              name="summary"
              required
              rows={8}
              placeholder="Incluye síntomas, diagnóstico, tratamiento, recomendaciones..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A6CBD] focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
          <Link
            href="/dashboard"
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-[#29B86F] hover:bg-[#238f5a] text-white rounded-xl font-medium transition shadow-sm"
          >
            <Save size={18} />
            Guardar consulta
          </button>
        </div>
      </form>
    </div>
  );
}

