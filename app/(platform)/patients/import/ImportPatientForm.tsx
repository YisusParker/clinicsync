"use client";

import { useState } from "react";
import { Upload, X, AlertCircle, CheckCircle2, FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ImportPatientForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<{
    name: string;
    email?: string;
    bloodType?: string;
    consultations: number;
  } | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".txt")) {
      setError("Por favor selecciona un archivo .txt exportado desde ClinicSync");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);

    // Preview file content
    try {
      const text = await selectedFile.text();
      const previewData = parseFilePreview(text);
      setPreview(previewData);
    } catch (err) {
      setError("Error al leer el archivo. Por favor intenta de nuevo.");
      setFile(null);
    }
  };

  const parseFilePreview = (content: string) => {
    const lines = content.split("\n");
    let name = "";
    let email: string | undefined;
    let bloodType: string | undefined;
    let consultationCount = 0;

    let inPatientSection = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.includes("INFORMACIÓN DEL PACIENTE")) {
        inPatientSection = true;
        continue;
      }

      if (line.includes("HISTORIAL DE CONSULTAS")) {
        // Count consultations
        const consultationMatches = content.match(/CONSULTA #/g);
        consultationCount = consultationMatches ? consultationMatches.length : 0;
        break;
      }

      if (inPatientSection) {
        if (line.startsWith("Nombre:")) {
          name = line.replace("Nombre:", "").trim();
        } else if (line.startsWith("Email:")) {
          email = line.replace("Email:", "").trim() || undefined;
        } else if (line.startsWith("Tipo de sangre:")) {
          bloodType = line.replace("Tipo de sangre:", "").trim() || undefined;
        }
      }
    }

    return { name, email, bloodType, consultations: consultationCount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Por favor selecciona un archivo");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      const fileContent = await file.text();
      
      // Parse consultations from file
      const consultations: Array<{ 
        date: string; 
        summary: string;
        doctorName?: string;
        doctorEmail?: string;
      }> = [];
      const lines = fileContent.split("\n");
      
      let inConsultationSection = false;
      let currentConsultation: { 
        date: string; 
        summary: string;
        doctorName?: string;
        doctorEmail?: string;
      } | null = null;
      let inSummarySection = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.includes("HISTORIAL DE CONSULTAS")) {
          inConsultationSection = true;
          inSummarySection = false;
          continue;
        }
        
        if (line.includes("RESUMEN")) {
          if (currentConsultation) {
            consultations.push(currentConsultation);
          }
          break;
        }
        
        if (inConsultationSection) {
          // Check if this is a separator line (only "=" characters, length >= 80)
          const isLongSeparator = line.match(/^={50,}$/);
          
          if (line.startsWith("CONSULTA #")) {
            if (currentConsultation && currentConsultation.date && currentConsultation.summary) {
              consultations.push(currentConsultation);
            }
            currentConsultation = { date: "", summary: "" };
            inSummarySection = false;
          } else if (line.startsWith("Fecha:") && currentConsultation) {
            const dateStr = line.replace("Fecha:", "").trim();
            // Parse Spanish date format: "2 de diciembre de 2025, 19:41"
            try {
              // Try to parse with Spanish locale
              let date = new Date(dateStr);
              if (isNaN(date.getTime())) {
                // Manual parsing for Spanish format: "día de mes de año, hora:minuto"
                const months: { [key: string]: string } = {
                  enero: "01", febrero: "02", marzo: "03", abril: "04",
                  mayo: "05", junio: "06", julio: "07", agosto: "08",
                  septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12"
                };
                const match = dateStr.match(/(\d+)\s+de\s+(\w+)\s+de\s+(\d+),?\s*(\d+):(\d+)/i);
                if (match) {
                  const day = match[1].padStart(2, "0");
                  const monthName = match[2].toLowerCase();
                  const year = match[3];
                  const hour = match[4];
                  const minute = match[5];
                  const month = months[monthName] || "01";
                  const isoDate = `${year}-${month}-${day}T${hour}:${minute}:00`;
                  date = new Date(isoDate);
                }
              }
              if (!isNaN(date.getTime())) {
                currentConsultation.date = date.toISOString();
              } else {
                currentConsultation.date = new Date().toISOString();
              }
            } catch (err) {
              // Try alternative parsing
              currentConsultation.date = new Date().toISOString();
            }
            inSummarySection = false;
          } else if (line.startsWith("Médico que atendió:") && currentConsultation) {
            // Extract doctor info: "Médico que atendió: Name (email@example.com)"
            const doctorInfo = line.replace("Médico que atendió:", "").trim();
            const match = doctorInfo.match(/^(.+?)\s*\((.+?)\)$/);
            if (match) {
              currentConsultation.doctorName = match[1].trim();
              currentConsultation.doctorEmail = match[2].trim();
            } else {
              // If no email in parentheses, just use the name
              currentConsultation.doctorName = doctorInfo;
            }
            inSummarySection = false;
          } else if (line.startsWith("Resumen:") && currentConsultation) {
            // Summary starts on next line (even if empty)
            inSummarySection = true;
            continue;
          } else if (line.startsWith("Plan de seguimiento:") && currentConsultation) {
            // Stop reading summary if we hit a follow-up plan section
            inSummarySection = false;
          } else if (isLongSeparator && currentConsultation) {
            // Long separator (===) indicates end of consultation
            // Finish current consultation if we have date and summary
            if (currentConsultation.date && currentConsultation.summary && currentConsultation.summary.trim()) {
              consultations.push(currentConsultation);
              currentConsultation = null;
            }
            inSummarySection = false;
          } else if (currentConsultation && !isLongSeparator && !line.match(/^-+$/)) {
            if (inSummarySection) {
              // We're in the summary section - collect text (even empty lines can be part of summary)
              if (!currentConsultation.summary) {
                currentConsultation.summary = line;
              } else {
                currentConsultation.summary += "\n" + line;
              }
            }
          }
        }
      }
      
      // Push last consultation if exists
      if (currentConsultation && currentConsultation.date && currentConsultation.summary && currentConsultation.summary.trim()) {
        consultations.push(currentConsultation);
      }

      // Send to server
      const formData = new FormData();
      formData.append("fileContent", fileContent);
      formData.append("consultations", JSON.stringify(consultations));

      const response = await fetch("/api/patients/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al importar el paciente");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/patients/${data.patientId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Error al importar el paciente. Verifica el formato del archivo.");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Archivo médico (.txt) *
        </label>
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-[#0A6CBD] transition">
          <input
            type="file"
            id="file"
            accept=".txt"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isProcessing}
          />
          <label
            htmlFor="file"
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            {file ? (
              <div className="flex items-center gap-3 text-[#0A6CBD]">
                <FileText className="w-8 h-8" />
                <div className="text-left">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-slate-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                {!isProcessing && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview(null);
                      setError(null);
                    }}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Haz clic para seleccionar o arrastra el archivo aquí
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Archivo .txt exportado desde ClinicSync
                  </p>
                </div>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h3 className="font-semibold text-slate-800 mb-3">Vista previa:</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Nombre:</span> {preview.name}
            </p>
            {preview.email && (
              <p>
                <span className="font-medium">Email:</span> {preview.email}
              </p>
            )}
            {preview.bloodType && (
              <p>
                <span className="font-medium">Tipo de sangre:</span> {preview.bloodType}
              </p>
            )}
            <p>
              <span className="font-medium">Consultas a importar:</span> {preview.consultations}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">
            Paciente importado exitosamente. Redirigiendo...
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
        <Link
          href="/patients"
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={!file || isProcessing || success}
          className="flex items-center gap-2 px-6 py-2 bg-[#0A6CBD] hover:bg-[#095a9d] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition shadow-sm"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Importando...
            </>
          ) : (
            <>
              <Upload size={18} />
              Importar paciente
            </>
          )}
        </button>
      </div>
    </form>
  );
}

