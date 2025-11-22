import { loginDoctor, registerDoctor } from "@/lib/auth";
import AuthCard from "./authcard";

// Wrappers to match Next.js form action type signature
async function loginAction(formData: FormData): Promise<void> {
  await loginDoctor(formData);
}

async function registerAction(formData: FormData): Promise<void> {
  await registerDoctor(formData);
}

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <AuthCard loginAction={loginAction} registerAction={registerAction} />
    </div>
  );
}
