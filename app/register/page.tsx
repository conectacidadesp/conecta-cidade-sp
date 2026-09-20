"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Register() {
  const [tab, setTab] = useState<"advertiser" | "store">("advertiser");
  
  // Estados para Loja
  const [storeForm, setStoreForm] = useState({ name: "", email: "", password: "", whatsapp: "" });
  
  // Estados para Anunciante
  const [advertiserForm, setAdvertiserForm] = useState({ phone: "", password: "" });
  
  const [loading, setLoading] = useState(false);

  // Cadastro de Loja
  async function handleStoreRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email: storeForm.email,
      password: storeForm.password,
    });

    if (authError) {
      alert("Erro ao criar conta: " + authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const savedCity = localStorage.getItem("selectedCity") || "Não informada";
      
      const { error: profileError } = await supabase.from("profiles").insert([
        { 
          id: data.user.id, 
          name: storeForm.name,
          store_name: storeForm.name,
          whatsapp: storeForm.whatsapp, 
          city: savedCity 
        }
      ]);

      if (profileError) {
        alert("Conta criada, mas houve um erro ao salvar o perfil: " + profileError.message);
      } else {
        alert("Conta e perfil criados com sucesso!");
        window.location.href = "/login";
      }
    }
    setLoading(false);
  }

  // Cadastro de Anunciante
  async function handleAdvertiserRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const fakeEmail = `${advertiserForm.phone.replace(/\D/g, "")}@anunciante.com`;

    const { data, error: authError } = await supabase.auth.signUp({
      email: fakeEmail,
      password: advertiserForm.password,
    });

    if (authError) {
      alert("Erro ao criar conta: " + authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const savedCity = localStorage.getItem("selectedCity") || "Não informada";
      
      const { error: profileError } = await supabase.from("profiles").insert([
        { 
          id: data.user.id, 
          name: `Anunciante ${advertiserForm.phone}`,
          store_name: `Anunciante ${advertiserForm.phone}`,
          whatsapp: advertiserForm.phone, 
          city: savedCity 
        }
      ]);

      if (profileError) {
        alert("Conta criada, mas houve um erro ao salvar o perfil: " + profileError.message);
      } else {
        alert("Conta de anunciante criada com sucesso!");
        window.location.href = "/login";
      }
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
          Criar Nova Conta
        </h1>

        {/* Chave Seletora de Abas Simplificada */}
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
            🏢 Cadastrar Loja
          </button>
        </div>

        {/* Formulário Condicional */}
        {tab === "advertiser" ? (
          /* Formulário de Anunciante (Celular e Senha) */
          <form onSubmit={handleAdvertiserRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
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
              {loading ? "Cadastrando..." : "Cadastrar Conta"}
            </button>
          </form>
        ) : (
          /* Formulário de Loja */
          <form onSubmit={handleStoreRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                Nome da Loja ou Responsável
              </label>
              <input 
                style={{ width: "100%", padding: "11px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#000", fontSize: "14px", outline: "none" }} 
                placeholder="Ex: Minha Loja" 
                required 
                onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })} 
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                E-mail de Acesso
              </label>
              <input 
                style={{ width: "100%", padding: "11px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#000", fontSize: "14px", outline: "none" }} 
                type="email" 
                placeholder="seu@email.com" 
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
                placeholder="Sua senha (mínimo 6 caracteres)" 
                required 
                onChange={(e) => setStoreForm({ ...storeForm, password: e.target.value })} 
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                WhatsApp para Contato
              </label>
              <input 
                style={{ width: "100%", padding: "11px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#000", fontSize: "14px", outline: "none" }} 
                placeholder="Ex: 18912345678" 
                required 
                onChange={(e) => setStoreForm({ ...storeForm, whatsapp: e.target.value })} 
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
              {loading ? "Criando conta..." : "Cadastrar Conta"}
            </button>
          </form>
        )}

        {/* Rodapé do Card com Link para Login */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <a href="/login" style={{ color: "#0070f3", fontSize: "14px", textDecoration: "none" }}>
            Já tem uma conta? Faça login
          </a>
        </div>

      </div>
    </div>
  );
}