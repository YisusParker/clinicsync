"use server";

import { loginDoctor, registerDoctor } from "@/lib/auth";

// Wrappers to match Next.js form action type signature
export async function loginAction(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  try {
    const result = await loginDoctor(formData);
    // If we get here, there was no redirect, so return the result (which may contain an error)
    return result || {};
  } catch (err: any) {
    // Re-throw redirect errors (they're expected and handled by Next.js)
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    // Log unexpected errors for debugging
    console.error("Login action error:", err);
    return { error: "Error interno del servidor. Por favor, intenta de nuevo." };
  }
}

export async function registerAction(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  try {
    const result = await registerDoctor(formData);
    // If we get here, there was no redirect, so return the result (which may contain an error)
    return result || {};
  } catch (err: any) {
    // Re-throw redirect errors (they're expected and handled by Next.js)
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    // Log unexpected errors for debugging
    console.error("Register action error:", err);
    return { error: "Error interno del servidor. Por favor, intenta de nuevo." };
  }
}

