"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface Story {
  id: string;
  image_url: string;
  title: string | null;
  ad_id: string;
  created_at: string;
  profile_id?: string;
  user_id?: string;
  profiles: {
    id?: string;
    store_name: string | null;
    logo_url: string | null;
    city?: string | null;
  } | null;
}

interface GroupedStore {
  storeKey: string;
  storeName: string;
  logoUrl: string;
  stories: Story[];
}

export default function StoriesBar({ selectedCity }: { selectedCity?: string }) {
  const [groupedStores, setGroupedStores] = useState<GroupedStore[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para o Modal de Visualização
  const [activeStore, setActiveStore] = useState<GroupedStore | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  // Ref do timer para avançar automaticamente
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadStories() {
      setLoading(true);

      // Iniciamos a query na tabela stories com o join na tabela profiles
      let query = supabase
        .from("stories")
        .select(`
          id,
          image_url,
          title,
          ad_id,
          created_at,
          profiles (
            id,
            store_name,
            logo_url,
            city
          )
        `)
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (!error && data) {
        let rawStories = data as unknown as Story[];

        // Filtra por cidade caso ela tenha sido selecionada (respeitando a bolha da cidade)
        if (selectedCity) {
          rawStories = rawStories.filter((story) => {
            const profileCity = story.profiles?.city;
            return profileCity && profileCity.trim().toLowerCase() === selectedCity.trim().toLowerCase();
          });
        }

        // Agrupa os stories por loja
        const storeMap = new Map<string, GroupedStore>();

        rawStories.forEach((story) => {
          const storeName = story.profiles?.store_name || "Loja Local";
          const logoUrl = story.profiles?.logo_url || story.image_url;
          const storeKey = storeName;

          if (!storeMap.has(storeKey)) {
            storeMap.set(storeKey, {
              storeKey,
              storeName,
              logoUrl,
              stories: [story],
            });
          } else {
            storeMap.get(storeKey)?.stories.push(story);
          }
        });

        setGroupedStores(Array.from(storeMap.values()));
      }
      setLoading(false);
    }

    loadStories();
  }, [selectedCity]);

  // Efeito para trocar o slide a cada 4 segundos
  useEffect(() => {
    if (!activeStore) return;

    timerRef.current = setInterval(() => {
      setCurrentStoryIndex((prevIndex) => {
        if (prevIndex < activeStore.stories.length - 1) {
          return prevIndex + 1;
        } else {
          setActiveStore(null);
          return 0;
        }
      });
    }, 4000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeStore, currentStoryIndex]);

  const handleOpenStore = (store: GroupedStore) => {
    setActiveStore(store);
    setCurrentStoryIndex(0);
  };

  const handleNextStory = () => {
    if (!activeStore) return;
    if (currentStoryIndex < activeStore.stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
    } else {
      setActiveStore(null);
    }
  };

  const handlePrevStory = () => {
    if (!activeStore) return;
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    }
  };

  if (loading || groupedStores.length === 0) {
    return null;
  }

  const currentStory = activeStore ? activeStore.stories[currentStoryIndex] : null;

  return (
    <div style={{ width: "100%", backgroundColor: "#fff", padding: "15px 0", borderBottom: "1px solid #E2E8F0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 15px" }}>
        <p style={{ fontSize: 12, fontWeight: "bold", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
          ⚡ Destaques das Lojas {selectedCity ? `em ${selectedCity}` : ""}
        </p>

        {/* Carrossel de Ícones por Loja */}
        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
          {groupedStores.map((store) => (
            <div
              key={store.storeKey}
              onClick={() => handleOpenStore(store)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                flexShrink: 0,
                width: 72,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  padding: 3,
                  background: "linear-gradient(45deg, #f09433, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <img
                  src={store.logoUrl}
                  alt={store.storeName}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                    backgroundColor: "#fff",
                    border: "2px solid #fff",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: "#334155",
                  marginTop: 6,
                  textAlign: "center",
                  maxWidth: 70,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontWeight: "500",
                }}
              >
                {store.storeName}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal / Carrossel de Stories - Centralizado perfeitamente para Mobile e Desktop */}
      {activeStore && currentStory && (
        <div
          onClick={() => setActiveStore(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px",
            boxSizing: "border-box",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#1E293B",
              borderRadius: 12,
              overflow: "hidden",
              maxWidth: 380,
              width: "100%",
              maxHeight: "90vh",
              color: "#fff",
              position: "relative",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Barras de Progresso */}
            <div style={{ display: "flex", gap: 4, padding: "10px 12px 0 12px", backgroundColor: "#1E293B", flexShrink: 0 }}>
              {activeStore.stories.map((s, idx) => (
                <div
                  key={s.id}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: idx <= currentStoryIndex ? "#22C55E" : "rgba(255,255,255,0.3)",
                    transition: "background-color 0.3s ease",
                  }}
                />
              ))}
            </div>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, borderBottom: "1px solid #334155", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img
                  src={activeStore.logoUrl}
                  alt={activeStore.storeName}
                  style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                />
                <span style={{ fontWeight: "bold", fontSize: 14 }}>{activeStore.storeName}</span>
              </div>
              <button
                onClick={() => setActiveStore(null)}
                style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", padding: "0 5px" }}
              >
                ✕
              </button>
            </div>

            {/* Imagem + Controles */}
            <div style={{ position: "relative", width: "100%", height: "320px", backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <img
                src={currentStory.image_url}
                alt="Story"
                style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center" }}
              />

              <div
                onClick={handlePrevStory}
                style={{ position: "absolute", left: 0, top: 0, width: "35%", height: "100%", cursor: "pointer" }}
              />

              <div
                onClick={handleNextStory}
                style={{ position: "absolute", right: 0, top: 0, width: "35%", height: "100%", cursor: "pointer" }}
              />
            </div>

            {/* Rodapé / Ação */}
            <div style={{ padding: 15, textAlign: "center", flexShrink: 0 }}>
              <p style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentStory.title || "Oferta da Loja"}
              </p>
              <button
                onClick={() => {
                  const storeId = currentStory.profiles?.id || currentStory.profile_id || currentStory.user_id;
                  if (storeId) {
                    window.location.href = `/shop/${storeId}?ad=${currentStory.ad_id}`;
                  } else {
                    window.location.href = `/shop?ad=${currentStory.ad_id}`;
                  }
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#0F4C81",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Ver Anúncio Completo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}