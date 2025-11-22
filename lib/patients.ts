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
        take: 10,
        select: {
          id: true,
          date: true,
          summary: true,
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

