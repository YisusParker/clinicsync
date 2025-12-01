import { ArrowLeft, Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import ImportPatientForm from "./ImportPatientForm";

export default function ImportPatientPage() {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link
          href="/patients"
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Importar paciente
          </h1>
          <p className="text-slate-500 mt-1">
            Importa un paciente desde un archivo médico exportado
          </p>
        </div>
      </div>

      {/* INFO CARD */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">
              ¿Cómo obtener el archivo médico?
            </h3>
            <p className="text-sm text-blue-800 mb-2">
              El otro doctor debe exportar el archivo médico del paciente desde ClinicSync:
            </p>
            <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
              <li>Ir al perfil del paciente</li>
              <li>Hacer clic en "Descargar archivo completo"</li>
              <li>Enviar el archivo .txt generado</li>
            </ol>
          </div>
        </div>
      </div>

      {/* FORM */}
      <ImportPatientForm />
    </div>
  );
}

