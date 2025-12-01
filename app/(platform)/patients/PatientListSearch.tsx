"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { searchPatientsAction } from "../consultations/new/search-actions";

interface Patient {
  id: number;
  name: string;
  email: string | null;
  bloodType: string | null;
  allergies: string | null;
  medications: string | null;
  emergencyPhone: string | null;
  _count: {
    consultations: number;
  };
}

interface PatientListSearchProps {
  initialPatients: Patient[];
  onPatientsChange: (patients: Patient[]) => void;
}

export default function PatientListSearch({
  initialPatients,
  onPatientsChange,
}: PatientListSearchProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      onPatientsChange(initialPatients);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchPatientsAction(query);
        onPatientsChange(results);
      } catch (error) {
        console.error("Search error:", error);
        onPatientsChange([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, initialPatients, onPatientsChange]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar pacientes por nombre, email, teléfono..."
        className="w-full max-w-md pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A6CBD] focus:border-transparent"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded transition"
        >
          <X size={16} className="text-slate-400" />
        </button>
      )}
      {isSearching && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-[#0A6CBD] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

