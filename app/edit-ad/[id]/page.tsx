"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";

const CITIES_LIST = [
  "Rubiácea-SP",
  "Guararapes-SP",
];

export default function EditAdPage() {
  const router = useRouter();
  const params = useParams();
  const adId = params?.id as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceDisplay, setPriceDisplay] = useState("");
  const [rawPriceValue, setRawPriceValue] = useState<number | null>(null);
  const [isPriceNegotiable, setIsPriceNegotiable] = useState(false); // ✨ Novo estado para Preço a Combinar

  const [category, setCategory] = useState("Produtos");
  const [subcategory, setSubcategory] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null); // 📸 Estado para novo arquivo de foto selecionado
  
  // 🏪 Estado para verificar se o usuário é lojista e ocultar do feed principal (Classificados)
  const [isStoreOwner, setIsStoreOwner] = useState(false);
  const [hideInClassificados, setHideInClassificados] = useState(false);
  
  // 🏷️ Sugestões inteligentes de subcategorias já usadas pelo lojista
  const [existingStoreSubcategories, setExistingStoreSubcategories] = useState<string[]>([]);

  // 🏙️ Estados para Multi-Cidades
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [allCities, setAllCities] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carrega os dados atuais do anúncio ao abrir a página
  useEffect(() => {
    async function fetchAd() {
      if (!adId) return;
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("id", adId)
        .single();

      if (error || !data) {
        alert("Anúncio não encontrado.");
        router.push("/profile");
        return;
      }

      setTitle(data.title || "");
      setDescription(data.description || "");
      setCategory(data.category || "Produtos");
      setSubcategory(data.subcategory || "");
      setWhatsapp(data.whatsapp || "");
      setImageUrl(data.image_url || "");
      setHideInClassificados(data.show_in_classificados === false);

      // Carrega o preço formatado corretamente na abertura ou define como a combinar se for null
      if (data.price !== null && data.price !== undefined) {
        setRawPriceValue(data.price);
        setIsPriceNegotiable(false);
        setPriceDisplay(
          data.price.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })
        );
      } else {
        setPriceDisplay("");
        setRawPriceValue(null);
        setIsPriceNegotiable(true);
      }
      
      setAllCities(data.all_cities || false);
      setSelectedCities(data.cities || (data.city ? [data.city] : ["Rubiácea-SP"]));

      // 🔍 Verifica o perfil do usuário para saber se é Lojista ou Anunciante Comum
      if (data.user_id) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_type, store_name, name")
          .eq("id", data.user_id)
          .maybeSingle();

        if (profileData) {
          const sName = (profileData.store_name || profileData.name || "").toLowerCase();
          const isRealStore =
            profileData.user_type !== "client" &&
            !sName.startsWith("anunciante") &&
            sName.trim() !== "";
          setIsStoreOwner(isRealStore);
        }
      }

      // 🔍 Busca subcategorias já cadastradas por este lojista para sugestão rápida
      const { data: userAds } = await supabase
        .from("ads")
        .select("subcategory")
        .eq("user_id", data.user_id);

      if (userAds) {
        const uniqueSubs = Array.from(new Set(userAds.map(a => a.subcategory).filter(Boolean))) as string[];
        setExistingStoreSubcategories(uniqueSubs);
      }

      setLoading(false);
    }
    fetchAd();
  }, [adId, router]);

  // 💰 Máscara Monetária Automática ao Editar
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

  const handleCityToggle = (cityName: string) => {
    if (selectedCities.includes(cityName)) {
      setSelectedCities(selectedCities.filter((c) => c !== cityName));
    } else {
      setSelectedCities([...selectedCities, cityName]);
    }
  };

  // 📸 Seleção de foto da galeria/computador com pré-visualização imediata
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  // Função para salvar as alterações no Supabase
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allCities && selectedCities.length === 0) {
      alert("⚠️ Selecione pelo menos uma cidade ou marque a opção 'Todas as cidades'.");
      return;
    }
    setSaving(true);
    const primaryCity = selectedCities[0] || "Rubiácea-SP";
    
    // Se estiver marcado como "preço a combinar", salvamos o preço como null no banco
    const finalPrice = isPriceNegotiable ? null : rawPriceValue;

    let finalImageUrl = imageUrl;

    // 📤 Se o usuário escolheu uma nova imagem da galeria/computador, faz o upload no Supabase Storage
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `public/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("ads-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        alert("Erro ao enviar a nova foto: " + uploadError.message);
        setSaving(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("ads-images")
        .getPublicUrl(fileName);

      finalImageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from("ads")
      .update({
        title,
        description,
        price: finalPrice,
        category,
        subcategory: isStoreOwner ? (subcategory.trim() || null) : null,
        whatsapp,
        image_url: finalImageUrl,
        city: primaryCity,
        cities: selectedCities,
        all_cities: allCities,
        show_in_classificados: isStoreOwner ? !hideInClassificados : true, 
      })
      .eq("id", adId);

    setSaving(false);
    if (error) {
      alert("Erro ao atualizar o anúncio: " + error.message);
    } else {
      alert("Anúncio atualizado com sucesso!");
      router.push("/profile");
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 50, color: "#64748B" }}>Carregando dados do anúncio...</p>;
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20, backgroundColor: "#fff", borderRadius: 12, border: "1px solid #CBD5E1", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#0F4C81", marginBottom: 20 }}>Editar Anúncio ou Item</h2>
      
      <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 5, color: "#334155" }}>Título do Anúncio:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 14, boxSizing: "border-box" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 5, color: "#334155" }}>Descrição:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 14, resize: "vertical", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 5, color: "#334155" }}>Preço:</label>
            <input
              type="text"
              value={isPriceNegotiable ? "" : priceDisplay}
              onChange={handlePriceChange}
              placeholder={isPriceNegotiable ? "Preço a Combinar (Desativado)" : "R$ 0,00"}
              disabled={isPriceNegotiable}
              required={!isPriceNegotiable}
              style={{ 
                width: "100%", 
                padding: "10px", 
                borderRadius: 6, 
                border: "1px solid #CBD5E1", 
                fontSize: 14, 
                boxSizing: "border-box", 
                fontWeight: "bold", 
                color: "#0F4C81",
                backgroundColor: isPriceNegotiable ? "#F1F5F9" : "#fff",
                cursor: isPriceNegotiable ? "not-allowed" : "text"
              }}
            />
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#334155", cursor: "pointer", fontWeight: "500", marginTop: 6 }}>
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
                style={{ width: 14, height: 14, accentColor: "#0F4C81", cursor: "pointer" }}
              />
              🤝 Preço a combinar (Negociar no WhatsApp)
            </label>
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 5, color: "#334155" }}>Categoria:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 14, backgroundColor: "#fff", boxSizing: "border-box" }}
            >
              <option value="Produtos">Produtos</option>
              <option value="Alimentação">Alimentação</option>
              <option value="Serviços Profissionais">Serviços Profissionais</option>
              <option value="Saúde e Bem-Estar">Saúde e Bem-Estar</option>
              <option value="Imóveis">Imóveis</option>
              <option value="Veículos">Veículos</option>
              <option value="Empregos">Empregos</option>
              <option value="Promoções e Utilidade Pública">Promoções e Utilidade Pública</option>
              <option value="Eventos, Lazer e Turismo">Eventos, Lazer e Turismo</option>
            </select>
          </div>
        </div>

        {/* 🏷️ CATEGORIA DO CARDÁPIO E OPÇÃO DE OCULTAR DO FEED (EXCLUSIVO PARA LOJISTAS) */}
        {isStoreOwner && (
          <>
            <div style={{ backgroundColor: "#FFF7ED", padding: 12, borderRadius: 8, border: "1px solid #FDBA74" }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 5, color: "#9A3412" }}>Categoria no Cardápio / Subcategoria:</label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="Ex: Lanches, Bebidas, Pizzas..."
                style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 14, backgroundColor: "#fff", boxSizing: "border-box" }}
              />
              {existingStoreSubcategories.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: "#9A3412", display: "block", marginBottom: 4 }}>Categorias existentes (clique para usar):</span>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {existingStoreSubcategories.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setSubcategory(sub)}
                        style={{ background: "#EA580C", color: "#fff", border: "none", padding: "3px 8px", borderRadius: 10, fontSize: 11, cursor: "pointer", fontWeight: "bold" }}
                      >
                        + {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
            </div>
          </>
        )}

        {/* 🏙️ SELETOR MÚLTIPLO DE CIDADES */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, backgroundColor: "#F8FAFC", padding: "14px", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
          <label style={{ fontSize: 14, fontWeight: "bold", color: "#1E293B" }}>📍 Onde este anúncio deve aparecer?</label>
          
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: "bold", color: "#0F4C81", cursor: "pointer", marginBottom: 4 }}>
            <input 
              type="checkbox" 
              checked={allCities} 
              onChange={(e) => setAllCities(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "#0F4C81", cursor: "pointer" }}
            />
            🌐 Exibir em TODAS as cidades atuais e futuras
          </label>
          {!allCities && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 4, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: "#64748B" }}>Ou selecione cidades específicas:</span>
              {CITIES_LIST.map((cityName) => (
                <label key={cityName} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#334155", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={selectedCities.includes(cityName)}
                    onChange={() => handleCityToggle(cityName)}
                    style={{ width: 15, height: 15, accentColor: "#0F4C81", cursor: "pointer" }}
                  />
                  {cityName}
                </label>
              ))}
            </div>
          )}
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 5, color: "#334155" }}>WhatsApp para Contato:</label>
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 14, boxSizing: "border-box" }}
          />
        </div>

        {/* 📸 SELETOR DE FOTO DA GALERIA / COMPUTADOR COM PRÉ-VISUALIZAÇÃO */}
        <div style={{ backgroundColor: "#F8FAFC", padding: 14, borderRadius: 8, border: "1px solid #CBD5E1" }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 8, color: "#334155" }}>📸 Foto do Anúncio:</label>
          
          {imageUrl && (
            <div style={{ marginBottom: 12, textAlign: "center", backgroundColor: "#fff", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0" }}>
              <img
                src={imageUrl}
                alt="Pré-visualização do anúncio"
                style={{ maxHeight: 180, maxWidth: "100%", objectFit: "contain", borderRadius: 6 }}
              />
            </div>
          )}

          <label
            style={{
              display: "inline-block",
              padding: "10px 16px",
              backgroundColor: "#0F4C81",
              color: "#fff",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            📁 Escolher nova foto (Galeria ou Computador)
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>
          {imageFile && (
            <span style={{ display: "block", fontSize: 12, color: "#16A34A", marginTop: 6, fontWeight: "bold" }}>
              ✅ Nova foto selecionada: {imageFile.name}
            </span>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
          <button
            type="button"
            onClick={() => router.push("/profile")}
            style={{ padding: "10px 16px", backgroundColor: "#E2E8F0", border: "none", borderRadius: 6, fontWeight: "bold", cursor: "pointer", color: "#334155" }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{ padding: "10px 20px", backgroundColor: "#0284C7", color: "#fff", border: "none", borderRadius: 6, fontWeight: "bold", cursor: "pointer" }}
          >
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}