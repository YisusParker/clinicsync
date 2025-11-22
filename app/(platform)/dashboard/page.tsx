// app/(platform)/dashboard/page.tsx
import {
  Users,
  Activity,
  CalendarDays,
  Stethoscope,
} from "lucide-react";
import { getDashboardStats } from "@/lib/consultations";
import Link from "next/link";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">
          Panel general
        </h1>
        <p className="text-slate-500 mt-1">
          Bienvenido doctor. Aquí tienes una vista rápida de tu actividad.
        </p>
      </header>

      {/* GRID DE ESTADÍSTICAS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Pacientes activos"
          value={stats.patientCount}
          icon={<Users className="w-7 h-7 text-[#0A6CBD]" />}
        />
        <DashboardCard
          title="Consultas registradas"
          value={stats.consultationCount}
          icon={<Stethoscope className="w-7 h-7 text-[#29B86F]" />}
        />
        <DashboardCard
          title="Planes activos"
          value={stats.activePlans}
          icon={<Activity className="w-7 h-7 text-purple-600" />}
        />
        <DashboardCard
          title="Consultas recientes"
          value={stats.recentConsultations.length}
          icon={<CalendarDays className="w-7 h-7 text-orange-600" />}
        />
      </section>

      {/* CONSULTAS RECIENTES */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Consultas recientes</h2>
          <Link
            href="/consultations/new"
            className="text-sm text-[#0A6CBD] hover:text-[#095a9d] font-medium"
          >
            Nueva consulta
          </Link>
        </div>

        {stats.recentConsultations.length === 0 ? (
          <div className="text-center py-8">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-4">
              No hay consultas registradas
            </p>
            <Link
              href="/consultations/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#29B86F] hover:bg-[#238f5a] text-white rounded-xl text-sm font-medium transition"
            >
              Crear primera consulta
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.recentConsultations.map((c) => (
              <Link
                key={c.id}
                href={`/consultations/${c.id}`}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 hover:border-[#0A6CBD]/30 transition group"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-800 group-hover:text-[#0A6CBD] transition">
                    {c.patient.name}
                  </p>
                  <p className="text-sm text-slate-500 line-clamp-1">{c.summary}</p>
                </div>
                <span className="text-sm text-slate-600 ml-4">
                  {new Date(c.date).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">{icon}</div>
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-semibold text-slate-800 mt-1">{value}</p>
      </div>
    </div>
  );
}
