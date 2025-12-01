"use client";

import { useState } from "react";
import { ArrowLeft, Save, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PatientSearch from "./PatientSearch";
import QuickContextPanel from "./QuickContextPanel";

interface Patient {
  id: number;
  name: string;
  email: string | null;
  bloodType: string | null;
  allergies: string | null;
  medications: string | null;
  emergencyPhone: string | null;
  _count: {
    consultations: number;
  };
  consultations: Array<{
    date: Date;
    summary: string;
  }>;
}

interface NewConsultationClientProps {
  initialPatients: Patient[];
  initialPatientId?: string | null;
}

export default function NewConsultationClient({
  initialPatients,
  initialPatientId,
}: NewConsultationClientProps) {
  const router = useRouter();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    initialPatientId || null
  );
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  const handleSelectPatient = (patientId: number) => {
    setSelectedPatientId(patientId.toString());
    setShowContextPanel(true);
    // Update URL without reload
    const url = new URL(window.location.href);
    url.searchParams.set("patientId", patientId.toString());
    window.history.pushState({}, "", url);
  };

  const handleSubmit = async (formData: FormData) => {
    if (!selectedPatientId) {
      alert("Por favor selecciona un paciente");
      return;
    }

    setIsSubmitting(true);
    // patientId is already in the hidden input field
  };

  return (
    <>
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
        <form
          action={async (formData: FormData) => {
            if (!selectedPatientId) {
              alert("Por favor selecciona un paciente");
              return;
            }
            setIsSubmitting(true);
            const { createConsultationAction } = await import("./actions");
            await createConsultationAction(formData);
          }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6"
        >
          <div className="space-y-6">
            {/* Patient Selection with Smart Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Paciente *
              </label>
              <PatientSearch
                onSelectPatient={handleSelectPatient}
                selectedPatientId={selectedPatientId}
                patients={initialPatients}
              />
              <input
                type="hidden"
                name="patientId"
                value={selectedPatientId || ""}
                required
              />
              {selectedPatientId && (
                <button
                  type="button"
                  onClick={() => setShowContextPanel(!showContextPanel)}
                  className="mt-2 text-sm text-[#0A6CBD] hover:text-[#095a9d] font-medium"
                >
                  {showContextPanel
                    ? "Ocultar contexto médico"
                    : "Ver contexto médico del paciente"}
                </button>
              )}
            </div>

            {/* Date */}
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Fecha de la consulta
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  defaultValue={defaultDate}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A6CBD] focus:border-transparent"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* Summary */}
            <div>
              <label
                htmlFor="summary"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
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
              disabled={isSubmitting || !selectedPatientId}
              className="flex items-center gap-2 px-6 py-2 bg-[#29B86F] hover:bg-[#238f5a] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition shadow-sm"
            >
              <Save size={18} />
              {isSubmitting ? "Guardando..." : "Guardar consulta"}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Context Panel */}
      {showContextPanel && selectedPatientId && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowContextPanel(false)}
          />
          <QuickContextPanel
            patientId={parseInt(selectedPatientId)}
            onClose={() => setShowContextPanel(false)}
          />
        </>
      )}
    </>
  );
}

