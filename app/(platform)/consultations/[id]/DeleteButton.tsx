"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteConsultationAction } from "./actions";

export default function DeleteConsultationButton({ consultationId }: { consultationId: number }) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", String(consultationId));
      await deleteConsultationAction(formData);
    });
  };

  if (showConfirm) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-red-600 font-medium">¿Eliminar esta consulta?</p>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl text-sm font-medium transition"
          >
            {isPending ? "Eliminando..." : "Sí, eliminar"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
            className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-medium transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleDelete}
      className="w-full px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
    >
      <Trash2 size={16} />
      Eliminar consulta
    </button>
  );
}

