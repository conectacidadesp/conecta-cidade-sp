"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [tab, setTab] = useState<"advertiser" | "store">("advertiser");
  
  // Estados para Login de Anunciante (Celular)
  const [advertiserForm, setAdvertiserForm] = useState({ phone: "", password: "" });
  
  // Estados para Login de Loja (E-mail)
  const [storeForm, setStoreForm] = useState({ email: "", password: "" });
  
  const [loading, setLoading] = useState(false);

  // Função de Login do Anunciante
  async function handleAdvertiserLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const fakeEmail = `${advertiserForm.phone.replace(/\D/g, "")}@anunciante.com`;

    const { error } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password: advertiserForm.password,
    });

    if (error) {
      alert("Erro ao entrar: " + error.message);
    } else {
      window.location.href = "/";
    }
    setLoading(false);
  }

  // Função de Login da Loja
  async function handleStoreLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: storeForm.email,
      password: storeForm.password,
    });

    if (error) {
      alert("Erro ao entrar: " + error.message);
    } else {
      window.location.href = "/";
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ 
        background: "#ffffff", 
        padding: "40px", 
        borderRadius: "12px", 
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)", 
        width: "100%", 
        maxWidth: "460px",
        border: "1px solid #eaeaea"
      }}>
        
        {/* Título Principal */}
        <h1 style={{ fontSize: "22px", fontWeight: "bold", textAlign: "center", color: "#0A2540", marginBottom: "24px" }}>
          Acessar o Conecta Cidade
        </h1>

        {/* Chave Seletora de Abas Padronizada */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px", background: "#f8f9fa", padding: "4px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <button
            type="button"
            onClick={() => setTab("advertiser")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "6px",
              border: "none",
              background: tab === "advertiser" ? "#ffffff" : "transparent",
              color: tab === "advertiser" ? "#0A2540" : "#64748b",
              fontWeight: tab === "advertiser" ? "bold" : "normal",
              boxShadow: tab === "advertiser" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            📱 Anunciante
          </button>

          <button
            type="button"
            onClick={() => setTab("store")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "6px",
              border: "none",
              background: tab === "store" ? "#ffffff" : "transparent",
              color: tab === "store" ? "#0A2540" : "#64748b",
              fontWeight: tab === "store" ? "bold" : "normal",
              boxShadow: tab === "store" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            🏢 Entrar como Loja
          </button>
        </div>

        {/* Formulário Condicional */}
        {tab === "advertiser" ? (
          /* Login de Anunciante (Celular e Senha) */
          <form onSubmit={handleAdvertiserLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                Número do Celular (com DDD)
              </label>
              <input 
                style={{ width: "100%", padding: "11px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#000", fontSize: "14px", outline: "none" }} 
                placeholder="Ex: 18912345678" 
                required 
                onChange={(e) => setAdvertiserForm({ ...advertiserForm, phone: e.target.value })} 
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                Senha
              </label>
              <input 
                style={{ width: "100%", padding: "11px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#000", fontSize: "14px", outline: "none" }} 
                type="password" 
                placeholder="Sua senha de acesso" 
                required 
                onChange={(e) => setAdvertiserForm({ ...advertiserForm, password: e.target.value })} 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              style={{ 
                marginTop: "8px",
                padding: "12px", 
                backgroundColor: "#0A2540", 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                cursor: "pointer", 
                fontWeight: "bold",
                fontSize: "15px",
                transition: "background 0.2s"
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        ) : (
          /* Login de Loja (E-mail e Senha) */
          <form onSubmit={handleStoreLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                E-mail da Loja
              </label>
              <input 
                style={{ width: "100%", padding: "11px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#000", fontSize: "14px", outline: "none" }} 
                type="email" 
                placeholder="exemplo@loja.com" 
                required 
                onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })} 
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                Senha
              </label>
              <input 
                style={{ width: "100%", padding: "11px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#000", fontSize: "14px", outline: "none" }} 
                type="password" 
                placeholder="Sua senha" 
                required 
                onChange={(e) => setStoreForm({ ...storeForm, password: e.target.value })} 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              style={{ 
                marginTop: "8px",
                padding: "12px", 
                backgroundColor: "#0A2540", 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                cursor: "pointer", 
                fontWeight: "bold",
                fontSize: "15px",
                transition: "background 0.2s"
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        )}

        {/* Rodapé do Card com Link para Cadastro */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <a href="/register" style={{ color: "#0070f3", fontSize: "14px", textDecoration: "none" }}>
            Ainda não tem conta? Cadastre-se aqui
          </a>
        </div>

      </div>
    </div>
  );
}