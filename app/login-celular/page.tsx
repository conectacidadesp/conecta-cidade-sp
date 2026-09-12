"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginCelularPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length < 10) {
      setErrorMsg("Digite um número de celular válido com DDD.");
      setLoading(false);
      return;
    }

    // Domínio isolado e profissional para clientes por celular (sem conflito com lojas)
    const clientEmail = `phone_${cleanPhone}@client.conectacidade.local`;

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email: clientEmail,
        password: password,
      });

      if (error) {
        setErrorMsg("Erro ao cadastrar: " + error.message);
      } else {
        // Insere ou atualiza o perfil na tabela profiles vinculando o tipo de usuário
        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            phone: cleanPhone,
            user_type: "client",
          });
        }

        alert("Cadastro realizado com sucesso! Faça login para continuar.");
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: clientEmail,
        password: password,
      });

      if (error) {
        setErrorMsg("Número de celular ou senha incorretos.");
      } else {
        router.push("/");
      }
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", padding: 20, fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center", color: "#0F4C81", marginBottom: 20 }}>
        {isSignUp ? "Criar Conta (Anunciante)" : "Entrar com Celular"}
      </h2>

      {errorMsg && (
        <div style={{ backgroundColor: "#FEE2E2", color: "#B91C1C", padding: 10, borderRadius: 6, marginBottom: 15, fontSize: 14 }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <div>
          <label style={{ display: "block", fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>Número do Celular (com DDD)</label>
          <input
            type="tel"
            placeholder="Ex: 11999999999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 16 }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>Senha</label>
          <input
            type="password"
            placeholder="Sua senha de acesso"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 16 }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: "#0F4C81",
            color: "#fff",
            padding: 14,
            borderRadius: 8,
            border: "none",
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer",
            marginTop: 10,
          }}
        >
          {loading ? "Carregando..." : isSignUp ? "Cadastrar Conta" : "Entrar"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#64748B" }}>
        {isSignUp ? "Já tem uma conta?" : "Ainda não tem cadastro?"}{" "}
        <span
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ color: "#0F4C81", fontWeight: "bold", cursor: "pointer", textDecoration: "underline" }}
        >
          {isSignUp ? "Faça login" : "Cadastre-se"}
        </span>
      </p>
    </div>
  );
}