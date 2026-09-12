"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const [userMode, setUserMode] = useState<"store" | "individual">("store");
  
  // Estados para Loja (E-mail)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Estados para Individual (Celular)
  const [phone, setPhone] = useState("");
  const [phonePassword, setPhonePassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (userMode === "store") {
      // Fluxo de Loja (E-mail)
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          alert("Erro ao cadastrar loja: " + error.message);
        } else {
          if (data.user) {
            await supabase.from("profiles").upsert({
              id: data.user.id,
              user_type: "store"
            });
          }
          alert("Loja cadastrada com sucesso! Faça login para continuar.");
          setIsRegistering(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          alert("Erro ao fazer login na loja: " + error.message);
        } else {
          router.push("/");
        }
      }
    } else {
      // Fluxo Individual (Celular com domínio isolado)
      const cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        alert("Digite um número de celular válido com DDD.");
        setLoading(false);
        return;
      }

      const clientEmail = `phone_${cleanPhone}@client.conectacidade.local`;

      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email: clientEmail,
          password: phonePassword,
        });

        if (error) {
          alert("Erro ao cadastrar anunciante: " + error.message);
        } else {
          if (data.user) {
            await supabase.from("profiles").upsert({
              id: data.user.id,
              phone: cleanPhone,
              user_type: "client"
            });
          }
          alert("Cadastro realizado com sucesso! Faça login para continuar.");
          setIsRegistering(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: clientEmail,
          password: phonePassword,
        });

        if (error) {
          alert("Número de celular ou senha incorretos.");
        } else {
          router.push("/");
        }
      }
    }

    setLoading(false);
  }

  return (
    <main style={{ padding: 40, maxWidth: 420, margin: "40px auto", backgroundColor: "#fff", borderRadius: 12, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", fontFamily: "sans-serif", color: "#000" }}>
      <h1 style={{ fontSize: 22, marginBottom: 15, fontWeight: "bold", textAlign: "center", color: "#0F4C81" }}>
        {isRegistering ? "Criar Nova Conta" : "Acessar o Conecta Cidade"}
      </h1>

      {/* Seletor de Tipo de Conta */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => setUserMode("store")}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 6,
            border: userMode === "store" ? "2px solid #0F4C81" : "1px solid #ccc",
            backgroundColor: userMode === "store" ? "#EFF6FF" : "#fff",
            color: userMode === "store" ? "#0F4C81" : "#64748B",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: 14
          }}
        >
          🏪 Sou Loja (E-mail)
        </button>
        <button
          type="button"
          onClick={() => setUserMode("individual")}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 6,
            border: userMode === "individual" ? "2px solid #0F4C81" : "1px solid #ccc",
            backgroundColor: userMode === "individual" ? "#EFF6FF" : "#fff",
            color: userMode === "individual" ? "#0F4C81" : "#64748B",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: 14
          }}
        >
          📱 Anunciante (Celular)
        </button>
      </div>

      <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {userMode === "store" ? (
          <>
            <div>
              <label style={{ fontSize: 13, fontWeight: "bold", display: "block", marginBottom: 4 }}>E-mail da Loja</label>
              <input 
                style={{ width: "100%", padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 15, color: "#000" }} 
                type="email" 
                placeholder="exemplo@loja.com" 
                value={email}
                required 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: "bold", display: "block", marginBottom: 4 }}>Senha</label>
              <input 
                style={{ width: "100%", padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 15, color: "#000" }} 
                type="password" 
                placeholder="Sua senha" 
                value={password}
                required 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label style={{ fontSize: 13, fontWeight: "bold", display: "block", marginBottom: 4 }}>Número do Celular (com DDD)</label>
              <input 
                style={{ width: "100%", padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 15, color: "#000" }} 
                type="tel" 
                placeholder="Ex: 11999999999" 
                value={phone}
                required 
                onChange={(e) => setPhone(e.target.value)} 
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: "bold", display: "block", marginBottom: 4 }}>Senha</label>
              <input 
                style={{ width: "100%", padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 15, color: "#000" }} 
                type="password" 
                placeholder="Sua senha de acesso" 
                value={phonePassword}
                required 
                onChange={(e) => setPhonePassword(e.target.value)} 
              />
            </div>
          </>
        )}

        <button 
          type="submit" 
          disabled={loading} 
          style={{ padding: 14, backgroundColor: "#0F4C81", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold", fontSize: 16, marginTop: 5 }}
        >
          {loading ? "Aguarde..." : isRegistering ? (userMode === "store" ? "Cadastrar Loja" : "Cadastrar Conta") : "Entrar"}
        </button>
      </form>

      <div style={{ marginTop: 20, textAlign: "center" }}>
        <button
          type="button"
          onClick={() => setIsRegistering(!isRegistering)}
          style={{ background: "none", border: "none", color: "#0F4C81", cursor: "pointer", fontSize: 14, textDecoration: "underline", padding: 0 }}
        >
          {isRegistering ? "Já tem uma conta? Faça login" : "Ainda não tem conta? Cadastre-se aqui"}
        </button>
      </div>
    </main>
  );
}