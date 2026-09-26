"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [customAdvertiserName, setCustomAdvertiserName] = useState(""); 
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [city, setCity] = useState("Rubiácea-SP");
  
  // 🔄 Estados dos Produtos Afiliados (Tabela correta: affiliate_ads)
  const [affiliateProducts, setAffiliateProducts] = useState<any[]>([]);
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(0);

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
        setCity(savedCity);
      }
    }

    async function fetchData() {
      // 1. Verificar Sessão do Usuário
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

      // 2. Buscar Produtos Afiliados da tabela correta 'affiliate_ads'
      const { data: affiliates } = await supabase
        .from("affiliate_ads")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (affiliates && affiliates.length > 0) {
        setAffiliateProducts(affiliates);
        // Inicializa o lado direito deslocado pela metade para evitar repetição síncrona
        setRightIndex(Math.floor(affiliates.length / 2));
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
    }, 5000);

    return () => clearInterval(interval);
  }, [affiliateProducts.length]);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedUserId) return;

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

    const customCategoryValue = (userType === "store" && storeType === "food") ? subcategory : null;

    const { error } = await supabase.from("ads").insert([
      {
        title,
        description,
        price: rawPriceValue,
        category,
        subcategory: subcategory || null,
        custom_category: customCategoryValue,
        whatsapp: finalWhatsapp,
        city: city,
        image_url: uploadedImageUrl || null,
        user_id: loggedUserId,
        advertiser_name: isAnuncianteComum ? (customAdvertiserName.trim() || null) : null
      },
    ]);

    setLoading(false);

    if (error) {
      alert("Erro ao criar anúncio: " + error.message);
    } else {
      alert("Anúncio publicado com sucesso!");
      window.location.href = "/";
    }
  };

  if (checkingAuth) {
    return <p style={{ textAlign: "center", marginTop: 100, fontFamily: "sans-serif", color: "#64748B" }}>Verificando autenticação...</p>;
  }

  // 🧩 Extração dos produtos correntes para as laterais
  const leftProduct = affiliateProducts.length > 0 ? affiliateProducts[leftIndex] : null;
  const rightProduct = affiliateProducts.length > 0 ? affiliateProducts[rightIndex] : null;

  // Função auxiliar de renderização de card lateral idêntica ao componente original
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
      <div style={{ 
        border: "1px solid #E2E8F0", 
        borderRadius: 14, 
        overflow: "hidden", 
        backgroundColor: "#ffffff", 
        display: "flex", 
        flexDirection: "column", 
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
        width: "100%"
      }}>
        <div style={{ backgroundColor: headerBgColor, padding: "8px 10px", textAlign: "center", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: "bold", color: headerTextColor, textTransform: "uppercase" }}>
            {badgeText}
          </span>
        </div>

        <div style={{ width: "100%", height: 210, backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderBottom: "1px solid #F1F5F9", padding: 8, boxSizing: "border-box" }}>
          <img src={product.image_url} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center" }} />
        </div>

        <div style={{ padding: 14, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: 11, backgroundColor: "#FEF3C7", color: "#D97706", padding: "2px 8px", borderRadius: 6, fontWeight: "bold", display: "inline-block" }}>
              Promoção Recomendada
            </span>
            <h4 style={{ fontSize: 14, margin: "8px 0 6px", color: "#0B2545", fontWeight: "bold", wordBreak: "break-word", lineHeight: "1.3", height: "36px", overflow: "hidden" }}>
              {product.title}
            </h4>
          </div>
          
          <div style={{ marginTop: 6 }}>
            {formattedOldPrice && (
              <span style={{ fontSize: 12, color: "#94A3B8", textDecoration: "line-through", display: "block" }}>
                De {formattedOldPrice}
              </span>
            )}
            <p style={{ fontSize: 17, fontWeight: "bold", color: isAmazon ? "#B45309" : isShopee ? "#EE4D2D" : "#2563EB", margin: "0 0 10px" }}>
              Por {formattedPrice}
            </p>

            <a
              href={product.affiliate_link}
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
                boxShadow: "0 2px 5px rgba(34, 197, 94, 0.3)"
              }}
            >
              🔥 Ver na Loja
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main style={{ padding: "30px 15px", backgroundColor: "#F8FAFC", minHeight: "100vh", fontFamily: "sans-serif" }}>
      {/* Container Principal com Layout de 3 Colunas */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "25px", maxWidth: "1250px", margin: "0 auto" }}>
        
        {/* 📢 Banner Lateral Esquerdo (Sticky) */}
        <aside style={{ display: "none", flexDirection: "column", width: "260px", position: "sticky", top: "20px" }} className="side-banner-left">
          {renderSideCard(leftProduct)}
        </aside>

        {/* 📝 Formulário Central de Criação de Anúncio */}
        <div style={{ flex: "1", maxWidth: "540px", border: "1px solid #E2E8F0", padding: "30px", borderRadius: "12px", backgroundColor: "#fff", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
          <h1 style={{ fontSize: 24, marginBottom: 8, fontWeight: "bold", textAlign: "center", color: "#0F4C81" }}>📢 Criar Novo Anúncio</h1>
          <p style={{ color: "#64748B", marginBottom: 25, fontSize: 14, textAlign: "center" }}>Preencha os campos abaixo para publicar seu produto ou serviço.</p>

          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            
            {isAnuncianteComum && (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 14, fontWeight: "bold", color: "#1E293B" }}>👤 Nome de Quem está Anunciando:</label>
                <input 
                  placeholder="Ex: João da Silva / Dona Maria / Oficina do Zé" 
                  value={customAdvertiserName} 
                  onChange={(e) => setCustomAdvertiserName(e.target.value)} 
                  style={{ padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 15 }} 
                />
                <span style={{ fontSize: 12, color: "#64748B" }}>Aparecerá em destaque no topo do anúncio para contato direto.</span>
              </div>
            )}

            <input placeholder="Título do Anúncio" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 15 }} />
            <textarea placeholder="Descrição Detalhada" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} style={{ padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 15, resize: "none" }} />
            
            <input 
              placeholder="Preço (Ex: 50,00) - Opcional" 
              type="text" 
              value={priceDisplay} 
              onChange={handlePriceChange} 
              style={{ padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 15 }} 
            />
            
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 14, fontWeight: "bold", color: "#1E293B" }}>📁 Selecione a Categoria:</label>
              <select value={category} onChange={handleCategoryChange} required style={{ padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 15, backgroundColor: "#fff", cursor: "pointer" }}>
                <option value="">-- Escolha uma categoria --</option>
                {Object.keys(categoriesData).map((cat) => (
                  <option key={cat} value={cat}>{categoriesData[cat].icon} {cat}</option>
                ))}
              </select>
            </div>

            {userType === "store" && category && storeType === "food" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 14, fontWeight: "bold", color: "#1E293B" }}>🍔 Categoria no Cardápio (Subcategoria):</label>
                <input
                  type="text"
                  placeholder="Ex: Lanches, Bebidas, Porções, Sobremesas..."
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  required
                  style={{ padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 15 }}
                />
              </div>
            ) : (
              category && categoriesData[category]?.subs.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 14, fontWeight: "bold", color: "#1E293B" }}>📂 Escolha uma subcategoria de {category}:</label>
                  <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} required style={{ padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 15, backgroundColor: "#fff", cursor: "pointer" }}>
                    <option value="">-- Escolha uma subcategoria --</option>
                    {categoriesData[category].subs.map((sub) => (
                      <option key={sub} value={sub}>🔹 {sub}</option>
                    ))}
                  </select>
                </div>
              )
            )}

            <input 
              placeholder={profileWhatsapp ? `WhatsApp (Ex: 18999998888 ou texto livre)` : "WhatsApp de Contato (Número ou texto livre)"} 
              value={whatsapp} 
              onChange={(e) => setWhatsapp(e.target.value)} 
              required={!profileWhatsapp}
              style={{ padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 15 }} 
            />
            
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 14, fontWeight: "bold", color: "#1E293B" }}>📸 Foto do Produto (Opcional):</label>
              <input type="file" accept="image/*" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} style={{ fontSize: 14, cursor: "pointer" }} />
              <span style={{ fontSize: 12, color: "#64748B" }}>A imagem será otimizada e redimensionada automaticamente.</span>
            </div>

            <button type="submit" disabled={loading} style={{ padding: 14, backgroundColor: "#0F4C81", color: "white", border: "none", borderRadius: 6, fontSize: 16, fontWeight: "bold", cursor: "pointer", marginTop: 10 }}>
              {loading ? "Otimizando imagem e enviando..." : "🚀 Publicar Anúncio"}
            </button>
          </form>
        </div>

        {/* 📢 Banner Lateral Direito (Sticky) */}
        <aside style={{ display: "none", flexDirection: "column", width: "260px", position: "sticky", top: "20px" }} className="side-banner-right">
          {renderSideCard(rightProduct)}
        </aside>

      </div>

      {/* Regra CSS para exibir as laterais apenas em desktops */}
      <style jsx global>{`
        @media (min-width: 1024px) {
          .side-banner-left, .side-banner-right {
            display: flex !important;
          }
        }
      `}</style>
    </main>
  );
}