"use client";

import { useState } from "react";

const CITIES = [
  { name: "Rubiácea-SP", icon: "📍" },
  { name: "Guararapes-SP", icon: "📍" },
];

export default function WelcomePage() {
  const [selectedCity, setSelectedCity] = useState("Rubiácea-SP");

  const handleEnter = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedCity", selectedCity);
      window.location.href = "/";
    }
  };

  return (
    <main style={{
      width: "100vw",
      height: "100vh",
      backgroundColor: "#0F4C81",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "sans-serif",
      color: "#fff",
      padding: 20,
      boxSizing: "border-box",
      overflow: "hidden"
    }}>
      <style>{`
        @keyframes zoomInFade {
          0% { transform: scale(0.4); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes fadeInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .animated-logo {
          animation: zoomInFade 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .animated-content {
          animation: fadeInUp 0.8s ease 0.4s forwards;
          opacity: 0;
        }
      `}</style>

      {/* Logo com animação dinâmica */}
      <div style={{
        width: 130,
        height: 130,
        borderRadius: "50%",
        backgroundColor: "#fff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 25,
        padding: 5
      }} className="animated-logo">
        <img
          src="https://ahiyxrdplhecskzoiogd.supabase.co/storage/v1/object/public/site-assets/Logo%20redonda.png"
          alt="Conecta Cidade SP"
          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
        />
      </div>

      <div style={{ textAlign: "center", maxWidth: 450, width: "100%" }} className="animated-content">
        <h1 style={{ fontSize: 26, margin: "0 0 8px", fontWeight: "bold" }}>
          Conecta Cidade SP
        </h1>
        <p style={{ fontSize: 14, color: "#CBD5E1", margin: "0 0 30px", lineHeight: "1.5" }}>
          O portal completo de comércios, produtos e serviços da sua cidade. Selecione abaixo para começar:
        </p>

        <div style={{ marginBottom: 25, textAlign: "left" }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 8, color: "#E2E8F0" }}>
            Escolha sua Cidade:
          </label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {CITIES.map((city) => (
              <button
                key={city.name}
                type="button"
                onClick={() => setSelectedCity(city.name)}
                style={{
                  flex: 1,
                  minWidth: 140,
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: selectedCity === city.name ? "2px solid #F97316" : "2px solid rgba(255,255,255,0.2)",
                  backgroundColor: selectedCity === city.name ? "#F97316" : "rgba(255,255,255,0.08)",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {city.icon} {city.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleEnter}
          style={{
            width: "100%",
            padding: "14px",
            backgroundColor: "#22C55E",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 16,
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(34, 197, 94, 0.4)",
            transition: "transform 0.1s ease"
          }}
        >
          Entrar na Cidade 🚀
        </button>
      </div>
    </main>
  );
}