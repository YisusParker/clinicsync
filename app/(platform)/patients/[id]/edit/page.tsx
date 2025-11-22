import { getPatient } from "@/lib/patients";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createUpdatePatientAction } from "./actions";

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await getPatient(Number(id));

  if (!patient) {
    notFound();
  }

  const updatePatientAction = createUpdatePatientAction(Number(id));

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link
          href={`/patients/${patient.id}`}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Editar paciente
          </h1>
          <p className="text-slate-500 mt-1">
            Actualiza la información del paciente
          </p>
        </div>
      </div>

      {/* FORM */}
      <form action={updatePatientAction} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
              Nombre completo *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={patient.name}
              placeholder="María López"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A6CBD] focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue={patient.email || ""}
              placeholder="maria@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A6CBD] focus:border-transparent"
            />
          </div>

          {/* Emergency Phone */}
          <div>
            <label htmlFor="emergencyPhone" className="block text-sm font-medium text-slate-700 mb-2">
              Teléfono de emergencia
            </label>
            <input
              type="tel"
              id="emergencyPhone"
              name="emergencyPhone"
              defaultValue={patient.emergencyPhone || ""}
              placeholder="+52 555 123 4567"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A6CBD] focus:border-transparent"
            />
          </div>

          {/* Blood Type */}
          <div>
            <label htmlFor="bloodType" className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de sangre
            </label>
            <select
              id="bloodType"
              name="bloodType"
              defaultValue={patient.bloodType || ""}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A6CBD] focus:border-transparent"
            >
              <option value="">Seleccionar</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          {/* Allergies */}
          <div className="md:col-span-2">
            <label htmlFor="allergies" className="block text-sm font-medium text-slate-700 mb-2">
              Alergias conocidas
            </label>
            <textarea
              id="allergies"
              name="allergies"
              rows={3}
              defaultValue={patient.allergies || ""}
              placeholder="Penicilina, polen, etc."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A6CBD] focus:border-transparent resize-none"
            />
          </div>

          {/* Medications */}
          <div className="md:col-span-2">
            <label htmlFor="medications" className="block text-sm font-medium text-slate-700 mb-2">
              Medicamentos actuales
            </label>
            <textarea
              id="medications"
              name="medications"
              rows={3}
              defaultValue={patient.medications || ""}
              placeholder="Metformina 500mg, 2 veces al día"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A6CBD] focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
          <Link
            href={`/patients/${patient.id}`}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-[#0A6CBD] hover:bg-[#095a9d] text-white rounded-xl font-medium transition shadow-sm"
          >
            <Save size={18} />
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}

