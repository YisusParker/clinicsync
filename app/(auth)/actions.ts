"use server";

import { loginDoctor, registerDoctor } from "@/lib/auth";

// Wrappers to match Next.js form action type signature
export async function loginAction(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  try {
    const result = await loginDoctor(formData);
    return result || {};
  } catch (err: any) {
    // Re-throw redirect errors (they're expected)
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    return { error: "Error interno del servidor." };
  }
}

export async function registerAction(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  try {
    const result = await registerDoctor(formData);
    return result || {};
  } catch (err: any) {
    // Re-throw redirect errors (they're expected)
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    return { error: "Error interno del servidor." };
  }
}

