"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", whatsapp: "" });
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // 1. Cria a conta no Auth do Supabase (onde o e-mail fica salvo)
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      alert("Erro ao criar conta: " + authError.message);
      setLoading(false);
      return;
    }

    // 2. Salva os dados extras na tabela profiles
    if (data.user) {
      const savedCity = localStorage.getItem("selectedCity") || "Não informada";
      
      const { error: profileError } = await supabase.from("profiles").insert([
        { 
          id: data.user.id, 
          name: form.name,
          store_name: form.name,
          whatsapp: form.whatsapp, 
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

  return (
    <main style={{ padding: 40, maxWidth: 400, margin: "0 auto", color: "#000" }}>
      <h1 style={{ fontSize: 24, marginBottom: 20, fontWeight: "bold" }}>Cadastro - Conecta Cidade</h1>
      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input 
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6, color: "#000" }} 
          placeholder="Nome Completo ou Nome da Loja" 
          required 
          onChange={(e) => setForm({ ...form, name: e.target.value })} 
        />
        <input 
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6, color: "#000" }} 
          type="email" 
          placeholder="E-mail" 
          required 
          onChange={(e) => setForm({ ...form, email: e.target.value })} 
        />
        <input 
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6, color: "#000" }} 
          type="password" 
          placeholder="Senha (mínimo 6 caracteres)" 
          required 
          onChange={(e) => setForm({ ...form, password: e.target.value })} 
        />
        <input 
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6, color: "#000" }} 
          placeholder="WhatsApp" 
          required 
          onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} 
        />
        <button 
          type="submit" 
          disabled={loading} 
          style={{ padding: 12, backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}
        >
          {loading ? "Criando conta..." : "Criar minha conta"}
        </button>
      </form>
    </main>
  );
}