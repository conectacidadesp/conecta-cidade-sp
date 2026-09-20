"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";

export default function EditAdPage() {
  const router = useRouter();
  const params = useParams();
  const adId = params?.id as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Produtos");
  const [whatsapp, setWhatsapp] = useState("");
  const [imageUrl, setImageUrl] = useState("");
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
      setPrice(data.price ? data.price.toString() : "");
      setCategory(data.category || "Produtos");
      setWhatsapp(data.whatsapp || "");
      setImageUrl(data.image_url || "");
      setLoading(false);
    }

    fetchAd();
  }, [adId, router]);

  // Função para salvar as alterações no Supabase
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("ads")
      .update({
        title,
        description,
        price: price ? parseFloat(price) : null,
        category,
        whatsapp,
        image_url: imageUrl,
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
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20, backgroundColor: "#fff", borderRadius: 12, border: "1px solid #CBD5E1", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
      <h2 style={{ color: "#0F4C81", marginBottom: 20 }}>Editar Anúncio</h2>

      <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 5, color: "#334155" }}>Título do Anúncio:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 14 }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 5, color: "#334155" }}>Descrição:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 14 }}
          />
        </div>

        <div style={{ display: "flex", gap: 15 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 5, color: "#334155" }}>Preço (R$):</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 14 }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 5, color: "#334155" }}>Categoria:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 14, backgroundColor: "#fff" }}
            >
              <option value="Produtos">Produtos</option>
              <option value="Alimentação">Alimentação</option>
              <option value="Serviços">Serviços</option>
              <option value="Empregos">Empregos</option>
              <option value="Promoções">Promoções</option>
              <option value="Eventos">Eventos</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 5, color: "#334155" }}>WhatsApp para Contato:</label>
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 14 }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 5, color: "#334155" }}>URL da Imagem:</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 14 }}
          />
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