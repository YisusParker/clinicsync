"use server";

import { loginDoctor, registerDoctor } from "@/lib/auth";

// Wrappers to match Next.js form action type signature
export async function loginAction(formData: FormData): Promise<void> {
  await loginDoctor(formData);
}

export async function registerAction(formData: FormData): Promise<void> {
  await registerDoctor(formData);
}

