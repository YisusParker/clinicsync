"use server";

import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "clinicsync_doctor";

// ---------------------------------------------
// CLEAN SAFE STRING
// ---------------------------------------------
function getStr(formData: FormData, key: string): string {
  const val = formData.get(key);
  return typeof val === "string" ? val.trim() : "";
}

// ---------------------------------------------
// REGISTER
// ---------------------------------------------
export async function registerDoctor(formData: FormData) {
  try {
    const name = getStr(formData, "name");
    const email = getStr(formData, "email").toLowerCase();
    const password = getStr(formData, "password");
    const confirm = getStr(formData, "confirm");

    if (!name || !email || !password) {
      return { error: "Nombre, email y contraseña son obligatorios." };
    }

    if (password.length < 6) {
      return { error: "La contraseña debe tener al menos 6 caracteres." };
    }

    if (password !== confirm) {
      return { error: "Las contraseñas no coinciden." };
    }

    const existing = await prisma.doctor.findUnique({
      where: { email },
    });

    if (existing) {
      return { error: "Ya existe un doctor con este email." };
    }

    const hashed = await bcrypt.hash(password, 10);

    const doctor = await prisma.doctor.create({
      data: { name, email, password: hashed },
    });

    const cookieStore = await cookies();
    // In production (Vercel), always use secure cookies
    const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
    cookieStore.set(SESSION_COOKIE, String(doctor.id), {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    redirect("/dashboard");
  } catch (err: any) {
    // Re-throw redirect errors (they're expected)
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("REGISTER ERROR:", err);
    
    // Detectar errores de conexión a la base de datos
    if (err?.code === "P1001" || err?.message?.includes("Can't reach database server")) {
      console.error("Database connection error - DATABASE_URL may not be configured correctly in Vercel");
      return { 
        error: "Error de conexión a la base de datos. Por favor, verifica la configuración del servidor." 
      };
    }
    
    return { error: "Error interno del servidor. Por favor, intenta de nuevo." };
  }
}

// ---------------------------------------------
// LOGIN
// ---------------------------------------------
export async function loginDoctor(formData: FormData) {
  try {
    const email = getStr(formData, "email").toLowerCase();
    const password = getStr(formData, "password");

    if (!email || !password) {
      return { error: "Email y contraseña son obligatorios." };
    }

    const doctor = await prisma.doctor.findUnique({ where: { email } });

    if (!doctor) {
      return { error: "No existe una cuenta registrada con este correo electrónico." };
    }

    const valid = await bcrypt.compare(password, doctor.password);
    if (!valid) {
      return { error: "Contraseña incorrecta." };
    }

    const cookieStore = await cookies();
    // In production (Vercel), always use secure cookies
    const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
    cookieStore.set(SESSION_COOKIE, String(doctor.id), {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    redirect("/dashboard");
  } catch (err: any) {
    // Re-throw redirect errors (they're expected)
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("LOGIN ERROR:", err);
    
    // Detectar errores de conexión a la base de datos
    if (err?.code === "P1001" || err?.message?.includes("Can't reach database server")) {
      console.error("Database connection error - DATABASE_URL may not be configured correctly in Vercel");
      return { 
        error: "Error de conexión a la base de datos. Por favor, verifica la configuración del servidor." 
      };
    }
    
    return { error: "Error interno del servidor. Por favor, intenta de nuevo." };
  }
}

// ---------------------------------------------
// LOGOUT
// ---------------------------------------------
export async function logoutDoctor() {
  const cookieStore = await cookies();
  // In production (Vercel), always use secure cookies
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  redirect("/");
}

// ---------------------------------------------
// CURRENT DOCTOR
// ---------------------------------------------
export async function getCurrentDoctor() {
  const cookieStore = await cookies();
  const rawId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!rawId) return null;

  const doctor = await prisma.doctor.findUnique({
    where: { id: Number(rawId) },
    select: { id: true, name: true, email: true },
  });

  return doctor;
}
