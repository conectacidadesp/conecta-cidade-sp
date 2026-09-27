"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [tab, setTab] = useState<"advertiser" | "store">("advertiser");
  
  // Estados para Login de Anunciante (Celular)
  const [advertiserForm, setAdvertiserForm] = useState({ phone: "", password: "" });
  
  // Estados para Login de Loja (E-mail)
  const [storeForm, setStoreForm] = useState({ email: "", password: "" });
  
  const [loading, setLoading] = useState(false);

  // 🔄 Estados dos Produtos Afiliados (Laterais e Mobile)
  const [affiliateProducts, setAffiliateProducts] = useState<any[]>([]);
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);

  useEffect(() => {
    async function fetchAffiliates() {
      const { data } = await supabase
        .from("affiliate_ads")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (data && data.length > 0) {
        setAffiliateProducts(data);
        setRightIndex(Math.floor(data.length / 2));
        setMobileIndex(0);
      }
    }
    fetchAffiliates();
  }, []);

  // ⏱️ Rotação automática dos banners a cada 5 segundos
  useEffect(() => {
    if (affiliateProducts.length <= 1) return;

    const interval = setInterval(() => {
      setLeftIndex((prev) => (prev + 1) % affiliateProducts.length);
      setRightIndex((prev) => (prev - 1 + affiliateProducts.length) % affiliateProducts.length);
      setMobileIndex((prev) => (prev + 1) % affiliateProducts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [affiliateProducts.length]);

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

  const leftProduct = affiliateProducts.length > 0 ? affiliateProducts[leftIndex] : null;
  const rightProduct = affiliateProducts.length > 0 ? affiliateProducts[rightIndex] : null;
  const mobileProduct = affiliateProducts.length > 0 ? affiliateProducts[mobileIndex] : null;

  const renderSideCard = (product: any) => {
    if (!product) return null;

    const formattedPrice = product.price ? `R$ ${product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "Ver Oferta";
    const formattedOldPrice = product.old_price ? `R$ ${product.old_price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : null;
    
    const platformLower = product.platform?.toLowerCase() || "";
    const isShopee = platformLower.includes("shopee");
    const isAmazon = platformLower.includes("amazon");
    const isMercadoLivre = platformLower.includes("mercado") || platformLower.includes("ml");

    const headerBgColor = isShopee ? "#EE4D2D" : isAmazon ? "#FF9900" : "#FFE600";
    const headerTextColor = isAmazon || isMercadoLivre ? "#1E293B" : "#FFFFFF";
    const badgeText = isShopee ? "🛒 Achadinhos Shopee" : isAmazon ? "📦 Achadinhos Amazon" : "📦 Achadinhos Mercado Livre";

    return (
      <div style={{ border: "1px solid #E2E8F0", borderRadius: 14, overflow: "hidden", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)", width: "100%" }}>
        <div style={{ backgroundColor: headerBgColor, padding: "8px 10px", textAlign: "center", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: "bold", color: headerTextColor, textTransform: "uppercase" }}>{badgeText}</span>
        </div>
        <div style={{ width: "100%", height: 210, backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderBottom: "1px solid #F1F5F9", padding: 8, boxSizing: "border-box" }}>
          <img src={product.image_url} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center" }} />
        </div>
        <div style={{ padding: 14, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: 11, backgroundColor: "#FEF3C7", color: "#D97706", padding: "2px 8px", borderRadius: 6, fontWeight: "bold", display: "inline-block" }}>Promoção Recomendada</span>
            <h4 style={{ fontSize: 14, margin: "8px 0 6px", color: "#0B2545", fontWeight: "bold", wordBreak: "break-word", lineHeight: "1.3", height: "36px", overflow: "hidden" }}>{product.title}</h4>
          </div>
          <div style={{ marginTop: 6 }}>
            {formattedOldPrice && <span style={{ fontSize: 12, color: "#94A3B8", textDecoration: "line-through", display: "block" }}>De {formattedOldPrice}</span>}
            <p style={{ fontSize: 17, fontWeight: "bold", color: isAmazon ? "#B45309" : isShopee ? "#EE4D2D" : "#2563EB", margin: "0 0 10px" }}>Por {formattedPrice}</p>
            <a href={product.affiliate_link} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", backgroundColor: "#22C55E", color: "#fff", padding: "10px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: "bold", boxShadow: "0 2px 5px rgba(34, 197, 94, 0.3)" }}>
              🔥 Ver na Loja
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main style={{ padding: "30px 15px", backgroundColor: "#F8FAFC", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "25px", maxWidth: "1250px", margin: "0 auto", flexDirection: "column" }} className="main-container-login">
        
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "25px", width: "100%" }}>
          {/* 📢 Banner Lateral Esquerdo (Sticky apenas no Desktop) */}
          <aside style={{ display: "none", flexDirection: "column", width: "260px", position: "sticky", top: "20px" }} className="side-banner-left">
            {renderSideCard(leftProduct)}
          </aside>

          {/* 📝 Formulário Central de Login */}
          <div style={{ flex: "1", maxWidth: "460px", width: "100%", background: "#ffffff", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #eaeaea", boxSizing: "border-box", margin: "0 auto" }}>
            
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
                    style={{ width: "100%", padding: "11px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#000", fontSize: "14px", outline: "none", boxSizing: "border-box" }} 
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
                    style={{ width: "100%", padding: "11px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#000", fontSize: "14px", outline: "none", boxSizing: "border-box" }} 
                    type="password" 
                    placeholder="Sua senha" 
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
                    style={{ width: "100%", padding: "11px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#000", fontSize: "14px", outline: "none", boxSizing: "border-box" }} 
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
                    style={{ width: "100%", padding: "11px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#000", fontSize: "14px", outline: "none", boxSizing: "border-box" }} 
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

          {/* 📢 Banner Lateral Direito (Sticky apenas no Desktop) */}
          <aside style={{ display: "none", flexDirection: "column", width: "260px", position: "sticky", top: "20px" }} className="side-banner-right">
            {renderSideCard(rightProduct)}
          </aside>
        </div>

        {/* 📱 Banner exclusivo para Celular (Aparece abaixo do formulário em telas pequenas) */}
        <div style={{ width: "100%", maxWidth: "460px", margin: "20px auto 0 auto" }} className="mobile-banner-container">
          {renderSideCard(mobileProduct)}
        </div>

      </div>

      {/* Regras CSS Responsivas: Exibe laterais no Desktop e oculta o banner extra mobile; Inverte no Celular */}
      <style jsx global>{`
        .mobile-banner-container {
          display: block;
        }
        @media (min-width: 1024px) {
          .side-banner-left, .side-banner-right {
            display: flex !important;
          }
          .mobile-banner-container {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}