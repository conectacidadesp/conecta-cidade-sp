"use client";

export default function AboutPage() {
  return (
    <main style={{ padding: "40px 20px", maxWidth: 600, margin: "0 auto", fontFamily: "sans-serif", backgroundColor: "#F8FAFC", minHeight: "100vh", borderRadius: 12, marginTop: 20 }}>
      <button 
        onClick={() => window.location.href = "/"}
        style={{ marginBottom: 20, background: "none", border: "none", color: "#0F4C81", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 14 }}
      >
        {"<"} Voltar para o Início
      </button>

      <div style={{ border: "1px solid #E2E8F0", padding: 30, borderRadius: 12, backgroundColor: "#fff", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
        <h1 style={{ fontSize: 26, marginBottom: 15, fontWeight: "bold", color: "#0F4C81" }}>Sobre o Conecta Cidade</h1>
        <p style={{ color: "#334155", fontSize: 16, lineHeight: "1.6", marginBottom: 15 }}>
          O **Conecta Cidade** é uma plataforma de classificados locais desenvolvida para aproximar os comerciantes, prestadores de serviços e clientes das cidades de Rubiácea-SP e Guararapes-SP.
        </p>
        <p style={{ color: "#334155", fontSize: 16, lineHeight: "1.6" }}>
          Nosso objetivo é fortalecer o comércio local, oferecendo um espaço simples, rápido e eficiente para a divulgação de produtos, serviços, empregos e eventos da nossa região.
        </p>
      </div>
    </main>
  );
}