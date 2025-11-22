import { loginDoctor, registerDoctor } from "@/lib/auth";
import AuthCard from "./authcard";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <AuthCard loginAction={loginDoctor} registerAction={registerDoctor} />
    </div>
  );
}
