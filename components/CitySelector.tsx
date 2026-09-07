"use client";

import { useState } from "react";

export default function CitySelector({ onSelect }: { onSelect: (city: string) => void }) {
  const [selected, setSelected] = useState("");

  function handleSelect(city: string) {
    setSelected(city);
    localStorage.setItem("city", city);
    onSelect(city);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100 max-w-md w-full text-center">
        <span className="text-4xl">🌍</span>
        <h2 className="text-2xl font-extrabold text-slate-900 mt-4 mb-2 tracking-tight">
          Escolha sua cidade
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Selecione uma região para acessar os classificados e conexões locais.
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => handleSelect("Rubiácea - SP")} 
            className="w-full py-3 px-4 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 hover:border-blue-300 rounded-xl font-medium text-slate-700 text-left transition-all flex items-center gap-2"
          >
            <span>📍</span> Rubiácea - SP
          </button>

          <button 
            onClick={() => handleSelect("Guararapes - SP")} 
            className="w-full py-3 px-4 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 hover:border-blue-300 rounded-xl font-medium text-slate-700 text-left transition-all flex items-center gap-2"
          >
            <span>📍</span> Guararapes - SP
          </button>
        </div>
      </div>
    </div>
  );
}