// app/layout.tsx
import type { Metadata } from "next";
import "./styles/globals.css";

export const metadata: Metadata = {
  title: "ClinicSync",
  description: "MVP para gestión clínica simple y rápida",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
