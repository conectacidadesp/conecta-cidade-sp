"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import StoriesBar from "@/components/StoriesBar";

interface Ad {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  price: number | null;
  category: string;
  subcategory?: string | null;
  whatsapp: string;
  city: string;
  image_url: string | null;
  created_at: string;
}

const CATEGORIES = [
  { name: "Todos", icon: "🌐" },
  { name: "Produtos", icon: "📦" },
  { name: "Serviços", icon: "🛠️" },
  { name: "Empregos", icon: "💼" },
  { name: "Alimentação", icon: "🍔" },
  { name: "Promoções", icon: "🏷️" },
  { name: "Eventos", icon: "🎉" },
];

export default function Home() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [profilesMap, setProfilesMap] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("Rubiácea-SP");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  // Estados para o Modal de Denúncia
  const [reportingAd, setReportingAd] = useState<Ad | null>(null);
  const [reportReason, setReportReason] = useState("Conteúdo impróprio / Proibido");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCity = localStorage.getItem("selectedCity");
      if (savedCity) {
        setSelectedCity(savedCity);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      const { data: adsData, error: adsError } = await supabase
        .from("ads")
        .select("*")
        .eq("city", selectedCity)
        .order("created_at", { ascending: false });

      if (adsError) {
        console.error("Erro ao buscar anúncios:", adsError.message);
        setAds([]);
      } else {
        const loadedAds = adsData || [];
        setAds(loadedAds);

        const userIds = Array.from(new Set(loadedAds.map(ad => ad.user_id).filter(Boolean)));
        
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("*")
            .in("id", userIds);

          if (!profilesError && profilesData) {
            const map: { [key: string]: any } = {};
            profilesData.forEach(profile => {
              map[profile.id] = profile;
            });
            setProfilesMap(map);
          }
        }
      }
      setLoading(false);
    }

    fetchData();
  }, [selectedCity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput.trim().toLowerCase());
  };

  const filteredAds = ads.filter((ad) => {
    let matchesCategory = true;
    if (selectedCategory === "Produtos") {
      matchesCategory = !["Serviços", "Empregos", "Eventos", "Alimentação"].includes(ad.category);
    } else if (selectedCategory !== "Todos") {
      matchesCategory = ad.category === selectedCategory;
    }

    let matchesSearch = true;
    if (activeSearch) {
      const titleMatch = ad.title.toLowerCase().includes(activeSearch);
      const descMatch = ad.description.toLowerCase().includes(activeSearch);
      const catMatch = ad.category.toLowerCase().includes(activeSearch);
      const subcatMatch = ad.subcategory ? ad.subcategory.toLowerCase().includes(activeSearch) : false;
      matchesSearch = titleMatch || descMatch || catMatch || subcatMatch;
    }

    return matchesCategory && matchesSearch;
  });

  const relatedAds = ads.filter((ad) => !filteredAds.some((f) => f.id === ad.id));

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingAd) return;

    setSubmittingReport(true);
    const { error } = await supabase.from("reports").insert([
      {
        ad_id: reportingAd.id,
        reason: reportReason,
        details: reportDetails,
        status: "pendente"
      }
    ]);

    setSubmittingReport(false);

    if (error) {
      alert("Erro do Supabase: " + error.message);
      console.error(error);
    } else {
      alert("Denúncia enviada com sucesso! Nossa moderação irá analisar.");
      setReportingAd(null);
      setReportDetails("");
    }
  };

  const renderAdCard = (ad: Ad) => {
    const profile = ad.user_id ? profilesMap[ad.user_id] : null;
    const isMenuStore = ad.category === "Alimentação" || profile?.store_type === "cardapio";

    // Formatação exata da mensagem solicitada com emojis, detalhes e link da foto
    const formattedPrice = ad.price ? `R$ ${ad.price.toFixed(2)}` : "A combinar";
    const whatsappMessage = `🚀 Estou vindo do ConectaCidadeSp e tenho interesse neste produto:

📦 ${ad.title}
💰 Preço: ${formattedPrice}
📝 Detalhes: ${ad.description}

🖼️ Foto do produto: ${ad.image_url || "Sem foto"}`;

    return (
      <div key={ad.id} style={{ 
        border: "1px solid #CBD5E1", 
        borderRadius: 12, 
        overflow: "hidden", 
        backgroundColor: "#ffffff", 
        display: "flex", 
        flexDirection: "column", 
        boxShadow: "0 4px 12px rgba(15, 76, 129, 0.08)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease"
      }}>
        <div style={{ width: "100%", height: 200, backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", padding: 10, borderBottom: "1px solid #F1F5F9" }}>
          {ad.image_url ? (
            <img 
              src={ad.image_url} 
              alt={ad.title} 
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} 
            />
          ) : (
            <span style={{ color: "#94A3B8", fontSize: 14 }}>Sem Foto</span>
          )}
        </div>

        <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: 11, backgroundColor: "#E0F2FE", color: "#0369A1", padding: "3px 10px", borderRadius: 6, fontWeight: "bold", display: "inline-block" }}>
              {ad.category}
            </span>
            <h4 style={{ fontSize: 16, margin: "10px 0 6px", color: "#0B2545", fontWeight: "bold" }}>{ad.title}</h4>
            <p style={{ fontSize: 13, color: "#64748B", margin: 0, height: 38, overflow: "hidden", textOverflow: "ellipsis" }}>{ad.description}</p>
          </div>
          
          <div style={{ marginTop: 14 }}>
            <p style={{ fontSize: 18, fontWeight: "bold", color: "#0F4C81", margin: "0 0 10px" }}>
              {formattedPrice}
            </p>

            {isMenuStore ? (
              <a
                href={profile?.store_url || `/loja/${ad.user_id}`}
                style={{ display: "block", textAlign: "center", backgroundColor: "#0F4C81", color: "#fff", padding: "10px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: "bold", marginBottom: 8, boxShadow: "0 2px 5px rgba(15, 76, 129, 0.3)" }}
              >
                🍔 Ver Cardápio da Loja
              </a>
            ) : (
              <a
                href={`https://wa.me/55${ad.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noreferrer"
                style={{ display: "block", textAlign: "center", backgroundColor: "#22C55E", color: "#fff", padding: "10px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: "bold", marginBottom: 8, boxShadow: "0 2px 5px rgba(34, 197, 94, 0.3)" }}
              >
                💬 WhatsApp
              </a>
            )}

            <button
              onClick={() => setReportingAd(ad)}
              style={{ width: "100%", background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, color: "#64748B", fontWeight: 500 }}
            >
              <span>🚩</span> Denunciar anúncio
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <section style={{ backgroundColor: "#0F4C81", color: "#fff", padding: "30px 20px", textAlign: "center", borderRadius: 8, marginBottom: 20, boxShadow: "0 4px 15px rgba(15,76,129,0.2)" }}>
        <div style={{ maxWidth: 650, margin: "0 auto" }}>
          <h2 style={{ margin: "0 0 15px", fontSize: 22 }}>Encontre tudo o que precisa na sua cidade</h2>
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <input
              type="text"
              placeholder="O que você procura? ex: café, lâmpada, serviços..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (e.target.value === "") setActiveSearch("");
              }}
              style={{ flex: 1, minWidth: 220, padding: "12px 16px", borderRadius: 8, border: "none", fontSize: 15, outline: "none" }}
            />
            <button
              type="submit"
              style={{ backgroundColor: "#22C55E", color: "#fff", border: "none", padding: "12px 20px", borderRadius: 8, fontWeight: "bold", cursor: "pointer", fontSize: 15 }}
            >
              🔍 Buscar
            </button>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                localStorage.setItem("selectedCity", e.target.value);
              }}
              style={{ padding: "12px 16px", borderRadius: 8, border: "none", backgroundColor: "#0B2545", color: "#fff", fontWeight: "bold", cursor: "pointer" }}
            >
              <option value="Rubiácea-SP">Rubiácea-SP</option>
              <option value="Guararapes-SP">Guararapes-SP</option>
            </select>
          </form>
        </div>
      </section>

      <StoriesBar selectedCity={selectedCity} />

      <section style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: 8, padding: "15px 0", marginBottom: 30, marginTop: 20 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 15, overflowX: "auto", padding: "0 20px" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "none",
                border: "none",
                cursor: "pointer",
                opacity: selectedCategory === cat.name ? 1 : 0.6,
                transform: selectedCategory === cat.name ? "scale(1.05)" : "scale(1)",
                transition: "all 0.2s",
                minWidth: 70
              }}
            >
              <div style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                backgroundColor: selectedCategory === cat.name ? "#0F4C81" : "#F1F5F9",
                color: selectedCategory === cat.name ? "#fff" : "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                marginBottom: 4,
                boxShadow: selectedCategory === cat.name ? "0 2px 8px rgba(15,76,129,0.4)" : "none"
              }}>
                {cat.icon}
              </div>
              <span style={{ fontSize: 12, fontWeight: selectedCategory === cat.name ? "bold" : "normal", color: "#334155" }}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      <main style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 40 }}>
        <h3 style={{ margin: "0 0 20px", color: "#0B2545", fontSize: 18, borderLeft: "4px solid #0F4C81", paddingLeft: 10 }}>
          {activeSearch
            ? `Resultados para "${activeSearch}" em ${selectedCity}`
            : selectedCategory === "Todos"
            ? `Todos os Anúncios em ${selectedCity}`
            : `Anúncios de ${selectedCategory} em ${selectedCity}`}
        </h3>

        {loading ? (
          <p style={{ textAlign: "center", color: "#64748B", margin: "40px 0" }}>Carregando anúncios...</p>
        ) : (
          <>
            {filteredAds.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 20 }}>
                {filteredAds.map(renderAdCard)}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 30, backgroundColor: "#fff", border: "1px dashed #CBD5E1", borderRadius: 8, marginBottom: 30 }}>
                <p style={{ color: "#64748B", fontSize: 16, margin: 0 }}>Nenhum anúncio encontrado para esta busca específica.</p>
              </div>
            )}

            {(filteredAds.length === 0 || activeSearch !== "") && relatedAds.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <h4 style={{ color: "#0F4C81", fontSize: 16, marginBottom: 15, borderBottom: "2px solid #E2E8F0", paddingBottom: 8 }}>
                  💡 Veja anúncios relacionados em {selectedCity}
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 20 }}>
                  {relatedAds.map(renderAdCard)}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {reportingAd && (
        <div style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          width: "100vw", 
          height: "100vh", 
          backgroundColor: "rgba(0,0,0,0.6)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          zIndex: 9999, 
          padding: "16px", 
          boxSizing: "border-box" 
        }}>
          <div style={{ 
            backgroundColor: "#fff", 
            borderRadius: 12, 
            padding: "20px", 
            maxWidth: 450, 
            width: "100%", 
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            boxSizing: "border-box",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <h3 style={{ margin: "0 0 10px", color: "#1E293B", fontSize: 18 }}>Denunciar Anúncio</h3>
            <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 15px", wordBreak: "break-word" }}>
              Anúncio: <strong>{reportingAd.title}</strong>
            </p>

            <form onSubmit={handleSendReport}>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 5, color: "#334155" }}>
                  Motivo da Denúncia:
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 14, boxSizing: "border-box" }}
                >
                  <option value="Conteúdo impróprio / Proibido">Conteúdo impróprio / Proibido</option>
                  <option value="Suspeita de Golpe / Fraude">Suspeita de Golpe / Fraude</option>
                  <option value="Produto Falsificado / Pirata">Produto Falsificado / Pirata</option>
                  <option value="Informações falsas ou enganosas">Informações falsas ou enganosas</option>
                  <option value="Outro motivo">Outro motivo</option>
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 5, color: "#334155" }}>
                  Detalhes adicionais (opcional):
                </label>
                <textarea
                  placeholder="Explique brevemente o motivo..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={3}
                  style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 14, resize: "vertical", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setReportingAd(null)}
                  style={{ padding: "10px 16px", backgroundColor: "#E2E8F0", border: "none", borderRadius: 6, fontWeight: "bold", cursor: "pointer", color: "#334155" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  style={{ padding: "10px 16px", backgroundColor: "#DC2626", color: "#fff", border: "none", borderRadius: 6, fontWeight: "bold", cursor: "pointer" }}
                >
                  {submittingReport ? "Enviando..." : "Enviar Denúncia"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}