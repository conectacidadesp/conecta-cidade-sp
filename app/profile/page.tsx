"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Ad {
  id: string;
  title: string;
  price: number | null;
  category: string;
  image_url: string | null;
  city: string;
  description?: string;
}

const FONT_OPTIONS = [
  { id: "sans", name: "Sans-serif (Moderno)", family: "sans-serif" },
  { id: "serif", name: "Serif (Elegante)", family: "Georgia, serif" },
  { id: "monospace", name: "Monospace (Técnico)", family: "monospace" },
];

const THEME_OPTIONS = [
  { id: "blue", name: "Azul Clássico", color: "#0F4C81" },
  { id: "emerald", name: "Verde Esmeralda", color: "#059669" },
  { id: "purple", name: "Roxo Premium", color: "#7C3AED" },
  { id: "darkGold", name: "Dark Gold", color: "#D97706" },
  { id: "rose", name: "Rosa Elegante", color: "#E11D48" },
];

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState<"perfil" | "vitrine" | "anuncios">("perfil");
  
  // Dados Básicos da Loja
  const [storeName, setStoreName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [storeType, setStoreType] = useState<"marketplace" | "food">("marketplace");
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Personalização da Vitrine
  const [themeColor, setThemeColor] = useState("blue");
  const [fontStyle, setFontStyle] = useState("sans");
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  // Estado Geral
  const [myAds, setMyAds] = useState<Ad[]>([]);
  const [loadingAds, setLoadingAds] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [postingStoryId, setPostingStoryId] = useState<string | null>(null);

  const availableCities = ["Rubiácea-SP", "Guararapes-SP"];

  useEffect(() => {
    async function loadDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert("Aviso: Você precisa estar logado para acessar seu painel.");
        window.location.href = "/";
        return;
      }
      
      setUser(user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setStoreName(profileData.store_name || "");
        setCity(profileData.city || "");
        setBio(profileData.bio || "");
        setWhatsapp(profileData.whatsapp || "");
        setStoreType(profileData.store_type || "marketplace");
        setCurrentLogoUrl(profileData.logo_url || null);
        setThemeColor(profileData.theme_color || "blue");
        setFontStyle(profileData.font_style || "sans");
        setBannerUrl(profileData.banner_url || null);
      }

      setLoadingAds(true);
      const { data: adsData } = await supabase
        .from("ads")
        .select("id, title, price, category, image_url, city, description")
        .eq("user_id", user.id);

      if (adsData) {
        setMyAds(adsData);
      }
      
      setLoadingAds(false);
      setFetching(false);
    }

    loadDashboardData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!city) {
      alert("Por favor, selecione a cidade da sua loja!");
      return;
    }

    setLoading(true);
    let uploadedLogoUrl = currentLogoUrl || "";
    let uploadedBannerUrl = bannerUrl || "";

    // Upload do Logotipo
    if (logoFile) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${user.id}-logo-${Math.random()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("ads-images")
        .upload(filePath, logoFile, { upsert: true });

      if (!uploadError) {
        const { data } = supabase.storage.from("ads-images").getPublicUrl(filePath);
        uploadedLogoUrl = data.publicUrl;
      }
    }

    // Upload da Capa/Banner
    if (bannerFile) {
      const fileExt = bannerFile.name.split('.').pop();
      const fileName = `${user.id}-banner-${Math.random()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("ads-images")
        .upload(filePath, bannerFile, { upsert: true });

      if (!uploadError) {
        const { data } = supabase.storage.from("ads-images").getPublicUrl(filePath);
        uploadedBannerUrl = data.publicUrl;
      }
    }

    const profileData: any = {
      id: user.id,
      store_name: storeName,
      city: city,
      bio: bio,
      whatsapp: whatsapp,
      store_type: storeType,
      logo_url: uploadedLogoUrl,
      theme_color: themeColor,
      font_style: fontStyle,
      banner_url: uploadedBannerUrl
    };

    const { error } = await supabase.from("profiles").upsert(profileData);

    setLoading(false);

    if (error) {
      alert("Erro ao salvar dados: " + error.message);
    } else {
      setCurrentLogoUrl(uploadedLogoUrl);
      setBannerUrl(uploadedBannerUrl);
      alert("Configurações atualizadas com sucesso!");
    }
  };

  const handleCreateStory = async (ad: Ad) => {
    if (!user) return;
    setPostingStoryId(ad.id);

    const { error } = await supabase.from("stories").insert([
      {
        profile_id: user.id,
        ad_id: ad.id,
        image_url: ad.image_url || currentLogoUrl || "",
        title: ad.title
      }
    ]);

    setPostingStoryId(null);

    if (error) {
      alert("Erro ao publicar destaque: " + error.message);
    } else {
      alert(`✨ Destaque publicado! "${ad.title}" ficará no topo por 24 horas.`);
    }
  };

  const handleDeleteAd = async (adId: string, adTitle: string) => {
    if (!window.confirm(`Excluir o anúncio "${adTitle}"?`)) return;

    const { error } = await supabase.from("ads").delete().eq("id", adId);

    if (!error) {
      setMyAds(myAds.filter(ad => ad.id !== adId));
      alert("Anúncio removido!");
    }
  };

  const activeThemeHex = THEME_OPTIONS.find(t => t.id === themeColor)?.color || "#0F4C81";
  const activeFontFamily = FONT_OPTIONS.find(f => f.id === fontStyle)?.family || "sans-serif";

  if (fetching) {
    return <p style={{ textAlign: "center", padding: "60px", color: "#64748B", fontFamily: "sans-serif" }}>Carregando Painel de Controle...</p>;
  }

  return (
    <main style={{ padding: "20px 10px", maxWidth: 1100, margin: "0 auto", fontFamily: "sans-serif", backgroundColor: "#F8FAFC", minHeight: "100vh" }}>
      
      {/* Botão de Retorno e Ações Rápidas */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button 
          onClick={() => window.location.href = "/"}
          style={{ background: "none", border: "none", color: "#0F4C81", fontWeight: "bold", cursor: "pointer", fontSize: 14 }}
        >
          {"<"} Voltar para o Início
        </button>

        {storeName && (
          <button
            onClick={() => window.open(`/shop/${user?.id}`, "_blank")}
            style={{ padding: "8px 14px", backgroundColor: activeThemeHex, color: "#fff", border: "none", borderRadius: 6, fontWeight: "bold", cursor: "pointer", fontSize: 13 }}
          >
            🌐 Ver Minha Vitrine Pública ↗
          </button>
        )}
      </div>

      {/* Caixa Principal */}
      <div style={{ border: "1px solid #E2E8F0", borderRadius: 12, backgroundColor: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        
        {/* Navegação por Abas */}
        <div style={{ display: "flex", borderBottom: "1px solid #E2E8F0", backgroundColor: "#F1F5F9" }}>
          <button
            onClick={() => setActiveTab("perfil")}
            style={{
              flex: 1, padding: "16px", border: "none",
              background: activeTab === "perfil" ? "#fff" : "none",
              color: activeTab === "perfil" ? activeThemeHex : "#64748B",
              fontWeight: "bold", fontSize: "14px", cursor: "pointer",
              borderBottom: activeTab === "perfil" ? `3px solid ${activeThemeHex}` : "none"
            }}
          >
            📋 Dados da Loja
          </button>
          
          <button
            onClick={() => setActiveTab("vitrine")}
            style={{
              flex: 1, padding: "16px", border: "none",
              background: activeTab === "vitrine" ? "#fff" : "none",
              color: activeTab === "vitrine" ? activeThemeHex : "#64748B",
              fontWeight: "bold", fontSize: "14px", cursor: "pointer",
              borderBottom: activeTab === "vitrine" ? `3px solid ${activeThemeHex}` : "none"
            }}
          >
            🎨 Personalizar Vitrine
          </button>

          <button
            onClick={() => setActiveTab("anuncios")}
            style={{
              flex: 1, padding: "16px", border: "none",
              background: activeTab === "anuncios" ? "#fff" : "none",
              color: activeTab === "anuncios" ? activeThemeHex : "#64748B",
              fontWeight: "bold", fontSize: "14px", cursor: "pointer",
              borderBottom: activeTab === "anuncios" ? `3px solid ${activeThemeHex}` : "none"
            }}
          >
            📦 Meus Anúncios ({myAds.length})
          </button>
        </div>

        <div style={{ padding: 25 }}>

          {/* ABA 1: DADOS DA LOJA */}
          {activeTab === "perfil" && (
            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 600 }}>
              <h2 style={{ fontSize: 20, margin: 0, fontWeight: "bold", color: "#1E293B" }}>Identidade do Comércio</h2>
              
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 6 }}>Nome Fantasia:</label>
                <input 
                  placeholder="Ex: Bolso Forte" 
                  value={storeName} 
                  onChange={(e) => setStoreName(e.target.value)} 
                  required 
                  style={{ width: "100%", padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 14 }} 
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 6 }}>Modelo / Tipo de Vitrine:</label>
                <select
                  value={storeType}
                  onChange={(e) => setStoreType(e.target.value as "marketplace" | "food")}
                  style={{ width: "100%", padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 14, backgroundColor: "#fff", fontWeight: "bold", color: "#1E293B" }}
                >
                  <option value="marketplace">🛍️ Loja / Marketplace (Pergunta simples no WhatsApp)</option>
                  <option value="food">🍟 Comércio Alimentício / Delivery (Carrinho + Pedido Completo no WhatsApp)</option>
                </select>
                <p style={{ fontSize: 12, color: "#64748B", margin: "4px 0 0 0" }}>
                  {storeType === "food" 
                    ? "Permite que os clientes montem o pedido, escolham a quantidade e enviem tudo pronto no seu WhatsApp." 
                    : "Ideal para produtos em geral, serviços ou vitrine de produtos individuais."}
                </p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 6 }}>Cidade Base:</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  style={{ width: "100%", padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 14, backgroundColor: "#fff" }}
                >
                  <option value="">-- Selecione a Cidade --</option>
                  {availableCities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 6 }}>WhatsApp para Contato:</label>
                <input 
                  placeholder="Ex: 18999998888" 
                  value={whatsapp} 
                  onChange={(e) => setWhatsapp(e.target.value)} 
                  style={{ width: "100%", padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 14 }} 
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 6 }}>Biografia / Descrição Curta:</label>
                <textarea 
                  placeholder="Resuma o segmento da sua loja ou principais ofertas..." 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  rows={3}
                  style={{ width: "100%", padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 14, resize: "vertical" }} 
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 6 }}>Logotipo da Loja (Perfil):</label>
                {currentLogoUrl && (
                  <img src={currentLogoUrl} alt="Logo" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", marginBottom: 10, border: "1px solid #E2E8F0" }} />
                )}
                <input type="file" accept="image/*" onChange={(e) => e.target.files && setLogoFile(e.target.files[0])} />
              </div>

              <button type="submit" disabled={loading} style={{ padding: 14, backgroundColor: activeThemeHex, color: "#fff", border: "none", borderRadius: 6, fontSize: 15, fontWeight: "bold", cursor: "pointer", marginTop: 10 }}>
                {loading ? "Salvando..." : "Salvar Configurações"}
              </button>
            </form>
          )}

          {/* ABA 2: PERSONALIZAR VITRINE (SPLIT PANEL + PREVIEW AO VIVO) */}
          {activeTab === "vitrine" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 30 }}>
              
              {/* Painel de Controles */}
              <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <h2 style={{ fontSize: 20, margin: 0, fontWeight: "bold", color: "#1E293B" }}>Aparência & Estilos</h2>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 8 }}>Cor do Tema da Vitrine:</label>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {THEME_OPTIONS.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setThemeColor(theme.id)}
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "50%",
                          backgroundColor: theme.color,
                          border: themeColor === theme.id ? "3px solid #1E293B" : "none",
                          cursor: "pointer",
                          transform: themeColor === theme.id ? "scale(1.1)" : "scale(1)",
                          transition: "all 0.2s"
                        }}
                        title={theme.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 6 }}>Estilo da Fonte:</label>
                  <select
                    value={fontStyle}
                    onChange={(e) => setFontStyle(e.target.value)}
                    style={{ width: "100%", padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 14, backgroundColor: "#fff" }}
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.id} value={font.id}>{font.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 6 }}>Banner de Capa da Vitrine:</label>
                  {bannerUrl && (
                    <img src={bannerUrl} alt="Banner" style={{ width: "100%", height: 80, borderRadius: 6, objectFit: "cover", marginBottom: 10 }} />
                  )}
                  <input type="file" accept="image/*" onChange={(e) => e.target.files && setBannerFile(e.target.files[0])} />
                </div>

                <button type="submit" disabled={loading} style={{ padding: 14, backgroundColor: activeThemeHex, color: "#fff", border: "none", borderRadius: 6, fontSize: 15, fontWeight: "bold", cursor: "pointer" }}>
                  {loading ? "Salvando..." : "Salvar Estilos da Vitrine"}
                </button>
              </form>

              {/* Pré-visualização em Tempo Real */}
              <div style={{ border: "1px solid #E2E8F0", borderRadius: 10, overflow: "hidden", backgroundColor: "#F8FAFC" }}>
                <div style={{ padding: "8px 12px", backgroundColor: "#E2E8F0", fontSize: 11, fontWeight: "bold", color: "#64748B" }}>
                  👁️ PRÉ-VISUALIZAÇÃO EM TEMPO REAL ({storeType === "food" ? "🍟 MODO CARDÁPIO" : "🛍️ MODO VITRINE"})
                </div>

                {/* Banner de Capa no Preview */}
                <div style={{ height: 100, backgroundColor: activeThemeHex, position: "relative", backgroundImage: bannerUrl ? `url(${bannerUrl})` : "none", backgroundSize: "cover", backgroundPosition: "center" }}>
                  {currentLogoUrl ? (
                    <img src={currentLogoUrl} alt="Logo" style={{ width: 60, height: 60, borderRadius: "50%", position: "absolute", bottom: -20, left: 15, border: "3px solid #fff", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 60, height: 60, borderRadius: "50%", backgroundColor: "#fff", color: activeThemeHex, position: "absolute", bottom: -20, left: 15, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 20 }}>
                      {storeName.charAt(0) || "L"}
                    </div>
                  )}
                </div>

                <div style={{ padding: "30px 15px 15px 15px", fontFamily: activeFontFamily }}>
                  <h3 style={{ margin: 0, color: activeThemeHex, fontSize: 18 }}>{storeName || "Nome da Loja"}</h3>
                  <p style={{ margin: "4px 0 10px 0", fontSize: 12, color: "#64748B" }}>{bio || "Descrição da loja..."}</p>

                  {/* Card de Exemplo de Produto */}
                  <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden", backgroundColor: "#fff", marginTop: 15 }}>
                    <div style={{ height: 100, backgroundColor: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontSize: 12 }}>
                      Imagem do Produto
                    </div>
                    <div style={{ padding: 10 }}>
                      <h4 style={{ margin: 0, fontSize: 13 }}>Produto Exemplo</h4>
                      <p style={{ margin: "5px 0", color: activeThemeHex, fontWeight: "bold", fontSize: 14 }}>R$ 99,90</p>
                      
                      {storeType === "food" ? (
                        <button style={{ width: "100%", padding: 6, backgroundColor: activeThemeHex, color: "#fff", border: "none", borderRadius: 4, fontWeight: "bold", fontSize: 11 }}>
                          🛒 Adicionar ao Pedido
                        </button>
                      ) : (
                        <button style={{ width: "100%", padding: 6, backgroundColor: "#22C55E", color: "#fff", border: "none", borderRadius: 4, fontWeight: "bold", fontSize: 11 }}>
                          💬 WhatsApp
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ABA 3: MEUS ANÚNCIOS */}
          {activeTab === "anuncios" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 20, margin: 0, fontWeight: "bold", color: "#1E293B" }}>Estoque / Anúncios</h2>
                  <p style={{ color: "#64748B", margin: "4px 0 0 0", fontSize: 13 }}>Gerencie as publicações exibidas na sua vitrine e no feed.</p>
                </div>
                <button onClick={() => window.location.href = "/create"} style={{ padding: "10px 14px", backgroundColor: activeThemeHex, color: "#fff", border: "none", borderRadius: 6, fontWeight: "bold", cursor: "pointer", fontSize: 13 }}>
                  + Novo Anúncio
                </button>
              </div>

              {loadingAds ? (
                <p style={{ fontSize: 14, color: "#64748B", textAlign: "center" }}>Buscando produtos...</p>
              ) : myAds.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 10px", border: "2px dashed #CBD5E1", borderRadius: 8 }}>
                  <p style={{ color: "#64748B", fontSize: 14, margin: "0 0 15px 0" }}>Você não possui nenhum anúncio ativo.</p>
                  <button onClick={() => window.location.href = "/create"} style={{ padding: "10px 15px", backgroundColor: activeThemeHex, color: "#fff", border: "none", borderRadius: 6, fontWeight: "bold", cursor: "pointer", fontSize: 13 }}>
                    Criar Anúncio Agora
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {myAds.map((ad) => (
                    <div key={ad.id} style={{ display: "flex", gap: 15, padding: 12, border: "1px solid #E2E8F0", borderRadius: 8, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1, minWidth: 200 }}>
                        {ad.image_url ? (
                          <img src={ad.image_url} alt={ad.title} style={{ width: 55, height: 55, borderRadius: 6, objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: 55, height: 55, borderRadius: 6, backgroundColor: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#94A3B8" }}>Sem foto</div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <h4 style={{ margin: 0, fontSize: 14, fontWeight: "bold", color: "#1E293B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ad.title}</h4>
                          <p style={{ margin: "3px 0 0 0", fontSize: 13, color: activeThemeHex, fontWeight: "bold" }}>
                            {ad.price ? `R$ ${ad.price.toFixed(2)}` : "Valor a combinar"}
                          </p>
                          <span style={{ fontSize: 11, color: "#94A3B8" }}>» {ad.city} • {ad.category}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 6, flexShrink: 0, marginTop: 8 }}>
                        <button 
                          onClick={() => handleCreateStory(ad)}
                          disabled={postingStoryId === ad.id}
                          style={{ padding: "8px 10px", backgroundColor: activeThemeHex, color: "#fff", border: "none", borderRadius: 6, fontSize: 11, fontWeight: "bold", cursor: "pointer" }}
                        >
                          {postingStoryId === ad.id ? "Postando..." : "⚡ Destacar 24h"}
                        </button>
                        <button 
                          onClick={() => window.location.href = `/edit-ad/${ad.id}`}
                          style={{ padding: "8px 10px", backgroundColor: "#E2E8F0", color: "#1E293B", border: "none", borderRadius: 6, fontSize: 11, fontWeight: "bold", cursor: "pointer" }}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteAd(ad.id, ad.title)}
                          style={{ padding: "8px 10px", backgroundColor: "#FEE2E2", color: "#DC2626", border: "none", borderRadius: 6, fontSize: 11, fontWeight: "bold", cursor: "pointer" }}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}