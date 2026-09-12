"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Ad {
  id: string;
  title: string;
  price: number;
  status: string;
  created_at: string;
}

export default function MeusAnunciosPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserAds() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login-celular");
        return;
      }

      // Busca apenas os anúncios do usuário logado
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setAds(data);
      }
      setLoading(false);
    }

    fetchUserAds();
  }, [router]);

  const handleMarkAsSold = async (id: string) => {
    const { error } = await supabase
      .from("ads")
      .update({ status: "sold" })
      .eq("id", id);

    if (!error) {
      setAds(ads.map(ad => ad.id === id ? { ...ad, status: "sold" } : ad));
      alert("Anúncio marcado como vendido e ocultado da vitrine!");
    } else {
      alert("Erro ao atualizar o anúncio.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir permanentemente este anúncio?")) {
      const { error } = await supabase
        .from("ads")
        .delete()
        .eq("id", id);

      if (!error) {
        setAds(ads.filter(ad => ad.id !== id));
      } else {
        alert("Erro ao excluir o anúncio.");
      }
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 50 }}>Carregando seus anúncios...</p>;
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 20, fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#0F4C81", marginBottom: 20 }}>Meus Anúncios</h2>

      {ads.length === 0 ? (
        <p style={{ color: "#64748B" }}>Você ainda não possui anúncios cadastrados.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          {ads.map((ad) => (
            <div
              key={ad.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 15,
                borderRadius: 8,
                border: "1px solid #CBD5E1",
                backgroundColor: ad.status === "sold" ? "#F1F5F9" : "#FFF",
              }}
            >
              <div>
                <h4 style={{ margin: "0 0 5px 0", fontSize: 18 }}>{ad.title}</h4>
                <p style={{ margin: 0, color: "#64748B", fontSize: 14 }}>
                  Preço: R$ {ad.price} | Status: <strong>{ad.status === "sold" ? "Vendido" : "Ativo"}</strong>
                </p>
                <p style={{ margin: "5px 0 0 0", fontSize: 12, color: "#94A3B8" }}>
                  Publicado em: {new Date(ad.created_at).toLocaleDateString("pt-BR")} (Validade: 30 dias)
                </p>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                {ad.status !== "sold" && (
                  <button
                    onClick={() => handleMarkAsSold(ad.id)}
                    style={{
                      backgroundColor: "#16A34A",
                      color: "#fff",
                      border: "none",
                      padding: "8, 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Marcar como Vendido
                  </button>
                )}
                <button
                  onClick={() => handleDelete(ad.id)}
                  style={{
                    backgroundColor: "#DC2626",
                    color: "#fff",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}