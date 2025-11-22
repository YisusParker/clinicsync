import { getConsultation } from "@/lib/consultations";
import { ArrowLeft, Calendar, User, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const consultation = await getConsultation(Number(id));

  if (!consultation) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">
              Consulta médica
            </h1>
            <p className="text-slate-500 mt-1">Detalles de la consulta</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          {/* CONSULTATION SUMMARY */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-[#0A6CBD]" />
              Resumen
            </h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {consultation.summary}
              </p>
            </div>
          </div>

          {/* PATIENT INFO */}
          {consultation.patient && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-[#29B86F]" />
                Información del paciente
              </h2>
              <div className="space-y-3">
                <Link
                  href={`/patients/${consultation.patient.id}`}
                  className="block text-[#0A6CBD] hover:text-[#095a9d] font-medium"
                >
                  {consultation.patient.name}
                </Link>
                {consultation.patient.email && (
                  <p className="text-sm text-slate-600">
                    {consultation.patient.email}
                  </p>
                )}
                {consultation.patient.bloodType && (
                  <p className="text-sm text-slate-600">
                    Tipo de sangre: {consultation.patient.bloodType}
                  </p>
                )}
                {consultation.patient.allergies && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      Alergias
                    </p>
                    <p className="text-sm text-slate-700">
                      {consultation.patient.allergies}
                    </p>
                  </div>
                )}
                {consultation.patient.medications && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      Medicamentos actuales
                    </p>
                    <p className="text-sm text-slate-700">
                      {consultation.patient.medications}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">
              Detalles
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Fecha</p>
                  <p className="text-sm font-medium text-slate-800">
                    {new Date(consultation.date).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {consultation.patient && (
            <Link
              href={`/patients/${consultation.patient.id}`}
              className="block w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium text-center transition"
            >
              Ver perfil del paciente
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

