import { getPatient } from "@/lib/patients";
import { ArrowLeft, Edit, Mail, Phone, Droplet, Calendar, FileText, Download } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await getPatient(Number(id));

  if (!patient) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/patients"
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">
              {patient.name}
            </h1>
            <p className="text-slate-500 mt-1">Información del paciente</p>
          </div>
        </div>
        <Link
          href={`/patients/${patient.id}/edit`}
          className="flex items-center gap-2 px-4 py-2 bg-[#0A6CBD] hover:bg-[#095a9d] text-white rounded-xl font-medium transition shadow-sm"
        >
          <Edit size={18} />
          Editar
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN INFO */}
        <div className="lg:col-span-2 space-y-6">
          {/* PATIENT INFO CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Información personal
            </h2>
            <div className="space-y-4">
              {patient.email && (
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-800">
                      {patient.email}
                    </p>
                  </div>
                </div>
              )}
              {patient.emergencyPhone && (
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Teléfono de emergencia</p>
                    <p className="text-sm font-medium text-slate-800">
                      {patient.emergencyPhone}
                    </p>
                  </div>
                </div>
              )}
              {patient.bloodType && (
                <div className="flex items-center gap-3">
                  <Droplet size={18} className="text-red-500" />
                  <div>
                    <p className="text-xs text-slate-500">Tipo de sangre</p>
                    <p className="text-sm font-medium text-slate-800">
                      {patient.bloodType}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MEDICAL INFO */}
          {(patient.allergies || patient.medications) && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Información médica
              </h2>
              <div className="space-y-4">
                {patient.allergies && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">
                      Alergias conocidas
                    </p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {patient.allergies}
                    </p>
                  </div>
                )}
                {patient.medications && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">
                      Medicamentos actuales
                    </p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {patient.medications}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RECENT CONSULTATIONS */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Consultas recientes
              </h2>
              <Link
                href={`/consultations/new?patientId=${patient.id}`}
                className="text-sm text-[#0A6CBD] hover:text-[#095a9d] font-medium"
              >
                Nueva consulta
              </Link>
            </div>
            {patient.consultations.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  No hay consultas registradas
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {patient.consultations.map((consultation) => (
                  <Link
                    key={consultation.id}
                    href={`/consultations/${consultation.id}`}
                    className="block p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 hover:border-[#0A6CBD]/30 transition group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800 group-hover:text-[#0A6CBD] transition">
                          {consultation.summary}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 ml-4">
                        <Calendar size={14} />
                        <span>
                          {new Date(consultation.date).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">
              Acciones rápidas
            </h3>
            <div className="space-y-2">
              <Link
                href={`/consultations/new?patientId=${patient.id}`}
                className="block w-full px-4 py-2.5 bg-[#29B86F] hover:bg-[#238f5a] text-white rounded-xl text-sm font-medium text-center transition"
              >
                Nueva consulta
              </Link>
              <a
                href={`/api/patients/${patient.id}/export`}
                download
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#0A6CBD] hover:bg-[#095a9d] text-white rounded-xl text-sm font-medium transition"
              >
                <Download size={16} />
                Descargar archivo completo
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

