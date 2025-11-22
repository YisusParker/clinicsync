import { getPatients } from "@/lib/patients";
import { Plus, Users, Mail, Phone, Droplet } from "lucide-react";
import Link from "next/link";

export default async function PatientsPage() {
  const patients = await getPatients();

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Pacientes
          </h1>
          <p className="text-slate-500 mt-1">
            Gestiona la información de tus pacientes
          </p>
        </div>
        <Link
          href="/patients/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#0A6CBD] hover:bg-[#095a9d] text-white rounded-xl font-medium transition shadow-sm"
        >
          <Plus size={18} />
          Nuevo paciente
        </Link>
      </div>

      {/* PATIENTS LIST */}
      {patients.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            No hay pacientes registrados
          </h3>
          <p className="text-slate-500 mb-6">
            Comienza agregando tu primer paciente
          </p>
          <Link
            href="/patients/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A6CBD] hover:bg-[#095a9d] text-white rounded-xl font-medium transition"
          >
            <Plus size={18} />
            Agregar paciente
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient) => (
            <Link
              key={patient.id}
              href={`/patients/${patient.id}`}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-[#0A6CBD]/30 transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 group-hover:text-[#0A6CBD] transition">
                  {patient.name}
                </h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  {patient._count.consultations} consultas
                </span>
              </div>

              <div className="space-y-2 text-sm">
                {patient.email && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail size={14} />
                    <span className="truncate">{patient.email}</span>
                  </div>
                )}
                {patient.emergencyPhone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone size={14} />
                    <span>{patient.emergencyPhone}</span>
                  </div>
                )}
                {patient.bloodType && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Droplet size={14} className="text-red-500" />
                    <span>Tipo: {patient.bloodType}</span>
                  </div>
                )}
                {patient.allergies && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      Alergias
                    </p>
                    <p className="text-xs text-slate-700 line-clamp-2">
                      {patient.allergies}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

