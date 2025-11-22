// app/(platform)/layout.tsx
import React, { ReactNode } from "react";
import { getCurrentDoctor, logoutDoctor } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PlatformLayout({
  children,
}: {
  children: ReactNode;
}) {
  const doctor = await getCurrentDoctor();

  if (!doctor) {
    redirect("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white px-4 py-6 flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">ClinicSync</h1>
          <p className="text-xs text-slate-500 mt-1">
            Sesión de {doctor.name}
          </p>
        </div>

        <nav className="flex flex-col gap-1 text-sm">
          <a
            href="/dashboard"
            className="px-3 py-2 rounded-lg hover:bg-slate-100 transition"
          >
            Panel general
          </a>
          <a
            href="/patients"
            className="px-3 py-2 rounded-lg hover:bg-slate-100 transition"
          >
            Pacientes
          </a>
          <a
            href="/consultations/new"
            className="px-3 py-2 rounded-lg hover:bg-slate-100 transition"
          >
            Nueva consulta
          </a>
        </nav>

        <form action={logoutDoctor} className="mt-auto">
          <button
            type="submit"
            className="w-full text-xs text-slate-600 border border-slate-200 rounded-lg py-2 hover:bg-slate-50"
          >
            Cerrar sesión
          </button>
        </form>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
