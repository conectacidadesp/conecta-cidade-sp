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
  advertiser_name?: string | null;
}

interface Profile {
  id: string;
  store_name?: string;
  name?: string;
  city?: string;
  logo_url?: string;
  banner_url?: string;
  bio?: string;
  whatsapp?: string;
  store_type?: string;
  user_type?: string;
}

const CATEGORIES = [
  { name: "Todos", icon: "🌐" },
  { name: "Comércio Local", icon: "🏪" },
  { name: "Produtos", icon: "📦" },
  { name: "Serviços", icon: "🛠️" },
  { name: "Empregos", icon: "💼" },
  { name: "Alimentação", icon: "🍔" },
  { name: "Promoções", icon: "🏷️" },
  { name: "Eventos", icon: "🎉" },
];

export default function Home() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profilesMap, setProfilesMap] = useState<{ [key: string]: Profile }>({});
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("Rubiácea-SP");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

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
      
      const { data: adsData } = await supabase
        .from("ads")
        .select("*")
        .eq("city", selectedCity)
        .order("created_at", { ascending: false });

      const loadedAds = adsData || [];
      setAds(loadedAds);

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*");

      if (profilesData) {
        setProfiles(profilesData);
        const map: { [key: string]: Profile } = {};
        profilesData.forEach(profile => {
          map[profile.id] = profile;
        });
        setProfilesMap(map);
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
    if (selectedCategory === "Comércio Local") {
      return false;
    } else if (selectedCategory === "Produtos") {
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
      const advMatch = ad.advertiser_name ? ad.advertiser_name.toLowerCase().includes(activeSearch) : false;
      matchesSearch = titleMatch || descMatch || catMatch || subcatMatch || advMatch;
    }

    return matchesCategory && matchesSearch;
  });

  const relatedAds = ads.filter((ad) => !filteredAds.some((f) => f.id === ad.id));

  const filteredProfiles = profiles.filter(profile => {
    const sName = profile.store_name || profile.name || "";
    
    if (sName.toLowerCase().startsWith("anunciante") || profile.user_type === "client") {
      return false;
    }

    if (profile.city && profile.city.trim() !== "" && profile.city !== selectedCity) {
      return false;
    }

    if (!activeSearch) return true;
    const nameMatch = sName.toLowerCase().includes(activeSearch);
    const bioMatch = profile.bio ? profile.bio.toLowerCase().includes(activeSearch) : false;
    return nameMatch || bioMatch;
  });

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
    } else {
      alert("Denúncia enviada com sucesso! Nossa moderação irá analisar.");
      setReportingAd(null);
      setReportDetails("");
    }
  };

  const renderProfileCard = (profile: Profile) => {
    const storeName = profile.store_name || profile.name || "Comércio Local";
    const storeWhatsapp = profile.whatsapp || "";
    const storeLogo = profile.logo_url;
    const storeBanner = profile.banner_url;
    const storeBio = profile.bio && profile.bio !== "EMPTY" ? profile.bio : "Estabelecimento cadastrado no Conecta Cidade SP.";

    return (
      <div key={profile.id} style={{ 
        border: "1px solid #E2E8F0", 
        borderRadius: 14, 
        overflow: "hidden", 
        backgroundColor: "#ffffff", 
        display: "flex", 
        flexDirection: "column", 
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease"
      }}>
        <div style={{ width: "100%", height: 110, backgroundColor: "#0088FF", position: "relative" }}>
          {storeBanner ? (
            <img src={storeBanner} alt="Capa" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #0088FF, #F97316)" }} />
          )}
        </div>

        <div style={{ padding: "0 16px", position: "relative", marginTop: -35, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ width: 70, height: 70, borderRadius: "50%", border: "3px solid #ffffff", backgroundColor: "#F1F5F9", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
            {storeLogo ? (
              <img src={storeLogo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🏪</div>
            )}
          </div>
        </div>

        <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h4 style={{ fontSize: 17, margin: "6px 0 4px", color: "#0B2545", fontWeight: "bold" }}>
              {storeName}
            </h4>
            <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 10px" }}>📍 {profile.city || selectedCity}</p>
            <p style={{ fontSize: 13, color: "#334155", margin: 0, height: 45, overflow: "hidden", textOverflow: "ellipsis" }}>
              {storeBio}
            </p>
          </div>
          
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <a
              href={`/shop/${profile.id}`}
              style={{ display: "block", width: "100%", textAlign: "center", backgroundColor: "#0088FF", color: "#fff", padding: "10px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: "bold", boxShadow: "0 2px 5px rgba(0, 136, 255, 0.3)" }}
            >
              🏪 Ver Produtos / Anúncios
            </a>

            {storeWhatsapp && (
              <a
                href={`https://wa.me/55${storeWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${storeName}, vi seu estabelecimento no Conecta Cidade SP e gostaria de mais informações.`)}`}
                target="_blank"
                rel="noreferrer"
                style={{ display: "block", textAlign: "center", backgroundColor: "#22C55E", color: "#fff", padding: "10px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: "bold", boxShadow: "0 2px 5px rgba(34, 197, 94, 0.3)" }}
              >
                💬 Chamar no WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAdCard = (ad: Ad) => {
    const storeProfile = ad.user_id ? profilesMap[ad.user_id] : null;
    const storeNameRaw = storeProfile ? (storeProfile.store_name || storeProfile.name || "") : "";
    
    const isRealStore = storeProfile && 
      storeProfile.user_type !== "client" && 
      !storeNameRaw.toLowerCase().startsWith("anunciante");

    const storeName = isRealStore ? storeNameRaw : null;
    const isFoodStore = storeProfile?.store_type === "food";
    const hasCustomAdvertiser = !storeName && ad.advertiser_name && ad.advertiser_name.trim() !== "";

    const formattedPrice = ad.price ? `R$ ${ad.price.toFixed(2)}` : "A combinar";
    const imageText = ad.image_url ? `${ad.image_url}` : "Nenhuma foto informada";
    const adLink = typeof window !== "undefined" ? `${window.location.origin}` : "";

    const whatsappMessage = `🚀 Estou vindo do *Conecta Cidade Sp* e tenho interesse neste produto:

📦 ${ad.title}
💰 ${formattedPrice}
📝 Detalhes: ${ad.description}
🖼️ Foto do produto: ${imageText}
🔗 Ver anúncio: ${adLink}`;

    return (
      <div key={ad.id} style={{ 
        border: "1px solid #E2E8F0", 
        borderRadius: 14, 
        overflow: "hidden", 
        backgroundColor: "#ffffff", 
        display: "flex", 
        flexDirection: "column", 
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)"
      }}>
        {storeName && ad.user_id && (
          <a
            href={`/shop/${ad.user_id}`}
            style={{ 
              backgroundColor: "#0088FF", 
              padding: "8px 10px", 
              textAlign: "center", 
              textDecoration: "none",
              borderBottom: "1px solid #0066CC", 
              width: "100%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: 6 
            }}
          >
            <span style={{ fontSize: 13, fontWeight: "bold", color: "#FFFFFF" }}>
              🏪 {storeName}
            </span>
          </a>
        )}

        {hasCustomAdvertiser && (
          <div
            style={{ 
              backgroundColor: "#FFFFFF", 
              padding: "8px 10px", 
              textAlign: "center", 
              borderBottom: "1px solid #E2E8F0", 
              width: "100%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: 6 
            }}
          >
            <span style={{ fontSize: 13, fontWeight: "bold", color: "#000000" }}>
              👤 {ad.advertiser_name}
            </span>
          </div>
        )}

        <div style={{ width: "100%", height: 190, backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderBottom: "1px solid #F1F5F9", position: "relative" }}>
          {ad.image_url ? (
            <img src={ad.image_url} alt={ad.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
          ) : (
            <span style={{ color: "#94A3B8", fontSize: 14 }}>Sem Foto</span>
          )}
        </div>

        <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: 11, backgroundColor: "#FFEDD5", color: "#C2410C", padding: "3px 10px", borderRadius: 6, fontWeight: "bold", display: "inline-block" }}>
              {ad.category}
            </span>
            <h4 style={{ fontSize: 16, margin: "10px 0 6px", color: "#0B2545", fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {ad.title}
            </h4>
            <p style={{ fontSize: 13, color: "#64748B", margin: 0, height: 38, overflow: "hidden", textOverflow: "ellipsis" }}>{ad.description}</p>
          </div>
          
          <div style={{ marginTop: 14 }}>
            <p style={{ fontSize: 18, fontWeight: "bold", color: "#0088FF", margin: "0 0 10px" }}>
              {formattedPrice}
            </p>

            {isFoodStore && ad.user_id ? (
              <a
                href={`/shop/${ad.user_id}?ad=${ad.id}`}
                style={{ 
                  display: "block", 
                  width: "100%", 
                  textAlign: "center", 
                  backgroundColor: "#F97316", 
                  color: "#fff", 
                  padding: "10px", 
                  borderRadius: 8, 
                  textDecoration: "none", 
                  fontSize: 13, 
                  fontWeight: "bold", 
                  marginBottom: 8, 
                  boxShadow: "0 2px 5px rgba(249, 115, 22, 0.3)" 
                }}
              >
                🍽️ Ver Cardápio da Loja
              </a>
            ) : (
              <a
                href={`https://wa.me/55${ad.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noreferrer"
                style={{ display: "block", textAlign: "center", backgroundColor: "#22C55E", color: "#fff", padding: "10px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: "bold", marginBottom: 8 }}
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
              style={{ backgroundColor: "#F97316", color: "#fff", border: "none", padding: "12px 20px", borderRadius: 8, fontWeight: "bold", cursor: "pointer", fontSize: 15 }}
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
                minWidth: 80
              }}
            >
              <div style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                backgroundColor: selectedCategory === cat.name ? "#0088FF" : "#F1F5F9",
                color: selectedCategory === cat.name ? "#fff" : "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                marginBottom: 4,
                boxShadow: selectedCategory === cat.name ? "0 2px 8px rgba(0,136,255,0.4)" : "none"
              }}>
                {cat.icon}
              </div>
              <span style={{ fontSize: 12, fontWeight: selectedCategory === cat.name ? "bold" : "normal", color: "#334155", textAlign: "center" }}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      <main style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 40 }}>
        <h3 style={{ margin: "0 0 20px", color: "#0B2545", fontSize: 18, borderLeft: "4px solid #F97316", paddingLeft: 10 }}>
          {selectedCategory === "Comércio Local"
            ? `Comércio Local em ${selectedCity}`
            : activeSearch
            ? `Resultados para "${activeSearch}" em ${selectedCity}`
            : selectedCategory === "Todos"
            ? `Todos os Anúncios em ${selectedCity}`
            : `Anúncios de ${selectedCategory} em ${selectedCity}`}
        </h3>

        {loading ? (
          <p style={{ textAlign: "center", color: "#64748B", margin: "40px 0" }}>Carregando dados...</p>
        ) : (
          <>
            {selectedCategory === "Comércio Local" ? (
              filteredProfiles.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
                  {filteredProfiles.map(renderProfileCard)}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: 30, backgroundColor: "#fff", border: "1px dashed #CBD5E1", borderRadius: 8, marginBottom: 30 }}>
                  <p style={{ color: "#64748B", fontSize: 16, margin: 0 }}>Nenhum comércio cadastrado encontrado nesta cidade.</p>
                </div>
              )
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
                    <h4 style={{ color: "#0088FF", fontSize: 16, marginBottom: 15, borderBottom: "2px solid #E2E8F0", paddingBottom: 8 }}>
                      💡 Veja anúncios relacionados em {selectedCity}
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 20 }}>
                      {relatedAds.map(renderAdCard)}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {reportingAd && (
        <div style={{ 
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", 
          backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "16px",
          boxSizing: "border-box"
        }}>
          <div style={{ 
            backgroundColor: "#fff", 
            borderRadius: 12, 
            padding: "20px", 
            width: "100%", 
            maxWidth: 450, 
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            boxSizing: "border-box",
            margin: "0 16px"
          }}>
            <h3 style={{ margin: "0 0 10px", color: "#1E293B", fontSize: 18 }}>Denunciar Anúncio</h3>
            <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 15px", wordBreak: "break-word" }}>Anúncio: <strong>{reportingAd.title}</strong></p>

            <form onSubmit={handleSendReport}>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 5, color: "#334155" }}>Motivo:</label>
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
                <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 5, color: "#334155" }}>Detalhes adicionais:</label>
                <textarea
                  placeholder="Explique brevemente..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={3}
                  style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 14, boxSizing: "border-box", resize: "vertical" }}
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