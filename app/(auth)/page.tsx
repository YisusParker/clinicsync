import AuthCard from "./authcard";
import { loginAction, registerAction } from "./actions";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <AuthCard loginAction={loginAction} registerAction={registerAction} />
    </div>
  );
}
