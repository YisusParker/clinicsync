import { getPatientFullData } from "@/lib/patients";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patient = await getPatientFullData(Number(id));

    if (!patient) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
    }

    // Generate text file content
    let content = `ARCHIVO MÉDICO - ${patient.name.toUpperCase()}\n`;
    content += `Generado el: ${new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}\n`;
    content += "=".repeat(80) + "\n\n";

    // Doctor information
    content += "INFORMACIÓN DEL MÉDICO\n";
    content += "-".repeat(80) + "\n";
    content += `Nombre: ${patient.doctor.name}\n`;
    content += `Email: ${patient.doctor.email}\n\n`;

    // Patient information
    content += "INFORMACIÓN DEL PACIENTE\n";
    content += "-".repeat(80) + "\n";
    content += `Nombre: ${patient.name}\n`;
    if (patient.email) {
      content += `Email: ${patient.email}\n`;
    }
    if (patient.bloodType) {
      content += `Tipo de sangre: ${patient.bloodType}\n`;
    }
    if (patient.emergencyPhone) {
      content += `Teléfono de emergencia: ${patient.emergencyPhone}\n`;
    }
    if (patient.allergies) {
      content += `\nAlergias conocidas:\n${patient.allergies}\n`;
    }
    if (patient.medications) {
      content += `\nMedicamentos actuales:\n${patient.medications}\n`;
    }
    content += "\n";

    // Consultations
    content += "HISTORIAL DE CONSULTAS\n";
    content += "=".repeat(80) + "\n\n";

    if (patient.consultations.length === 0) {
      content += "No hay consultas registradas.\n\n";
    } else {
      patient.consultations.forEach((consultation, index) => {
        content += `CONSULTA #${index + 1}\n`;
        content += "-".repeat(80) + "\n";
        content += `Fecha: ${new Date(consultation.date).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}\n`;
        content += `\nResumen:\n${consultation.summary}\n`;

        // Follow-up plan if exists
        if (consultation.FollowUpPlan) {
          const plan = consultation.FollowUpPlan;
          content += `\nPlan de seguimiento: ${plan.active ? "Activo" : "Inactivo"}\n`;
          
          if (plan.CheckIn.length > 0) {
            content += `\nCheck-ins (${plan.CheckIn.length}):\n`;
            plan.CheckIn.forEach((checkIn, ciIndex) => {
              content += `  ${ciIndex + 1}. ${new Date(checkIn.createdAt).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })} - Puntuación de síntomas: ${checkIn.symptomScore}/10\n`;
              if (checkIn.notes) {
                content += `     Notas: ${checkIn.notes}\n`;
              }
              if (checkIn.alert) {
                content += `     ⚠️ ALERTA: ${checkIn.alert.resolved ? "Resuelta" : "Pendiente"}\n`;
              }
            });
          }
        }

        content += "\n" + "=".repeat(80) + "\n\n";
      });
    }

    // Summary
    content += "RESUMEN\n";
    content += "-".repeat(80) + "\n";
    content += `Total de consultas: ${patient.consultations.length}\n`;
    const activePlans = patient.consultations.filter(
      (c) => c.FollowUpPlan?.active
    ).length;
    if (activePlans > 0) {
      content += `Planes de seguimiento activos: ${activePlans}\n`;
    }

    // Return as text file
    const filename = `archivo_medico_${patient.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.txt`;

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Error al generar el archivo" },
      { status: 500 }
    );
  }
}

