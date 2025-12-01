"use client";

import { useState, useEffect, useRef } from "react";
import { Search, User, Mail, Phone, Droplet, AlertTriangle } from "lucide-react";
import { searchPatientsAction } from "./search-actions";

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
  consultations: Array<{
    date: Date;
    summary: string;
  }>;
}

interface PatientSearchProps {
  onSelectPatient: (patientId: number) => void;
  selectedPatientId?: string | null;
  patients: Patient[];
}

export default function PatientSearch({
  onSelectPatient,
  selectedPatientId,
  patients: initialPatients,
}: PatientSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search with debounce
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const searchResults = await searchPatientsAction(query);
        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (patient: Patient) => {
    onSelectPatient(patient.id);
    setQuery(patient.name);
    setShowResults(false);
  };

  // Show initial patients if query is empty
  const displayResults = query.trim().length < 2 ? [] : results;
  const hasResults = displayResults.length > 0;
  const selectedPatient = initialPatients.find(
    (p) => p.id.toString() === selectedPatientId
  );

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
          placeholder="Buscar por nombre, email, teléfono o tipo de sangre..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A6CBD] focus:border-transparent"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[#0A6CBD] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && hasResults && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-slate-200 max-h-96 overflow-y-auto">
          {displayResults.map((patient) => (
            <button
              key={patient.id}
              type="button"
              onClick={() => handleSelect(patient)}
              className="w-full px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User size={16} className="text-[#0A6CBD] flex-shrink-0" />
                    <p className="font-medium text-slate-800 truncate">
                      {patient.name}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    {patient.email && (
                      <div className="flex items-center gap-1">
                        <Mail size={12} />
                        <span className="truncate max-w-[150px]">
                          {patient.email}
                        </span>
                      </div>
                    )}
                    {patient.emergencyPhone && (
                      <div className="flex items-center gap-1">
                        <Phone size={12} />
                        <span>{patient.emergencyPhone}</span>
                      </div>
                    )}
                    {patient.bloodType && (
                      <div className="flex items-center gap-1">
                        <Droplet size={12} className="text-red-500" />
                        <span>{patient.bloodType}</span>
                      </div>
                    )}
                  </div>
                  {patient.allergies && (
                    <div className="flex items-start gap-1 mt-2">
                      <AlertTriangle
                        size={12}
                        className="text-amber-500 mt-0.5 flex-shrink-0"
                      />
                      <p className="text-xs text-amber-700 line-clamp-1">
                        Alergias: {patient.allergies}
                      </p>
                    </div>
                  )}
                  {patient.consultations.length > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      {patient._count.consultations} consultas • Última:{" "}
                      {new Date(
                        patient.consultations[0].date
                      ).toLocaleDateString("es-ES", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Selected Patient Display */}
      {selectedPatient && query === selectedPatient.name && (
        <div className="mt-2 p-3 bg-[#0A6CBD]/5 border border-[#0A6CBD]/20 rounded-xl">
          <p className="text-sm font-medium text-[#0A6CBD]">
            ✓ {selectedPatient.name} seleccionado
          </p>
        </div>
      )}
    </div>
  );
}

