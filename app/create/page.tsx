"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Lista de cidades disponíveis no portal
const CITIES_LIST = [
  "Rubiácea-SP",
  "Guararapes-SP",
];

// 📂 Dicionário de Categorias e Subcategorias Atualizado
const categoriesData: Record<string, { icon: string; subs: string[] }> = {
  "Imóveis": {
    icon: "🏠",
    subs: ["Venda de Imóveis", "Aluguel Residencial", "Aluguel Comercial", "Temporada e Chácaras", "Terrenos e Lotes"]
  },
  "Veículos": {
    icon: "🚗",
    subs: ["Carros", "Motos", "Caminhões e Utilitários", "Peças e Acessórios"]
  },
  "Serviços Profissionais": {
    icon: "🛠️",
    subs: ["Reformas e Construção (Pedreiro, Pintor)", "Elétrica e Hidráulica", "Manutenção e Informática", "Limpeza e Jardinagem", "Outros Serviços"]
  },
  "Saúde e Bem-Estar": {
    icon: "❤️",
    subs: ["Clínicas e Consultórios", "Farmácias e Drograrias", "Academias e Personal", "Estética e Beleza"]
  },
  "Alimentação": {
    icon: "🍕", 
    subs: ["Restaurantes e Marmitas", "Lanches e Pizzarias", "Açaí, Sorveterias, Doces e Bolos", "Bebidas e Distribuidoras"]
  },
  "Comércio e Lojas (Produtos)": {
    icon: "🛍️",
    subs: ["Eletrônicos e Celulares", "Roupas, Calçados e Acessórios", "Móveis, Casa e Decoração", "Ferramentas e Materiais de Construção"]
  },
  "Infantil e Brinquedos": {
    icon: "🧸", 
    subs: ["Brinquedos e Jogos", "Roupas Infantis", "Artigos para Bebês", "Material Escolar"]
  },
  "Pets": {
    icon: "🐾",
    subs: ["Animais de Estimação", "Ração e Alimentos", "Acessórios e Pet Shop", "Serviços Veterinários"]
  },
  "Empregos": {
    icon: "💼",
    subs: ["Vagas de Emprego", "Currículos", "Estágios", "Concursos"]
  },
  "Eventos, Lazer e Turismo": {
    icon: "📅",
    subs: ["Festas e Shows", "Rodeios e Eventos Regionais", "Esportes e Lazer", "Hotéis e Pousadas"]
  },
  "Promoções e Utilidade Pública": {
    icon: "📢",
    subs: ["Ofertas do Comércio Local", "Avisos e Utilidade Pública"]
  }
};

// ⚡ Otimizador Inteligente: Converte e redimensiona para Quadrado Perfeito (800x800px)
const compressAndResizeImage = (file: File, targetSize = 800, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("Erro ao processar imagem no navegador."));
      }
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, targetSize, targetSize);
      let width = img.width;
      let height = img.height;
      let renderWidth = targetSize;
      let renderHeight = targetSize;
      let offsetX = 0;
      let offsetY = 0;
      if (width > height) {
        renderHeight = (height * targetSize) / width;
        offsetY = (targetSize - renderHeight) / 2;
      } else {
        renderWidth = (width * targetSize) / height;
        offsetX = (targetSize - renderWidth) / 2;
      }
      ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Falha na compactação da imagem."));
          }
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = (error) => reject(error);
  });
};

export default function CreateAd() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceDisplay, setPriceDisplay] = useState(""); 
  const [rawPriceValue, setRawPriceValue] = useState<number | null>(null); 
  const [isPriceNegotiable, setIsPriceNegotiable] = useState(false); // ✨ Novo estado para Preço a Combinar

  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [customAdvertiserName, setCustomAdvertiserName] = useState(""); 
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // 🏪 Novo estado: Exibir apenas no cardápio / Ocultar do marketplace geral
  const [hideInClassificados, setHideInClassificados] = useState(false);
  
  // 🏷️ Sugestões inteligentes de subcategorias já usadas pelo lojista
  const [existingStoreSubcategories, setExistingStoreSubcategories] = useState<string[]>([]);
  // 🏙️ Estados para Multi-Cidades
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [allCities, setAllCities] = useState(false);
  // 🔄 Estados dos Produtos Afiliados (Laterais e Mobile)
  const [affiliateProducts, setAffiliateProducts] = useState<any[]>([]);
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);
  
  const router = useRouter();
  const [userType, setUserType] = useState<string>("client");
  const [storeType, setStoreType] = useState<"marketplace" | "food">("marketplace");
  const [profileWhatsapp, setProfileWhatsapp] = useState("");
  const [loggedUserId, setLoggedUserId] = useState<string | null>(null);
  const [isAnuncianteComum, setIsAnuncianteComum] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCity = localStorage.getItem("selectedCity");
      if (savedCity) {
        setSelectedCities([savedCity]);
      } else {
        setSelectedCities(["Rubiácea-SP"]);
      }
    }
    async function fetchData() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        alert("⚠️ Você precisa estar logado para publicar um anúncio.");
        router.push("/login");
        return;
      }
      setLoggedUserId(user.id);
      
      const userEmail = user.email || "";
      const comum = userEmail.toLowerCase().endsWith("@anunciante.com");
      setIsAnuncianteComum(comum);

      const { data: profile } = await supabase
        .from("profiles")
        .select("store_type, whatsapp, user_type")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserType(profile.user_type || "client");
        setStoreType(profile.store_type || "marketplace");
        setProfileWhatsapp(profile.whatsapp || "");
        
        if (profile.user_type === "store" && profile.store_type === "food") {
          setCategory("Alimentação");
        }
      }

      // 🔍 Busca subcategorias já cadastradas por este lojista para sugestão rápida
      const { data: userAds } = await supabase
        .from("ads")
        .select("subcategory")
        .eq("user_id", user.id);
      if (userAds) {
        const uniqueSubs = Array.from(new Set(userAds.map(a => a.subcategory).filter(Boolean))) as string[];
        setExistingStoreSubcategories(uniqueSubs);
      }

      const { data: affiliates } = await supabase
        .from("affiliate_ads")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (affiliates && affiliates.length > 0) {
        setAffiliateProducts(affiliates);
        setRightIndex(Math.floor(affiliates.length / 2));
        setMobileIndex(0);
      }
      setCheckingAuth(false);
    }
    fetchData();
  }, [router]);

  // ⏱️ Efeito de Rotação Automática (A cada 5 segundos)
  useEffect(() => {
    if (affiliateProducts.length <= 1) return;
    const interval = setInterval(() => {
      setLeftIndex((prev) => (prev + 1) % affiliateProducts.length);
      setRightIndex((prev) => (prev - 1 + affiliateProducts.length) % affiliateProducts.length);
      setMobileIndex((prev) => (prev + 1) % affiliateProducts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [affiliateProducts.length]);

  // 💰 Máscara Monetária Automática (Padrão R$ X,XX)
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valueOnly = e.target.value.replace(/\D/g, "");
    if (!valueOnly) {
      setPriceDisplay("");
      setRawPriceValue(null);
      return;
    }
    const numericValue = parseInt(valueOnly, 10) / 100;
    setRawPriceValue(numericValue);
    const formatted = numericValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    setPriceDisplay(formatted);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setSubcategory(""); 
  };

  const handleCityToggle = (cityName: string) => {
    if (selectedCities.includes(cityName)) {
      setSelectedCities(selectedCities.filter((c) => c !== cityName));
    } else {
      setSelectedCities([...selectedCities, cityName]);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedUserId) return;

    if (!allCities && selectedCities.length === 0) {
      alert("⚠️ Selecione pelo menos uma cidade ou marque a opção 'Todas as cidades'.");
      return;
    }

    // ✨ Validação: Se for modo food (cardápio), o preço é obrigatório e não pode ser "a combinar"
    const isFoodStore = userType === "store" && storeType === "food";
    if (isFoodStore && isPriceNegotiable) {
      alert("⚠️ Lojas do tipo Cardápio precisam obrigatoriamente informar o preço dos itens.");
      return;
    }
    if (isFoodStore && rawPriceValue === null) {
      alert("⚠️ Por favor, informe o preço do item para o cardápio.");
      return;
    }

    setLoading(true);
    const finalWhatsapp = whatsapp.trim() || profileWhatsapp;
    
    if (!finalWhatsapp) {
      alert("⚠️ Por favor, informe um número ou contato de WhatsApp.");
      setLoading(false);
      return;
    }

    let uploadedImageUrl = "";
    if (imageFile) {
      try {
        const compressedBlob = await compressAndResizeImage(imageFile, 800, 0.8);
        const fileName = `${loggedUserId}-${Date.now()}.jpg`;
        const filePath = `public/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("ads-images")
          .upload(filePath, compressedBlob, {
            contentType: "image/jpeg",
            upsert: true
          });
        if (uploadError) {
          alert("Erro ao subir a foto: " + uploadError.message);
          setLoading(false);
          return;
        }
        const { data } = supabase.storage.from("ads-images").getPublicUrl(filePath);
        uploadedImageUrl = data.publicUrl;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        alert("Erro ao otimizar a imagem: " + errorMessage);
        setLoading(false);
        return;
      }
    }

    const customCategoryValue = isFoodStore ? subcategory : null;
    const primaryCity = selectedCities[0] || "Rubiácea-SP";

    // Se estiver marcado como "preço a combinar", salvamos o preço como null no banco
    const finalPrice = isPriceNegotiable ? null : rawPriceValue;

    const { error } = await supabase.from("ads").insert([
      {
        title,
        description,
        price: finalPrice,
        category: category || "Outros",
        subcategory: subcategory || null,
        custom_category: customCategoryValue,
        whatsapp: finalWhatsapp,
        city: primaryCity,
        cities: selectedCities,
        all_cities: allCities,
        image_url: uploadedImageUrl || null,
        user_id: loggedUserId,
        advertiser_name: isAnuncianteComum ? (customAdvertiserName.trim() || null) : null,
        show_in_classificados: !hideInClassificados, 
      },
    ]);

    setLoading(false);
    if (error) {
      alert("Erro ao criar anúncio: " + error.message);
    } else {
      alert("Item adicionado com sucesso!");
      window.location.href = userType === "store" ? `/shop/${loggedUserId}` : "/";
    }
  };

  if (checkingAuth) {
    return <p style={{ textAlign: "center", marginTop: 100, fontFamily: "sans-serif", color: "#64748B" }}>Verificando autenticação...</p>;
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

  const isFoodStoreMode = userType === "store" && storeType === "food";

  return (
    <main style={{ padding: "30px 15px", backgroundColor: "#F8FAFC", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "25px", maxWidth: "1250px", margin: "0 auto", flexDirection: "column" }}>
        
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "25px", width: "100%" }}>
          {/* 📢 Banner Lateral Esquerdo */}
          <aside style={{ display: "none", flexDirection: "column", width: "260px", position: "sticky", top: "20px" }} className="side-banner-left">
            {renderSideCard(leftProduct)}
          </aside>

          {/* 📝 Formulário Central de Criação de Anúncio */}
          <div style={{ flex: "1", maxWidth: "540px", width: "100%", border: "1px solid #E2E8F0", padding: "30px", borderRadius: "12px", backgroundColor: "#fff", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", boxSizing: "border-box", margin: "0 auto" }}>
            <h1 style={{ fontSize: 24, marginBottom: 8, fontWeight: "bold", textAlign: "center", color: "#0F4C81" }}>📢 Adicionar Produto ou Item</h1>
            <p style={{ color: "#64748B", marginBottom: 25, fontSize: 14, textAlign: "center" }}>Cadastre itens para o seu cardápio/loja ou publique no marketplace.</p>
            
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              
              {isAnuncianteComum && (
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 14, fontWeight: "bold", color: "#1E293B" }}>👤 Nome de Quem está Anunciando:</label>
                  <input 
                    placeholder="Ex: João da Silva / Dona Maria / Oficina do Zé" 
                    value={customAdvertiserName} 
                    onChange={(e) => setCustomAdvertiserName(e.target.value)} 
                    style={{ padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 15, width: "100%", boxSizing: "border-box" }} 
                  />
                </div>
              )}

              <input placeholder="Título do Produto (Ex: Coca Cola Lata 350ml)" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 15, width: "100%", boxSizing: "border-box" }} />
              <textarea placeholder="Descrição Detalhada" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} style={{ padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 15, resize: "none", width: "100%", boxSizing: "border-box" }} />
              
              {/* 💰 CAMPO DE PREÇO E OPÇÃO "PREÇO A COMBINAR" */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input 
                  placeholder={isPriceNegotiable ? "Preço a Combinar (Desativado)" : "Preço (Ex: R$ 5,00)"} 
                  type="text" 
                  value={isPriceNegotiable ? "" : priceDisplay} 
                  onChange={handlePriceChange} 
                  disabled={isPriceNegotiable}
                  required={!isPriceNegotiable}
                  style={{ 
                    padding: 12, 
                    border: "1px solid #CBD5E1", 
                    borderRadius: 6, 
                    fontSize: 15, 
                    width: "100%", 
                    boxSizing: "border-box", 
                    fontWeight: "bold", 
                    color: "#0F4C81",
                    backgroundColor: isPriceNegotiable ? "#F1F5F9" : "#fff",
                    cursor: isPriceNegotiable ? "not-allowed" : "text"
                  }} 
                />

                {/* Exibe o checkbox de preço a combinar apenas para anúncios gerais/lojas que não são do tipo food */}
                {!isFoodStoreMode && (
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#334155", cursor: "pointer", fontWeight: "500" }}>
                    <input 
                      type="checkbox"
                      checked={isPriceNegotiable}
                      onChange={(e) => {
                        setIsPriceNegotiable(e.target.checked);
                        if (e.target.checked) {
                          setPriceDisplay("");
                          setRawPriceValue(null);
                        }
                      }}
                      style={{ width: 15, height: 15, accentColor: "#0F4C81", cursor: "pointer" }}
                    />
                    🤝 Preço a combinar (Negociar no WhatsApp)
                  </label>
                )}
              </div>
              
              {/* 🏪 OPÇÃO DE EXIBIR NO MARKETPLACE */}
              <div style={{ backgroundColor: "#F1F5F9", padding: "12px 14px", borderRadius: 8, border: "1px solid #CBD5E1" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: "bold", color: "#0F4C81", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={hideInClassificados} 
                    onChange={(e) => setHideInClassificados(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#0F4C81", cursor: "pointer" }}
                  />
                  📦 Ocultar do Feed Geral (Exibir apenas no Cardápio / Loja Virtual)
                </label>
                <span style={{ fontSize: 11, color: "#64748B", display: "block", marginTop: 4, marginLeft: 24 }}>
                  Ideal para itens de cardápio (bebidas, adicionais, etc.) que não precisam poluir o classificados geral.
                </span>
              </div>

              {/* 🏙️ SELETOR DE CIDADES */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, backgroundColor: "#F8FAFC", padding: "14px", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
                <label style={{ fontSize: 14, fontWeight: "bold", color: "#1E293B" }}>📍 Onde este item deve estar ativo?</label>
                
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: "bold", color: "#0F4C81", cursor: "pointer", marginBottom: 4 }}>
                  <input 
                    type="checkbox" 
                    checked={allCities} 
                    onChange={(e) => setAllCities(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#0F4C81", cursor: "pointer" }}
                  />
                  🌐 Disponível em TODAS as cidades
                </label>
                {!allCities && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 4, marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: "#64748B" }}>Cidades específicas:</span>
                    {CITIES_LIST.map((city) => (
                      <label key={city} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#334155", cursor: "pointer" }}>
                        <input 
                          type="checkbox" 
                          checked={selectedCities.includes(city)}
                          onChange={() => handleCityToggle(city)}
                          style={{ width: 15, height: 15, accentColor: "#0F4C81", cursor: "pointer" }}
                        />
                        {city}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 14, fontWeight: "bold", color: "#1E293B" }}>📁 Categoria Principal:</label>
                <select value={category} onChange={handleCategoryChange} required style={{ padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 15, backgroundColor: "#fff", cursor: "pointer", width: "100%", boxSizing: "border-box" }}>
                  <option value="">-- Escolha uma categoria --</option>
                  {Object.keys(categoriesData).map((cat) => (
                    <option key={cat} value={cat}>{categoriesData[cat].icon} {cat}</option>
                  ))}
                </select>
              </div>

              {userType === "store" && category && storeType === "food" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, backgroundColor: "#FFF7ED", padding: 12, borderRadius: 8, border: "1px solid #FDBA74" }}>
                  <label style={{ fontSize: 14, fontWeight: "bold", color: "#9A3412" }}>🍔 Categoria no Cardápio (Ex: Lanches, Bebidas, Pizzas):</label>
                  <input
                    type="text"
                    placeholder="Digite ou selecione a seção do cardápio..."
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    required
                    style={{ padding: 10, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 14, width: "100%", boxSizing: "border-box", backgroundColor: "#fff" }}
                  />
                  {existingStoreSubcategories.length > 0 && (
                    <div>
                      <span style={{ fontSize: 11, color: "#9A3412", display: "block", marginBottom: 4 }}>Categorias já criadas por você (clique para usar):</span>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {existingStoreSubcategories.map((sub) => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => setSubcategory(sub)}
                            style={{ background: "#EA580C", color: "#fff", border: "none", padding: "4px 10px", borderRadius: 12, fontSize: 11, cursor: "pointer", fontWeight: "bold" }}
                          >
                            + {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                category && categoriesData[category]?.subs.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <label style={{ fontSize: 14, fontWeight: "bold", color: "#1E293B" }}>📂 Subcategoria:</label>
                    <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} required style={{ padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 15, backgroundColor: "#fff", cursor: "pointer", width: "100%", boxSizing: "border-box" }}>
                      <option value="">-- Escolha uma subcategoria --</option>
                      {categoriesData[category].subs.map((sub) => (
                        <option key={sub} value={sub}>🔹 {sub}</option>
                      ))}
                    </select>
                  </div>
                )
              )}

              <input 
                placeholder="WhatsApp para contato" 
                value={whatsapp} 
                onChange={(e) => setWhatsapp(e.target.value)} 
                required={!profileWhatsapp}
                style={{ padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 15, width: "100%", boxSizing: "border-box" }} 
              />
              
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 14, fontWeight: "bold", color: "#1E293B" }}>📸 Foto do Produto (Opcional):</label>
                <input type="file" accept="image/*" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} style={{ fontSize: 14, cursor: "pointer", width: "100%", boxSizing: "border-box" }} />
              </div>

              <button type="submit" disabled={loading} style={{ padding: 14, backgroundColor: "#0F4C81", color: "white", border: "none", borderRadius: 6, fontSize: 16, fontWeight: "bold", cursor: "pointer", marginTop: 10, width: "100%" }}>
                {loading ? "Salvando..." : "🚀 Salvar e Publicar Item"}
              </button>
            </form>
          </div>

          {/* 📢 Banner Lateral Direito */}
          <aside style={{ display: "none", flexDirection: "column", width: "260px", position: "sticky", top: "20px" }} className="side-banner-right">
            {renderSideCard(rightProduct)}
          </aside>
        </div>

        {/* 📱 Banner exclusivo para Celular */}
        <div style={{ width: "100%", maxWidth: "540px", margin: "20px auto 0 auto" }} className="mobile-banner-container">
          {renderSideCard(mobileProduct)}
        </div>
      </div>
    </main>
  );
}