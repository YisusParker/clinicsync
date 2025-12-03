"use server";

import { prisma } from "./db";
import { getCurrentDoctor } from "./auth";
import { redirect } from "next/navigation";

// ---------------------------------------------
// CLEAN SAFE STRING
// ---------------------------------------------
function getStr(formData: FormData, key: string): string {
  const val = formData.get(key);
  return typeof val === "string" ? val.trim() : "";
}

// ---------------------------------------------
// GET ALL PATIENTS FOR CURRENT DOCTOR
// ---------------------------------------------
export async function getPatients() {
  const doctor = await getCurrentDoctor();
  if (!doctor) {
    redirect("/");
    return [];
  }

  const patients = await prisma.patient.findMany({
    where: { doctorId: doctor.id },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      bloodType: true,
      allergies: true,
      medications: true,
      emergencyPhone: true,
      _count: {
        select: {
          consultations: true,
        },
      },
    },
  });

  return patients;
}

// ---------------------------------------------
// SEARCH PATIENTS (Smart Search)
// ---------------------------------------------
export async function searchPatients(query: string): Promise<Array<{
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
}>> {
  const doctor = await getCurrentDoctor();
  if (!doctor) {
    return [];
  }

  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.trim().toLowerCase();

  const patients = await prisma.patient.findMany({
    where: {
      doctorId: doctor.id,
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
        { emergencyPhone: { contains: searchTerm, mode: "insensitive" } },
        { bloodType: { contains: searchTerm, mode: "insensitive" } },
      ],
    },
    orderBy: [
      { name: "asc" },
    ],
    take: 10, // Limit results for performance
    select: {
      id: true,
      name: true,
      email: true,
      bloodType: true,
      allergies: true,
      medications: true,
      emergencyPhone: true,
      _count: {
        select: {
          consultations: true,
        },
      },
      consultations: {
        orderBy: { date: "desc" },
        take: 1,
        select: {
          date: true,
          summary: true,
        },
      },
    },
  });

  return patients;
}

// ---------------------------------------------
// GET PATIENT QUICK CONTEXT (for Quick Context Panel)
// ---------------------------------------------
export async function getPatientQuickContext(id: number) {
  const doctor = await getCurrentDoctor();
  if (!doctor) {
    return null;
  }

  const patient = await prisma.patient.findFirst({
    where: {
      id,
      doctorId: doctor.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      bloodType: true,
      allergies: true,
      medications: true,
      emergencyPhone: true,
      consultations: {
        orderBy: { date: "desc" },
        take: 5,
        select: {
          id: true,
          date: true,
          summary: true,
        },
      },
      _count: {
        select: {
          consultations: true,
        },
      },
    },
  });

  if (!patient) {
    return null;
  }

  // Calculate days since last consultation
  const lastConsultation = patient.consultations[0];
  const daysSinceLastConsultation = lastConsultation
    ? Math.floor(
        (new Date().getTime() - new Date(lastConsultation.date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return {
    ...patient,
    daysSinceLastConsultation,
  };
}

// ---------------------------------------------
// GET SINGLE PATIENT
// ---------------------------------------------
export async function getPatient(id: number) {
  const doctor = await getCurrentDoctor();
  if (!doctor) {
    redirect("/");
    return null;
  }

  const patient = await prisma.patient.findFirst({
    where: {
      id,
      doctorId: doctor.id,
    },
    include: {
      consultations: {
        orderBy: { date: "desc" },
        select: {
          id: true,
          date: true,
          summary: true,
          doctor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return patient;
}

// ---------------------------------------------
// CREATE PATIENT
// ---------------------------------------------
export async function createPatient(formData: FormData) {
  try {
    const doctor = await getCurrentDoctor();
    if (!doctor) {
      redirect("/");
      return { error: "No autorizado." };
    }

    const name = getStr(formData, "name");
    const email = getStr(formData, "email");
    const bloodType = getStr(formData, "bloodType");
    const allergies = getStr(formData, "allergies");
    const medications = getStr(formData, "medications");
    const emergencyPhone = getStr(formData, "emergencyPhone");

    if (!name) {
      return { error: "El nombre es obligatorio." };
    }

    const patient = await prisma.patient.create({
      data: {
        name,
        email: email || null,
        bloodType: bloodType || null,
        allergies: allergies || null,
        medications: medications || null,
        emergencyPhone: emergencyPhone || null,
        doctorId: doctor.id,
      },
    });

    redirect(`/patients/${patient.id}`);
  } catch (err: any) {
    // Re-throw redirect errors (they're expected)
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("CREATE PATIENT ERROR:", err);
    return { error: "Error al crear el paciente." };
  }
}

// ---------------------------------------------
// UPDATE PATIENT
// ---------------------------------------------
export async function updatePatient(id: number, formData: FormData) {
  try {
    const doctor = await getCurrentDoctor();
    if (!doctor) {
      redirect("/");
      return { error: "No autorizado." };
    }

    // Verify patient belongs to doctor
    const existing = await prisma.patient.findFirst({
      where: { id, doctorId: doctor.id },
    });

    if (!existing) {
      return { error: "Paciente no encontrado." };
    }

    const name = getStr(formData, "name");
    const email = getStr(formData, "email");
    const bloodType = getStr(formData, "bloodType");
    const allergies = getStr(formData, "allergies");
    const medications = getStr(formData, "medications");
    const emergencyPhone = getStr(formData, "emergencyPhone");

    if (!name) {
      return { error: "El nombre es obligatorio." };
    }

    await prisma.patient.update({
      where: { id },
      data: {
        name,
        email: email || null,
        bloodType: bloodType || null,
        allergies: allergies || null,
        medications: medications || null,
        emergencyPhone: emergencyPhone || null,
      },
    });

    redirect(`/patients/${id}`);
  } catch (err: any) {
    // Re-throw redirect errors (they're expected)
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("UPDATE PATIENT ERROR:", err);
    return { error: "Error al actualizar el paciente." };
  }
}

// ---------------------------------------------
// DELETE PATIENT
// ---------------------------------------------
export async function deletePatient(id: number) {
  try {
    const doctor = await getCurrentDoctor();
    if (!doctor) {
      redirect("/");
      return { error: "No autorizado." };
    }

    // Verify patient belongs to doctor
    const existing = await prisma.patient.findFirst({
      where: { id, doctorId: doctor.id },
    });

    if (!existing) {
      return { error: "Paciente no encontrado." };
    }

    await prisma.patient.delete({
      where: { id },
    });

    redirect("/patients");
  } catch (err: any) {
    // Re-throw redirect errors (they're expected)
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("DELETE PATIENT ERROR:", err);
    return { error: "Error al eliminar el paciente." };
  }
}

// ---------------------------------------------
// GET PATIENT FULL DATA FOR EXPORT
// ---------------------------------------------
export async function getPatientFullData(id: number) {
  const doctor = await getCurrentDoctor();
  if (!doctor) {
    redirect("/");
    return null;
  }

  const patient = await prisma.patient.findFirst({
    where: {
      id,
      doctorId: doctor.id,
    },
    include: {
      consultations: {
        orderBy: { date: "asc" },
        include: {
          doctor: {
            select: {
              name: true,
              email: true,
            },
          },
          FollowUpPlan: {
            include: {
              CheckIn: {
                orderBy: { createdAt: "asc" },
                include: {
                  alert: true,
                },
              },
            },
          },
        },
      },
      doctor: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return patient;
}

// ---------------------------------------------
// IMPORT PATIENT FROM MEDICAL FILE
// ---------------------------------------------
export async function importPatientFromFile(
  fileContent: string,
  consultations: Array<{
    date: string;
    summary: string;
    doctorName?: string;
    doctorEmail?: string;
  }>
): Promise<{ error?: string; patientId?: number }> {
  try {
    const doctor = await getCurrentDoctor();
    if (!doctor) {
      redirect("/");
      return { error: "No autorizado." };
    }

    // Parse patient information from file content
    const lines = fileContent.split("\n");
    let patientName = "";
    let email: string | null = null;
    let bloodType: string | null = null;
    let allergies: string | null = null;
    let medications: string | null = null;
    let emergencyPhone: string | null = null;

    let inPatientSection = false;
    let inAllergiesSection = false;
    let inMedicationsSection = false;
    let allergiesText: string[] = [];
    let medicationsText: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.includes("INFORMACIÓN DEL PACIENTE")) {
        inPatientSection = true;
        continue;
      }

      if (line.includes("HISTORIAL DE CONSULTAS") || line.includes("RESUMEN")) {
        inPatientSection = false;
        inAllergiesSection = false;
        inMedicationsSection = false;
        break;
      }

      if (inPatientSection) {
        if (line.startsWith("Nombre:")) {
          patientName = line.replace("Nombre:", "").trim();
        } else if (line.startsWith("Email:")) {
          email = line.replace("Email:", "").trim() || null;
        } else if (line.startsWith("Tipo de sangre:")) {
          bloodType = line.replace("Tipo de sangre:", "").trim() || null;
        } else if (line.startsWith("Teléfono de emergencia:")) {
          emergencyPhone = line.replace("Teléfono de emergencia:", "").trim() || null;
        } else if (line.includes("Alergias conocidas:")) {
          inAllergiesSection = true;
          inMedicationsSection = false;
          continue;
        } else if (line.includes("Medicamentos actuales:")) {
          inMedicationsSection = true;
          inAllergiesSection = false;
          continue;
        } else if (inAllergiesSection && line) {
          allergiesText.push(line);
        } else if (inMedicationsSection && line) {
          medicationsText.push(line);
        }
      }
    }

    if (!patientName) {
      return { error: "No se pudo extraer el nombre del paciente del archivo." };
    }

    allergies = allergiesText.length > 0 ? allergiesText.join("\n") : null;
    medications = medicationsText.length > 0 ? medicationsText.join("\n") : null;

    // Create patient
    const patient = await prisma.patient.create({
      data: {
        name: patientName,
        email: email || null,
        bloodType: bloodType || null,
        allergies: allergies || null,
        medications: medications || null,
        emergencyPhone: emergencyPhone || null,
        doctorId: doctor.id,
      },
    });

    // Import consultations if provided
    if (consultations && consultations.length > 0) {
      for (const consultation of consultations) {
        try {
          const consultationDate = new Date(consultation.date);
          if (!isNaN(consultationDate.getTime()) && consultation.summary) {
            // Try to find the original doctor by email, otherwise use current doctor
            let consultationDoctorId = doctor.id;
            
            if (consultation.doctorEmail) {
              const originalDoctor = await prisma.doctor.findUnique({
                where: { email: consultation.doctorEmail },
                select: { id: true },
              });
              
              if (originalDoctor) {
                consultationDoctorId = originalDoctor.id;
              }
            }
            
            await prisma.consultation.create({
              data: {
                patientId: patient.id,
                doctorId: consultationDoctorId,
                summary: consultation.summary,
                date: consultationDate,
              },
            });
          }
        } catch (err) {
          console.error("Error importing consultation:", err);
          // Continue with other consultations
        }
      }
    }

    return { patientId: patient.id };
  } catch (err: any) {
    console.error("IMPORT PATIENT ERROR:", err);
    return { error: "Error al importar el paciente. Verifica el formato del archivo." };
  }
}

