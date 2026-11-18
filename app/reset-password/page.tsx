"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // 🔄 Estados dos Produtos Afiliados (Laterais e Mobile)
  const [affiliateProducts, setAffiliateProducts] = useState<any[]>([]);
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);

  // Verifica se o usuário chegou através do link válido enviado pelo Supabase
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setSessionReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSessionReady(true);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Busca os produtos afiliados para manter o padrão visual
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

  // Atualiza a senha no Supabase Auth
  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword.length < 6) {
      alert("A nova senha precisa ter no mínimo 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("As senhas digitadas não coincidem.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      alert("Erro ao redefinir senha: " + error.message);
    } else {
      alert("Senha alterada com sucesso! Faça login com sua nova senha.");
      window.location.href = "/login";
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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "25px", maxWidth: "1250px", margin: "0 auto", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "25px", width: "100%" }}>
          {/* 📢 Banner Lateral Esquerdo */}
          <aside style={{ display: "none", flexDirection: "column", width: "260px", position: "sticky", top: "20px" }} className="side-banner-left">
            {renderSideCard(leftProduct)}
          </aside>

          {/* 📝 Card Central de Nova Senha */}
          <div style={{ flex: "1", maxWidth: "460px", width: "100%", background: "#ffffff", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #eaeaea", boxSizing: "border-box", margin: "0 auto" }}>
            <h1 style={{ fontSize: "22px", fontWeight: "bold", textAlign: "center", color: "#0A2540", marginBottom: "12px" }}>
              Criar Nova Senha
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", textAlign: "center", marginBottom: "24px" }}>
              Digite sua nova senha abaixo para recuperar o acesso à sua conta.
            </p>

            {!sessionReady ? (
              <div style={{ textAlign: "center", padding: "16px", backgroundColor: "#FEF3C7", borderRadius: "8px", color: "#92400E", fontSize: "13px" }}>
                Validando link de recuperação... Se você acessou esta página diretamente sem clicar no link enviado ao seu e-mail, solicite uma nova recuperação na tela de login.
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                    Nova Senha
                  </label>
                  <input
                    style={{ width: "100%", padding: "11px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#000", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                    Confirmar Nova Senha
                  </label>
                  <input
                    style={{ width: "100%", padding: "11px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#000", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                    type="password"
                    placeholder="Repita a nova senha"
                    minLength={6}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  }}
                >
                  {loading ? "Salvando..." : "Salvar Nova Senha"}
                </button>
              </form>
            )}

            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <a href="/login" style={{ color: "#0070f3", fontSize: "14px", textDecoration: "none" }}>
                Voltar para o Login
              </a>
            </div>
          </div>

          {/* 📢 Banner Lateral Direito */}
          <aside style={{ display: "none", flexDirection: "column", width: "260px", position: "sticky", top: "20px" }} className="side-banner-right">
            {renderSideCard(rightProduct)}
          </aside>
        </div>

        {/* 📱 Banner exclusivo para Celular */}
        <div style={{ width: "100%", maxWidth: "460px", margin: "20px auto 0 auto" }} className="mobile-banner-container">
          {renderSideCard(mobileProduct)}
        </div>
      </div>

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