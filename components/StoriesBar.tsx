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
  latestCreatedAt: string;
}

export default function StoriesBar({ selectedCity }: { selectedCity?: string }) {
  const [groupedStores, setGroupedStores] = useState<GroupedStore[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para o Modal de Visualização
  const [activeStoreIndex, setActiveStoreIndex] = useState<number | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  // Armazena IDs dos stories assistidos no navegador
  const [viewedStoryIds, setViewedStoryIds] = useState<string[]>([]);

  // Ref do timer para avançar automaticamente
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Carregar stories assistidos salvos no localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("viewed_stories");
      if (saved) {
        try {
          setViewedStoryIds(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, []);

  useEffect(() => {
    async function loadStories() {
      setLoading(true);

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

        // Buscar títulos reais dos anúncios caso o title do story esteja vazio
        const adIds = rawStories.map(s => s.ad_id).filter(Boolean);
        if (adIds.length > 0) {
          const { data: adsData } = await supabase
            .from("ads")
            .select("id, title")
            .in("id", adIds);

          if (adsData) {
            const adTitleMap = new Map(adsData.map(a => [a.id, a.title]));
            rawStories = rawStories.map(s => ({
              ...s,
              title: s.title || adTitleMap.get(s.ad_id) || "Produto em Destaque"
            }));
          }
        }

        // Filtra por cidade caso selecionada
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
              latestCreatedAt: story.created_at,
            });
          } else {
            const store = storeMap.get(storeKey)!;
            store.stories.push(story);
            if (new Date(story.created_at) > new Date(store.latestCreatedAt)) {
              store.latestCreatedAt = story.created_at;
            }
          }
        });

        const storesList = Array.from(storeMap.values());
        setGroupedStores(storesList);
      }
      setLoading(false);
    }

    loadStories();
  }, [selectedCity]);

  // 🔹 ORDENAÇÃO INTELIGENTE: Lojas com stories não assistidos vão para o início, assistidas vão para o final
  const sortedStores = [...groupedStores].sort((a, b) => {
    const aHasUnwatched = a.stories.some(s => !viewedStoryIds.includes(s.id));
    const bHasUnwatched = b.stories.some(s => !viewedStoryIds.includes(s.id));

    if (aHasUnwatched && !bHasUnwatched) return -1;
    if (!aHasUnwatched && bHasUnwatched) return 1;

    // Se ambas têm o mesmo status, ordena pela mais recente
    return new Date(b.latestCreatedAt).getTime() - new Date(a.latestCreatedAt).getTime();
  });

  const activeStore = activeStoreIndex !== null ? sortedStores[activeStoreIndex] : null;
  const currentStory = activeStore ? activeStore.stories[currentStoryIndex] : null;

  // Marcar story atual como assistido e salvar no localStorage
  const markCurrentStoryAsViewed = (storyId: string) => {
    if (!viewedStoryIds.includes(storyId)) {
      const updated = [...viewedStoryIds, storyId];
      setViewedStoryIds(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("viewed_stories", JSON.stringify(updated));
      }
    }
  };

  useEffect(() => {
    if (activeStore && currentStory) {
      markCurrentStoryAsViewed(currentStory.id);
    }
  }, [activeStoreIndex, currentStoryIndex]);

  // 🔹 AVANÇO AUTOMÁTICO CONTÍNUO (Entre slides e entre lojas diferentes)
  useEffect(() => {
    if (activeStoreIndex === null || !activeStore) return;

    timerRef.current = setInterval(() => {
      setCurrentStoryIndex((prevIndex) => {
        if (prevIndex < activeStore.stories.length - 1) {
          return prevIndex + 1;
        } else {
          // Terminou os stories desta loja, pula automaticamente para a próxima loja
          if (activeStoreIndex < sortedStores.length - 1) {
            setActiveStoreIndex(activeStoreIndex + 1);
            return 0;
          } else {
            // Se chegou ao fim de todas as lojas, fecha o modal
            setActiveStoreIndex(null);
            return 0;
          }
        }
      });
    }, 4000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeStoreIndex, currentStoryIndex, sortedStores]);

  const handleOpenStore = (index: number) => {
    setActiveStoreIndex(index);
    setCurrentStoryIndex(0);
  };

  const handleNextStory = () => {
    if (!activeStore || activeStoreIndex === null) return;
    if (currentStoryIndex < activeStore.stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
    } else {
      if (activeStoreIndex < sortedStores.length - 1) {
        setActiveStoreIndex(activeStoreIndex + 1);
        setCurrentStoryIndex(0);
      } else {
        setActiveStoreIndex(null);
      }
    }
  };

  const handlePrevStory = () => {
    if (!activeStore || activeStoreIndex === null) return;
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    } else if (activeStoreIndex > 0) {
      setActiveStoreIndex(activeStoreIndex - 1);
      setCurrentStoryIndex(sortedStores[activeStoreIndex - 1].stories.length - 1);
    }
  };

  if (loading || sortedStores.length === 0) {
    return null;
  }

  return (
    <div style={{ width: "100%", backgroundColor: "#fff", padding: "15px 0", borderBottom: "1px solid #E2E8F0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 15px" }}>
        <p style={{ fontSize: 12, fontWeight: "bold", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
          ⚡ Destaques das Lojas {selectedCity ? `em ${selectedCity}` : ""}
        </p>

        {/* Carrossel de Ícones por Loja */}
        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
          {sortedStores.map((store, index) => {
            // Verifica se a loja possui algum story não assistido
            const hasUnwatched = store.stories.some(s => !viewedStoryIds.includes(s.id));

            return (
              <div
                key={store.storeKey}
                onClick={() => handleOpenStore(index)}
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
                    // Se foi assistido, remove o gradiente/círculo vermelho e deixa cinza discreto ou sem destaque
                    background: hasUnwatched
                      ? "linear-gradient(45deg, #f09433, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
                      : "#CBD5E1",
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
            );
          })}
        </div>
      </div>

      {/* Modal / Carrossel de Stories */}
      {activeStore && currentStory && (
        <div
          onClick={() => setActiveStoreIndex(null)}
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
                onClick={() => setActiveStoreIndex(null)}
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

            {/* Rodapé / Ação com o Título Real do Produto */}
            <div style={{ padding: 15, textAlign: "center", flexShrink: 0 }}>
              <p style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentStory.title || "Produto em Destaque"}
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