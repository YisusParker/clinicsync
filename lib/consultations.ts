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
// GET ALL CONSULTATIONS FOR CURRENT DOCTOR
// ---------------------------------------------
export async function getConsultations() {
  const doctor = await getCurrentDoctor();
  if (!doctor) {
    redirect("/");
    return [];
  }

  const consultations = await prisma.consultation.findMany({
    where: { doctorId: doctor.id },
    orderBy: { date: "desc" },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return consultations;
}

// ---------------------------------------------
// GET RECENT CONSULTATIONS
// ---------------------------------------------
export async function getRecentConsultations(limit: number = 5) {
  const doctor = await getCurrentDoctor();
  if (!doctor) {
    return [];
  }

  const consultations = await prisma.consultation.findMany({
    where: { doctorId: doctor.id },
    orderBy: { date: "desc" },
    take: limit,
    include: {
      patient: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return consultations;
}

// ---------------------------------------------
// GET SINGLE CONSULTATION
// ---------------------------------------------
export async function getConsultation(id: number) {
  const doctor = await getCurrentDoctor();
  if (!doctor) {
    redirect("/");
    return null;
  }

  // Find consultation and check if patient belongs to current doctor
  // This allows viewing consultations from other doctors if the patient belongs to current doctor
  const consultation = await prisma.consultation.findFirst({
    where: {
      id,
      patient: {
        doctorId: doctor.id, // Patient must belong to current doctor
      },
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          email: true,
          bloodType: true,
          allergies: true,
          medications: true,
        },
      },
      doctor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return consultation;
}

// ---------------------------------------------
// CREATE CONSULTATION
// ---------------------------------------------
export async function createConsultation(formData: FormData) {
  try {
    const doctor = await getCurrentDoctor();
    if (!doctor) {
      redirect("/");
      return { error: "No autorizado." };
    }

    const patientId = getStr(formData, "patientId");
    const summary = getStr(formData, "summary");
    const dateStr = getStr(formData, "date");

    if (!patientId || !summary) {
      return { error: "Paciente y resumen son obligatorios." };
    }

    // Verify patient belongs to doctor
    const patient = await prisma.patient.findFirst({
      where: {
        id: Number(patientId),
        doctorId: doctor.id,
      },
    });

    if (!patient) {
      return { error: "Paciente no encontrado." };
    }

    const date = dateStr ? new Date(dateStr) : new Date();

    const consultation = await prisma.consultation.create({
      data: {
        patientId: Number(patientId),
        doctorId: doctor.id,
        summary,
        date,
      },
    });

    redirect(`/consultations/${consultation.id}`);
  } catch (err: any) {
    // Re-throw redirect errors (they're expected)
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("CREATE CONSULTATION ERROR:", err);
    return { error: "Error al crear la consulta." };
  }
}

// ---------------------------------------------
// UPDATE CONSULTATION
// ---------------------------------------------
export async function updateConsultation(id: number, formData: FormData) {
  try {
    const doctor = await getCurrentDoctor();
    if (!doctor) {
      redirect("/");
      return { error: "No autorizado." };
    }

    // Verify consultation belongs to doctor
    const existing = await prisma.consultation.findFirst({
      where: { id, doctorId: doctor.id },
    });

    if (!existing) {
      return { error: "Consulta no encontrada." };
    }

    const summary = getStr(formData, "summary");
    const dateStr = getStr(formData, "date");

    if (!summary) {
      return { error: "El resumen es obligatorio." };
    }

    const date = dateStr ? new Date(dateStr) : existing.date;

    await prisma.consultation.update({
      where: { id },
      data: {
        summary,
        date,
      },
    });

    redirect(`/consultations/${id}`);
  } catch (err: any) {
    // Re-throw redirect errors (they're expected)
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("UPDATE CONSULTATION ERROR:", err);
    return { error: "Error al actualizar la consulta." };
  }
}

// ---------------------------------------------
// DELETE CONSULTATION
// ---------------------------------------------
export async function deleteConsultation(id: number) {
  try {
    const doctor = await getCurrentDoctor();
    if (!doctor) {
      redirect("/");
      return { error: "No autorizado." };
    }

    // Verify consultation belongs to doctor
    const existing = await prisma.consultation.findFirst({
      where: { id, doctorId: doctor.id },
    });

    if (!existing) {
      return { error: "Consulta no encontrada." };
    }

    await prisma.consultation.delete({
      where: { id },
    });

    redirect("/consultations");
  } catch (err: any) {
    // Re-throw redirect errors (they're expected)
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("DELETE CONSULTATION ERROR:", err);
    return { error: "Error al eliminar la consulta." };
  }
}

// ---------------------------------------------
// GET DASHBOARD STATS
// ---------------------------------------------
export async function getDashboardStats() {
  const doctor = await getCurrentDoctor();
  if (!doctor) {
    return null;
  }

  const [patientCount, consultationCount, recentConsultations, activePlans] =
    await Promise.all([
      prisma.patient.count({
        where: { doctorId: doctor.id },
      }),
      prisma.consultation.count({
        where: { doctorId: doctor.id },
      }),
      prisma.consultation.findMany({
        where: { doctorId: doctor.id },
        orderBy: { date: "desc" },
        take: 5,
        include: {
          patient: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.followUpPlan.count({
        where: {
          active: true,
          Consultation: {
            doctorId: doctor.id,
          },
        },
      }),
    ]);

  return {
    patientCount,
    consultationCount,
    recentConsultations,
    activePlans,
  };
}

