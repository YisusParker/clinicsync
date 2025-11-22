"use client";

import { useState, useActionState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

interface AuthCardProps {
  loginAction: (prevState: { error?: string } | null, formData: FormData) => Promise<{ error?: string }>;
  registerAction: (prevState: { error?: string } | null, formData: FormData) => Promise<{ error?: string }>;
}

export default function AuthCard({ loginAction, registerAction }: AuthCardProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);
  
  const [loginState, loginFormAction] = useActionState(loginAction, null);
  const [registerState, registerFormAction] = useActionState(registerAction, null);

  return (
    <motion.div
      className="
        w-full max-w-md backdrop-blur-2xl bg-white/20 shadow-2xl 
        border border-white/30 rounded-3xl px-10 py-12 space-y-10
        relative
      "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center space-y-3">
        <Image
          src="/logo.png"
          alt="ClinicSync logo"
          width={70}
          height={70}
          className="opacity-90 drop-shadow-md"
        />

        {/* Título con colores del logo */}
        <h1 className="text-3xl font-extrabold tracking-tight">
          <span className="text-[#0A6CBD]">Clinic</span>
          <span className="text-[#29B86F]">Sync</span>
        </h1>
      </div>

      {/* Login / Register Forms */}
      <AnimatePresence mode="wait">
        {!isRegistering ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
            <h2 className="text-sm font-medium text-slate-700">Iniciar sesión</h2>
            <form action={loginFormAction} className="space-y-4">
              {loginState?.error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
                >
                  <AlertCircle size={16} />
                  <span>{loginState.error}</span>
                </motion.div>
              )}
              <input
                name="email"
                type="email"
                placeholder="doctor@clinica.com"
                className="input-field"
              />
              <div className="relative">
                <input
                  name="password"
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 transition"
                >
                  {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button type="submit" className="btn-primary">Entrar</button>

              <button
                type="button"
                onClick={() => {
                  setIsRegistering(true);
                  // Reset login state when switching
                }}
                className="btn-secondary"
              >
                Crear cuenta nueva
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
            <h2 className="text-sm font-medium text-slate-700">Crear nuevo doctor</h2>

            <form action={registerFormAction} className="space-y-4">
              {registerState?.error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
                >
                  <AlertCircle size={16} />
                  <span>{registerState.error}</span>
                </motion.div>
              )}
              <input
                name="name"
                placeholder="Dr. Juan Pérez"
                className="input-field"
                required
              />

              <input
                name="email"
                type="email"
                placeholder="correo@clinica.com"
                className="input-field"
                required
              />

              <div className="relative">
                <input
                  name="password"
                  type={showRegisterPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 transition"
                >
                  {showRegisterPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative">
                <input
                  name="confirm"
                  type={showRegisterConfirm ? "text" : "password"}
                  placeholder="Repetir contraseña"
                  className="input-field pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterConfirm(!showRegisterConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 transition"
                >
                  {showRegisterConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button type="submit" className="btn-primary">Registrar y entrar</button>

              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  // Reset register state when switching
                }}
                className="btn-secondary"
              >
                Ya tengo cuenta
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
