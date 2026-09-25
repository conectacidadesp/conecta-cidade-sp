"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface AffiliateAd {
  id: string;
  title: string;
  price: number | null;
  old_price: number | null;
  image_url: string;
  affiliate_link: string;
  platform: string;
  is_active: boolean;
}

export default function AdminAffiliatesPage() {
  const [ads, setAds] = useState<AffiliateAd[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do formulário
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [displayPrice, setDisplayPrice] = useState("");
  const [displayOldPrice, setDisplayOldPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [platform, setPlatform] = useState("shopee");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  async function fetchAds() {
    setLoading(true);
    const { data } = await supabase
      .from("affiliate_ads")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAds(data);
    setLoading(false);
  }

  // Função de Máscara Monetária Brasileira (R$ 0,00)
  const formatMoneyInput = (value: string) => {
    const cleanDigits = value.replace(/\D/g, "");
    if (!cleanDigits) return "";
    const numberValue = Number(cleanDigits) / 100;
    return numberValue.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parseMoneyToFloat = (formattedValue: string) => {
    if (!formattedValue) return null;
    const clean = formattedValue.replace(/\./g, "").replace(",", ".");
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? null : parsed;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const formatted = formatMoneyInput(e.target.value);
    setter(formatted);
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl || !affiliateLink) {
      alert("Preencha ao menos o Título, a Imagem e o Link de Afiliado!");
      return;
    }

    setSubmitting(true);

    const payload = {
      title,
      price: parseMoneyToFloat(displayPrice),
      old_price: parseMoneyToFloat(displayOldPrice),
      image_url: imageUrl,
      affiliate_link: affiliateLink,
      platform,
    };

    if (editingId) {
      // Atualizar registro existente
      const { error } = await supabase
        .from("affiliate_ads")
        .update(payload)
        .eq("id", editingId);

      setSubmitting(false);

      if (error) {
        alert("Erro ao atualizar: " + error.message);
      } else {
        alert("Produto atualizado com sucesso!");
        resetForm();
        fetchAds();
      }
    } else {
      // Inserir novo registro
      const { error } = await supabase.from("affiliate_ads").insert([
        { ...payload, is_active: true }
      ]);

      setSubmitting(false);

      if (error) {
        alert("Erro ao cadastrar: " + error.message);
      } else {
        alert("Produto de afiliado cadastrado com sucesso!");
        resetForm();
        fetchAds();
      }
    }
  };

  const handleEditClick = (ad: AffiliateAd) => {
    setEditingId(ad.id);
    setTitle(ad.title);
    setDisplayPrice(ad.price ? ad.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "");
    setDisplayOldPrice(ad.old_price ? ad.old_price.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "");
    setImageUrl(ad.image_url);
    setAffiliateLink(ad.affiliate_link);
    setPlatform(ad.platform || "shopee");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDisplayPrice("");
    setDisplayOldPrice("");
    setImageUrl("");
    setAffiliateLink("");
    setPlatform("shopee");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    const { error } = await supabase.from("affiliate_ads").delete().eq("id", id);
    if (error) {
      alert("Erro ao excluir: " + error.message);
    } else {
      if (editingId === id) resetForm();
      fetchAds();
    }
  };

  return (
    <div>
      <h2 style={{ color: "#0B2545", marginBottom: 5 }}>💰 Gerenciar Produtos de Afiliados</h2>
      <p style={{ color: "#64748B", fontSize: 14, marginBottom: 30 }}>
        Cadastre e edite os produtos da Shopee, Mercado Livre e Amazon que vão rodar dinamicamente pelo site.
      </p>

      {/* Formulário de Cadastro / Edição */}
      <div style={{ backgroundColor: "#ffffff", padding: 24, borderRadius: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom: 40, border: editingId ? "2px solid #F97316" : "1px solid transparent" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
          <h4 style={{ margin: 0, color: "#1E293B" }}>
            {editingId ? "✏️ Editando Produto Selecionado" : "➕ Adicionar Novo Produto"}
          </h4>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              style={{ backgroundColor: "#E2E8F0", color: "#475569", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: "bold" }}
            >
              ❌ Cancelar Edição
            </button>
          )}
        </div>

        <form onSubmit={handleSaveAd} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          
          <div style={{ gridColumn: "span 2" }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 5, color: "#334155" }}>Título do Produto:</label>
            <input
              type="text"
              placeholder="Ex: Fone de Ouvido Bluetooth Sem Fio Gamer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #CBD5E1", boxSizing: "border-box" }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 5, color: "#334155" }}>Preço Atual (R$):</label>
            <input
              type="text"
              placeholder="0,00"
              value={displayPrice}
              onChange={(e) => handlePriceChange(e, setDisplayPrice)}
              style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #CBD5E1", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 5, color: "#334155" }}>Preço Antigo / Riscado (Opcional):</label>
            <input
              type="text"
              placeholder="0,00"
              value={displayOldPrice}
              onChange={(e) => handlePriceChange(e, setDisplayOldPrice)}
              style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #CBD5E1", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 5, color: "#334155" }}>Link Direto da Imagem:</label>
            <input
              type="text"
              placeholder="Cole o link da foto do produto"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #CBD5E1", boxSizing: "border-box" }}
              required
            />
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 5, color: "#334155" }}>Seu Link de Afiliado (Shopee / ML / Amazon):</label>
            <input
              type="text"
              placeholder="Cole seu link rastreado de afiliado aqui"
              value={affiliateLink}
              onChange={(e) => setAffiliateLink(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #CBD5E1", boxSizing: "border-box" }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 5, color: "#334155" }}>Plataforma:</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #CBD5E1", boxSizing: "border-box", backgroundColor: "#fff" }}
            >
              <option value="shopee">Shopee</option>
              <option value="mercadolivre">Mercado Livre</option>
              <option value="amazon">Amazon</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{ width: "100%", padding: "11px", backgroundColor: editingId ? "#0284C7" : "#F97316", color: "#fff", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}
            >
              {submitting ? "Salvando..." : editingId ? "💾 Atualizar Produto" : "💾 Salvar Produto"}
            </button>
          </div>

        </form>
      </div>

      {/* Lista de Produtos Cadastrados */}
      <h3 style={{ color: "#0B2545", marginBottom: 15 }}>📋 Produtos Cadastrados ({ads.length})</h3>
      {loading ? (
        <p style={{ color: "#64748B" }}>Carregando produtos...</p>
      ) : ads.length === 0 ? (
        <p style={{ color: "#64748B" }}>Nenhum produto cadastrado ainda.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ads.map((ad) => (
            <div key={ad.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff", padding: 14, borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <img src={ad.image_url} alt="" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 6 }} />
                <div>
                  <span style={{ fontSize: 10, backgroundColor: "#E2E8F0", padding: "2px 6px", borderRadius: 4, fontWeight: "bold", textTransform: "uppercase" }}>{ad.platform}</span>
                  <h4 style={{ margin: "4px 0 0", fontSize: 14, color: "#1E293B" }}>{ad.title}</h4>
                  <span style={{ fontSize: 13, color: "#0088FF", fontWeight: "bold" }}>
                    {ad.price ? `R$ ${ad.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "R$ 0,00"}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => handleEditClick(ad)}
                  style={{ backgroundColor: "#E0F2FE", color: "#0284C7", border: "none", padding: "8px 12px", borderRadius: 6, fontWeight: "bold", cursor: "pointer", fontSize: 12 }}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDelete(ad.id)}
                  style={{ backgroundColor: "#FEE2E2", color: "#DC2626", border: "none", padding: "8px 12px", borderRadius: 6, fontWeight: "bold", cursor: "pointer", fontSize: 12 }}
                >
                  🗑️ Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}