"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface UserProfile {
  id: string;
  name?: string;
  avatar_url?: string;
}

export default function Header() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, store_name")
        .eq("id", session.user.id)
        .single();

      const cleanName = profile?.store_name || profile?.name || "Meus Anúncios";

      setUser(
        profile || {
          id: session.user.id,
          name: cleanName,
          avatar_url: session.user.user_metadata?.avatar_url,
        }
      );
    } else {
      setUser(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkUser();
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem("sb-ahiyxrdplheckszoiogd-auth-token");
    setUser(null);
    window.location.href = "/";
  }

  return (
    <header style={{ backgroundColor: "#0F4C81", color: "#fff", padding: "10px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        
        {/* LOGO OFICIAL EM IMAGEM */}
        <Link 
          href="/" 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            backgroundColor: "#ffffff", 
            padding: "6px 12px", 
            borderRadius: "8px", 
            boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
            textDecoration: "none" 
          }}
        >
          <img 
            src="/logo.png" 
            alt="Conecta Cidade SP" 
            style={{ height: "36px", width: "auto", objectFit: "contain" }} 
          />
        </Link>

        {/* ÁREA DE NAVEGAÇÃO DO USUÁRIO */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {loading ? (
            <span style={{ fontSize: 12, opacity: 0.7 }}>Carregando...</span>
          ) : user ? (
            /* USUÁRIO CONECTADO / LOJA LOGADA */
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <a
                href="/profile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  padding: "4px 10px 4px 6px",
                  borderRadius: 20,
                  textDecoration: "none",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: "bold"
                }}
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Perfil"
                    style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", border: "1px solid #fff" }}
                  />
                ) : (
                  <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#22C55E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                    🏪
                  </div>
                )}
                <span>Meus Anúncios</span>
              </a>

              {/* BOTÃO DESCONECTAR / SAIR */}
              <button
                onClick={handleLogout}
                title="Sair da Conta"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.2)",
                  color: "#fca5a5",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  padding: "6px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: "bold"
                }}
              >
                🚪 Sair
              </button>
            </div>
          ) : (
            /* USUÁRIO VISITANTE (NÃO LOGADO) */
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <a
                href="/login"
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 13,
                  padding: "6px 12px",
                  border: "1px solid rgba(255,255,255,0.4)",
                  borderRadius: 6
                }}
              >
                🔑 Entrar
              </a>
              <a
                href="/register"
                style={{
                  backgroundColor: "#3B82F6",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: "bold",
                  padding: "6px 12px",
                  borderRadius: 6
                }}
              >
                ✨ Criar Conta / Loja
              </a>
            </div>
          )}

          {/* BOTÃO PUBLICAR ANÚNCIO */}
          <a
            href="/create"
            style={{
              backgroundColor: "#22C55E",
              color: "#fff",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: "bold",
              padding: "6px 14px",
              borderRadius: 6
            }}
          >
            📢 Criar Anúncio
          </a>
        </div>
      </div>
    </header>
  );
}