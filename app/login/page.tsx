"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (isRegistering) {
      const { error } = await supabase.auth.signUp({ email, password });

      if (error) {
        alert("Erro ao cadastrar: " + error.message);
      } else {
        alert("Conta criada com sucesso! Você já pode entrar.");
        setIsRegistering(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        alert("Erro ao fazer login: " + error.message);
      } else {
        alert("Login realizado com sucesso!");
        window.location.href = "/";
      }
    }

    setLoading(false);
  }

  return (
    <main style={{ padding: 40, maxWidth: 400, margin: "0 auto", color: "#000" }}>
      <h1 style={{ fontSize: 24, marginBottom: 20, fontWeight: "bold" }}>
        {isRegistering ? "Cadastrar Nova Loja" : "Entrar no Conecta Cidade"}
      </h1>

      <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input 
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6, color: "#000" }} 
          type="email" 
          placeholder="Seu E-mail" 
          required 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6, color: "#000" }} 
          type="password" 
          placeholder="Sua Senha" 
          required 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button 
          type="submit" 
          disabled={loading} 
          style={{ padding: 12, backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}
        >
          {loading ? "Aguarde..." : isRegistering ? "Cadastrar Loja" : "Entrar"}
        </button>
      </form>

      <div style={{ marginTop: 20, textAlign: "center" }}>
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          style={{ background: "none", border: "none", color: "#0070f3", cursor: "pointer", fontSize: 14, padding: 0 }}
        >
          {isRegistering ? "Já tem uma conta? Faça login" : "Ainda não tem conta? Cadastre sua loja aqui"}
        </button>
      </div>
    </main>
  );
}