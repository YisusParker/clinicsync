"use client";

import { useEffect, useState } from "react";
import {
  User,
  AlertTriangle,
  Pill,
  Droplet,
  Calendar,
  Clock,
  FileText,
  ExternalLink,
  X,
} from "lucide-react";
import Link from "next/link";
import { getPatientQuickContextAction } from "./context-actions";

interface Consultation {
  id: number;
  date: Date;
  summary: string;
}

interface PatientContext {
  id: number;
  name: string;
  email: string | null;
  bloodType: string | null;
  allergies: string | null;
  medications: string | null;
  emergencyPhone: string | null;
  consultations: Consultation[];
  _count: {
    consultations: number;
  };
  daysSinceLastConsultation: number | null;
}

interface QuickContextPanelProps {
  patientId: number | null;
  onClose: () => void;
}

export default function QuickContextPanel({
  patientId,
  onClose,
}: QuickContextPanelProps) {
  const [context, setContext] = useState<PatientContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!patientId) {
      setContext(null);
      return;
    }

    setIsLoading(true);
    getPatientQuickContextAction(patientId)
      .then((data) => {
        setContext(data);
      })
      .catch((error) => {
        console.error("Error loading context:", error);
        setContext(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [patientId]);

  if (!patientId || isLoading) {
    return null;
  }

  if (!context) {
    return null;
  }

  const hasAlerts = !!context.allergies;
  const lastConsultation = context.consultations[0];
  const isLongTimeSinceLastVisit =
    context.daysSinceLastConsultation !== null &&
    context.daysSinceLastConsultation > 180; // 6 months

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-slate-200 z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">
          Contexto Médico
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 rounded-lg transition"
        >
          <X size={20} className="text-slate-600" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Patient Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#0A6CBD]/10 rounded-lg">
              <User className="w-5 h-5 text-[#0A6CBD]" />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-semibold text-slate-800">
                {context.name}
              </h4>
              {context.email && (
                <p className="text-sm text-slate-500">{context.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Medical Alerts */}
        {hasAlerts && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <h5 className="font-semibold text-amber-900">Alergias</h5>
            </div>
            <p className="text-sm text-amber-800 whitespace-pre-wrap">
              {context.allergies}
            </p>
          </div>
        )}

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          {context.bloodType && (
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Droplet className="w-4 h-4 text-red-500" />
                <p className="text-xs font-medium text-slate-500">
                  Tipo de Sangre
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {context.bloodType}
              </p>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-[#0A6CBD]" />
              <p className="text-xs font-medium text-slate-500">Consultas</p>
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {context._count.consultations} total
            </p>
          </div>
        </div>

        {/* Current Medications */}
        {context.medications && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-2 mb-2">
              <Pill className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <h5 className="font-semibold text-blue-900">
                Medicamentos Actuales
              </h5>
            </div>
            <p className="text-sm text-blue-800 whitespace-pre-wrap">
              {context.medications}
            </p>
          </div>
        )}

        {/* Last Consultation */}
        {lastConsultation && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-slate-600" />
              <h5 className="font-semibold text-slate-800">Última Consulta</h5>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock size={14} />
                <span>
                  {context.daysSinceLastConsultation !== null
                    ? `Hace ${context.daysSinceLastConsultation} días`
                    : "Fecha no disponible"}
                </span>
                {isLongTimeSinceLastVisit && (
                  <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                    Sin consulta hace 6+ meses
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-700 line-clamp-3">
                {lastConsultation.summary}
              </p>
            </div>
          </div>
        )}

        {/* Consultation Timeline */}
        {context.consultations.length > 0 && (
          <div>
            <h5 className="font-semibold text-slate-800 mb-3">
              Historial Reciente
            </h5>
            <div className="space-y-3">
              {context.consultations.slice(0, 5).map((consultation, index) => (
                <div
                  key={consultation.id}
                  className="relative pl-6 border-l-2 border-slate-200 pb-3 last:pb-0"
                >
                  <div className="absolute -left-1.5 top-0 w-3 h-3 bg-[#0A6CBD] rounded-full border-2 border-white" />
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-1">
                        {new Date(consultation.date).toLocaleDateString(
                          "es-ES",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                      <p className="text-sm text-slate-700 line-clamp-2">
                        {consultation.summary}
                      </p>
                    </div>
                    <Link
                      href={`/consultations/${consultation.id}`}
                      className="flex-shrink-0 p-1 hover:bg-slate-100 rounded transition"
                      target="_blank"
                    >
                      <ExternalLink size={14} className="text-slate-400" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-slate-200 space-y-2">
          <Link
            href={`/patients/${context.id}`}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#0A6CBD] hover:bg-[#095a9d] text-white rounded-xl text-sm font-medium transition"
          >
            <User size={16} />
            Ver perfil completo
          </Link>
          <Link
            href={`/consultations/new?patientId=${context.id}`}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#29B86F] hover:bg-[#238f5a] text-white rounded-xl text-sm font-medium transition"
          >
            <FileText size={16} />
            Nueva consulta
          </Link>
        </div>
      </div>
    </div>
  );
}

