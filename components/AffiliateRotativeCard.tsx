"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface AffiliateAd {
  id: string;
  title: string;
  price: number | null;
  old_price: number | null;
  image_url: string;
  affiliate_link: string;
  platform: string;
}

export default function AffiliateRotativeCard({ intervalSeconds = 5 }: { intervalSeconds?: number }) {
  const [ads, setAds] = useState<AffiliateAd[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    async function fetchAffiliates() {
      const { data } = await supabase
        .from("affiliate_ads")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setAds(data);
      }
      setLoading(false);
    }

    fetchAffiliates();
  }, []);

  // Temporizador para o carrossel automático (pausa se o mouse estiver em cima)
  useEffect(() => {
    if (ads.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [ads.length, intervalSeconds, isPaused]);

  if (loading || ads.length === 0) {
    return null; 
  }

  const currentAd = ads[currentIndex];
  const formattedPrice = currentAd.price ? `R$ ${currentAd.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "Ver Oferta";
  const formattedOldPrice = currentAd.old_price ? `R$ ${currentAd.old_price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : null;
  
  const platformLower = currentAd.platform?.toLowerCase() || "";
  const isShopee = platformLower.includes("shopee");
  const isAmazon = platformLower.includes("amazon");
  const isMercadoLivre = platformLower.includes("mercado") || platformLower.includes("ml");

  // Cores oficiais dos marketplaces: Shopee (Laranja), Amazon (Amarelo/Laranja), Mercado Livre (Amarelo/Azul ou Azul Oficial)
  const headerBgColor = isShopee ? "#EE4D2D" : isAmazon ? "#FF9900" : "#FFE600";
  const headerTextColor = isAmazon || isMercadoLivre ? "#1E293B" : "#FFFFFF"; // Texto escuro para fundos claros (ML e Amazon)
  
  // Nomes padronizados para "Achadinhos"
  const badgeText = isShopee ? "🛒 Achadinhos Shopee" : isAmazon ? "📦 Achadinhos Amazon" : "📦 Achadinhos Mercado Livre";

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? ads.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  return (
    <div 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ 
        border: "1px solid #E2E8F0", 
        borderRadius: 14, 
        overflow: "hidden", 
        backgroundColor: "#ffffff", 
        display: "flex", 
        flexDirection: "column", 
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s ease-in-out",
        position: "relative",
        width: "100%",
        height: "100%"
      }}
    >
      {/* Etiqueta Superior com a cor e identidade do marketplace */}
      <div style={{ 
        backgroundColor: headerBgColor, 
        padding: "8px 10px", 
        textAlign: "center", 
        width: "100%", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        gap: 6 
      }}>
        <span style={{ fontSize: 13, fontWeight: "bold", color: headerTextColor, textTransform: "uppercase" }}>
          {badgeText}
        </span>
      </div>

      {/* Imagem do Produto inteira sem cortes */}
      <div style={{ width: "100%", height: 235, backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderBottom: "1px solid #F1F5F9", position: "relative", padding: 8, boxSizing: "border-box" }}>
        <img 
          src={currentAd.image_url} 
          alt={currentAd.title} 
          style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", transition: "transform 0.3s ease" }} 
        />
        
        {/* Setas de Navegação Manual */}
        {ads.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              style={{
                position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
                backgroundColor: "rgba(0,0,0,0.5)", color: "#fff", border: "none",
                borderRadius: "50%", width: 30, height: 30, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: "bold"
              }}
              title="Anúncio Anterior"
            >
              ‹
            </button>
            <button 
              onClick={handleNext}
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                backgroundColor: "rgba(0,0,0,0.5)", color: "#fff", border: "none",
                borderRadius: "50%", width: 30, height: 30, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: "bold"
              }}
              title="Próximo Anúncio"
            >
              ›
            </button>
          </>
        )}

        {/* Indicador de Paginação */}
        <div style={{ position: "absolute", bottom: 8, right: 8, backgroundColor: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 4 }}>
          🔄 {currentIndex + 1}/{ads.length}
        </div>
      </div>

      {/* Detalhes do Produto */}
      <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontSize: 11, backgroundColor: "#FEF3C7", color: "#D97706", padding: "2px 8px", borderRadius: 6, fontWeight: "bold", display: "inline-block" }}>
            Promoção Recomendada
          </span>
          <h4 style={{ fontSize: 15, margin: "8px 0 6px", color: "#0B2545", fontWeight: "bold", wordBreak: "break-word", lineHeight: "1.3" }}>
            {currentAd.title}
          </h4>
        </div>
        
        <div style={{ marginTop: 10 }}>
          {formattedOldPrice && (
            <span style={{ fontSize: 12, color: "#94A3B8", textDecoration: "line-through", display: "block" }}>
              De {formattedOldPrice}
            </span>
          )}
          <p style={{ fontSize: 18, fontWeight: "bold", color: isAmazon ? "#B45309" : isShopee ? "#EE4D2D" : "#2563EB", margin: "0 0 10px" }}>
            Por {formattedPrice}
          </p>

          <a
            href={currentAd.affiliate_link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              display: "block", 
              textAlign: "center", 
              backgroundColor: "#22C55E", 
              color: "#fff", 
              padding: "10px", 
              borderRadius: 8, 
              textDecoration: "none", 
              fontSize: 13, 
              fontWeight: "bold", 
              marginBottom: 4,
              boxShadow: "0 2px 5px rgba(34, 197, 94, 0.3)"
            }}
          >
            🔥 Ver na Loja
          </a>
        </div>
      </div>
    </div>
  );
}