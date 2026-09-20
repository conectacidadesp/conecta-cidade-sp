"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// 📂 Dicionário de Categorias e Subcategorias Atualizado e Sem Duplicidades
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

// ⚡ Função pura em Canvas para Redimensionar e Comprimir Fotos no Navegador
const compressAndResizeImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return reject(new Error("Erro ao processar imagem no navegador."));
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Falha na compressão da imagem."));
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
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [city, setCity] = useState("Rubiácea-SP");
  
  const router = useRouter();

  const [userType, setUserType] = useState<string>("client");
  const [storeType, setStoreType] = useState<"marketplace" | "food">("marketplace");
  const [profileWhatsapp, setProfileWhatsapp] = useState("");
  const [loggedUserId, setLoggedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCity = localStorage.getItem("selectedCity");
      if (savedCity) {
        setCity(savedCity);
      }
    }

    async function checkUserSession() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        alert("⚠️ Você precisa estar logado para publicar um anúncio.");
        router.push("/login");
        return;
      }

      setLoggedUserId(user.id);

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

      setCheckingAuth(false);
    }

    checkUserSession();
  }, [router]);

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
      alert("⚠️ Por favor, informe um número de WhatsApp com DDD para o anúncio.");
      setLoading(false);
      return;
    }

    let uploadedImageUrl = "";

    if (imageFile) {
      try {
        const compressedBlob = await compressAndResizeImage(imageFile, 800, 800, 0.8);
        const fileName = `${Math.random()}.jpg`;
        const filePath = `public/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("ads-images")
          .upload(filePath, compressedBlob, {
            contentType: "image/jpeg"
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
        price: price ? parseFloat(price) : null,
        category,
        subcategory: subcategory || null,
        custom_category: customCategoryValue,
        whatsapp: finalWhatsapp,
        city: city,
        image_url: uploadedImageUrl || null,
        user_id: loggedUserId
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

  return (
    <main style={{ padding: "20px 10px", maxWidth: 500, margin: "0 auto", fontFamily: "sans-serif", backgroundColor: "#F8FAFC", minHeight: "100vh" }}>
      <div style={{ border: "1px solid #E2E8F0", padding: 25, borderRadius: 12, backgroundColor: "#fff", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
        <h1 style={{ fontSize: 24, marginBottom: 8, fontWeight: "bold", textAlign: "center", color: "#0F4C81" }}>📢 Criar Novo Anúncio</h1>
        <p style={{ color: "#64748B", marginBottom: 25, fontSize: 14, textAlign: "center" }}>Preencha os campos abaixo para publicar seu produto ou serviço.</p>

        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input placeholder="Título do Anúncio" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 15 }} />
          <textarea placeholder="Descrição Detalhada" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} style={{ padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 15, resize: "none" }} />
          <input placeholder="Preço em R$ (Opcional)" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} style={{ padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 15 }} />
          
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
            placeholder={profileWhatsapp ? `WhatsApp (Opcional - Padrão: ${profileWhatsapp})` : "WhatsApp com DDD (Apenas números)"} 
            value={whatsapp} 
            onChange={(e) => setWhatsapp(e.target.value)} 
            required={!profileWhatsapp}
            style={{ padding: 12, border: "1px solid #CBD5E1", borderRadius: 6, fontSize: 15 }} 
          />
          
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 14, fontWeight: "bold", color: "#1E293B" }}>📸 Foto do Produto (Opcional):</label>
            <input type="file" accept="image/*" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} style={{ fontSize: 14, cursor: "pointer" }} />
          </div>

          <button type="submit" disabled={loading} style={{ padding: 14, backgroundColor: "#0F4C81", color: "white", border: "none", borderRadius: 6, fontSize: 16, fontWeight: "bold", cursor: "pointer", marginTop: 10 }}>
            {loading ? "Otimizando imagem e enviando..." : "🚀 Publicar Anúncio"}
          </button>
        </form>
      </div>
    </main>
  );
}