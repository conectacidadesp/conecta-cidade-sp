"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Ad {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number | null;
  image_url: string | null;
  whatsapp: string;
  category?: string | null;
  is_hidden?: boolean | null;
}

interface StoreProfile {
  id: string;
  store_name: string;
  logo_url: string | null;
  cover_url?: string | null;
  theme_color?: string | null;
  store_type?: "marketplace" | "food";
}

interface CartItem {
  ad: Ad;
  quantity: number;
}

const THEMES: Record<string, { primary: string; bg: string; text: string; accent: string }> = {
  blue: { primary: "#0F4C81", bg: "#F8FAFC", text: "#1E293B", accent: "#22C55E" },
  emerald: { primary: "#059669", bg: "#ECFDF5", text: "#064E3B", accent: "#10B981" },
  purple: { primary: "#7C3AED", bg: "#F5F3FF", text: "#4C1D95", accent: "#8B5CF6" },
  darkGold: { primary: "#D97706", bg: "#18181B", text: "#F3F4F6", accent: "#F59E0B" },
  rose: { primary: "#E11D48", bg: "#FFF1F2", text: "#881337", accent: "#F43F5E" },
};

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function ShopContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  const rawId = params?.id as string;
  const targetAdQuery = searchParams.get("ad");

  const [ads, setAds] = useState<Ad[]>([]);
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const [highlightedAdId, setHighlightedAdId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados do Carrinho (Modo Food)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Pix");
  const [orderNotes, setOrderNotes] = useState("");

  const targetAdRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadShopData() {
      if (!rawId) return;
      setLoading(true);

      let storeUserId = rawId;
      let adIdToHighlight = targetAdQuery;

      // Busca anúncio direto para identificar o dono da loja
      const { data: directAd } = await supabase
        .from("ads")
        .select("*")
        .eq("id", rawId)
        .maybeSingle();

      if (directAd) {
        storeUserId = directAd.user_id;
        adIdToHighlight = directAd.id;
      }

      setHighlightedAdId(adIdToHighlight);

      // Busca o perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", storeUserId)
        .maybeSingle();

      if (profileData && !profileError) {
        setProfile(profileData);
      }

      // Busca anúncios ativos (ignorando os ocultos: is_hidden IS NOT TRUE)
      const { data: adsData } = await supabase
        .from("ads")
        .select("*")
        .eq("user_id", storeUserId)
        .or("is_hidden.is.null,is_hidden.eq.false")
        .order("created_at", { ascending: false });

      if (adsData) {
        setAds(adsData);
      }

      setLoading(false);

      setTimeout(() => {
        if (targetAdRef.current) {
          targetAdRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 400);
    }

    loadShopData();
  }, [rawId, targetAdQuery]);

  const activeThemeKey = profile?.theme_color && THEMES[profile.theme_color] ? profile.theme_color : "blue";
  const theme = THEMES[activeThemeKey];
  const isFoodMode = profile?.store_type === "food";

  // Funções do Carrinho
  const addToCart = (ad: Ad) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.ad.id === ad.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prev, { ad, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (adId: string) => {
    setCart((prev) => prev.filter((item) => item.ad.id !== adId));
  };

  const updateQuantity = (adId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.ad.id === adId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const cartTotal = cart.reduce((total, item) => total + (item.ad.price || 0) * item.quantity, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSendOrder = () => {
    if (cart.length === 0) return;

    const storeWhatsapp = ads[0]?.whatsapp || "";
    const formattedPhone = storeWhatsapp.replace(/\D/g, "");

    let message = `*🍕 NOVO PEDIDO - ${profile?.store_name || "Delivery"}*\n\n`;
    message += `*Cliente:* ${customerName || "Não informado"}\n`;
    if (customerAddress) message += `*Endereço:* ${customerAddress}\n`;
    message += `*Pagamento:* ${paymentMethod}\n`;
    if (orderNotes) message += `*Obs:* ${orderNotes}\n`;

    message += `\n*ITENS DO PEDIDO:*\n`;
    cart.forEach((item) => {
      const itemTotal = (item.ad.price || 0) * item.quantity;
      message += `▪ ${item.quantity}x ${item.ad.title} - R$ ${itemTotal.toFixed(2)}\n`;
    });

    message += `\n*TOTAL: R$ ${cartTotal.toFixed(2)}*`;

    const waUrl = `https://wa.me/55${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  if (loading) {
    return <p style={{ textAlign: "center", padding: "60px", color: "#64748B", fontWeight: "bold" }}>Carregando a vitrine da loja...</p>;
  }

  const groupedAds = ads.reduce<Record<string, Ad[]>>((acc, ad) => {
    const categoryName = ad.category && ad.category.trim() !== "" ? ad.category : "Outros Produtos";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(ad);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, paddingBottom: "100px" }}>
      <style jsx global>{`
        @keyframes scrollInfinite {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .carousel-track {
          display: flex;
          gap: 20px;
          width: max-content;
          animation: scrollInfinite 25s linear infinite;
        }

        .carousel-container:hover .carousel-track {
          animation-play-state: paused;
        }

        .title-clamp {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .desc-clamp {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* 🖼️ CAPA DA LOJA */}
      {profile?.cover_url && (
        <div style={{ width: "100%", height: "200px", overflow: "hidden", position: "relative" }}>
          <img
            src={profile.cover_url}
            alt="Capa da Loja"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", overflow: "hidden" }}>
        {/* Header da Loja */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          marginBottom: "30px", 
          borderBottom: `2px solid ${theme.primary}22`, 
          paddingBottom: "20px",
          marginTop: profile?.cover_url ? "-40px" : "30px",
          position: "relative",
          zIndex: 2
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {profile?.logo_url ? (
              <img src={profile.logo_url} alt={profile.store_name} style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", boxShadow: "0 4px 10px rgba(0,0,0,0.2)", border: `3px solid ${theme.bg}` }} />
            ) : (
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: theme.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "bold", border: `3px solid ${theme.bg}` }}>
                {profile?.store_name?.charAt(0).toUpperCase() || "L"}
              </div>
            )}
            <div>
              <h1 style={{ fontSize: "28px", margin: 0, color: theme.primary, fontWeight: "bold" }}>{profile?.store_name || "Vitrine da Loja"}</h1>
              <p style={{ color: "#64748B", margin: "5px 0 0 0", fontSize: "14px" }}>
                {isFoodMode ? "🍔 Faça seu pedido online no nosso cardápio virtual!" : "Confira todo o nosso estoque virtual ativo abaixo"}
              </p>
            </div>
          </div>

          <span style={{ backgroundColor: `${theme.primary}15`, color: theme.primary, fontSize: "12px", fontWeight: "bold", padding: "6px 12px", borderRadius: "20px" }}>
            {isFoodMode ? "🍟 Modo Delivery & Cardápio" : "🛍️ Modo Loja / Marketplace"}
          </span>
        </div>

        {/* Produtos e Categorias */}
        {ads.length === 0 ? (
          <p style={{ color: "#64748B" }}>Esta loja ainda não publicou produtos no estoque.</p>
        ) : (
          Object.entries(groupedAds).map(([category, items]) => {
            const rows = chunkArray(items, 10);

            return (
              <div key={category} style={{ marginBottom: "40px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                  <h2 style={{ fontSize: "20px", fontWeight: "bold", color: theme.primary, margin: 0 }}>
                    {category}
                  </h2>
                  <span style={{ fontSize: "12px", backgroundColor: `${theme.primary}15`, color: theme.primary, padding: "2px 8px", borderRadius: "12px", fontWeight: "bold" }}>
                    {items.length} {items.length === 1 ? "item" : "itens"}
                  </span>
                </div>

                {rows.map((rowItems, rowIndex) => {
                  const displayItems = rowItems.length > 1 ? [...rowItems, ...rowItems] : rowItems;

                  return (
                    <div
                      key={`${category}-row-${rowIndex}`}
                      className="carousel-container"
                      style={{
                        width: "100%",
                        overflow: "hidden",
                        paddingBottom: "15px",
                        marginBottom: rowIndex < rows.length - 1 ? "25px" : "0",
                      }}
                    >
                      <div
                        className={rowItems.length > 1 ? "carousel-track" : ""}
                        style={{
                          display: "flex",
                          gap: "20px",
                          width: rowItems.length > 1 ? "max-content" : "100%",
                          animationDuration: `${Math.max(rowItems.length * 5, 15)}s`,
                        }}
                      >
                        {displayItems.map((ad, idx) => {
                          const isHighlighted = ad.id === highlightedAdId;

                          return (
                            <div
                              key={`${ad.id}-${idx}`}
                              ref={isHighlighted && idx === 0 ? targetAdRef : null}
                              style={{
                                minWidth: "260px",
                                maxWidth: "260px",
                                flexShrink: 0,
                                border: isHighlighted ? `3px solid ${theme.primary}` : "1px solid #E2E8F0",
                                borderRadius: "12px",
                                overflow: "hidden",
                                backgroundColor: "#fff",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                boxShadow: isHighlighted ? "0 8px 25px rgba(0,0,0,0.15)" : "0 2px 5px rgba(0,0,0,0.04)",
                                transform: isHighlighted ? "scale(1.02)" : "scale(1)",
                                transition: "all 0.3s ease",
                                position: "relative",
                              }}
                            >
                              {isHighlighted && (
                                <span style={{ position: "absolute", top: 10, left: 10, backgroundColor: theme.primary, color: "#fff", fontSize: "10px", fontWeight: "bold", padding: "4px 8px", borderRadius: "6px", zIndex: 1 }}>
                                  ⚡ Em Destaque
                                </span>
                              )}

                              <div>
                                {ad.image_url ? (
                                  <img src={ad.image_url} alt={ad.title} style={{ width: "100%", height: "180px", objectFit: "cover" }} />
                                ) : (
                                  <div style={{ width: "100%", height: "180px", backgroundColor: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>📷 Sem Foto</div>
                                )}
                                <div style={{ padding: "14px" }}>
                                  <h3 className="title-clamp" style={{ fontSize: "15px", fontWeight: "bold", margin: "5px 0", color: "#1E293B", lineHeight: "1.3", height: "39px" }}>
                                    {ad.title}
                                  </h3>
                                  <p className="desc-clamp" style={{ fontSize: "13px", color: "#64748B", margin: "5px 0 0 0", lineHeight: "1.3", height: "34px" }}>
                                    {ad.description}
                                  </p>
                                </div>
                              </div>

                              <div style={{ padding: "14px", paddingTop: 0 }}>
                                <p style={{ fontSize: "18px", fontWeight: "bold", color: theme.primary, margin: "10px 0" }}>
                                  {ad.price ? `R$ ${ad.price.toFixed(2)}` : "Combinar valor"}
                                </p>

                                {isFoodMode ? (
                                  <button
                                    onClick={() => addToCart(ad)}
                                    style={{
                                      width: "100%",
                                      padding: "10px",
                                      backgroundColor: theme.primary,
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: "8px",
                                      fontWeight: "bold",
                                      fontSize: "12px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    🛒 Adicionar ao Pedido
                                  </button>
                                ) : (
                                  <a
                                    href={`https://wa.me/55${ad.whatsapp ? ad.whatsapp.replace(/\D/g, "") : ""}?text=Olá! Vi o produto "${ad.title}" na sua vitrine do Conecta Cidade SP.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: "block", textAlign: "center", padding: "10px", backgroundColor: "#22C55E", color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", fontSize: "12px" }}
                                  >
                                    💬 Perguntar sobre este produto
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </main>

      {/* CARRINHO FLUTUANTE */}
      {isFoodMode && cart.length > 0 && (
        <div
          onClick={() => setIsCartOpen(true)}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: "#22C55E",
            color: "#fff",
            padding: "14px 22px",
            borderRadius: "30px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontWeight: "bold",
            fontSize: "15px",
            zIndex: 99,
          }}
        >
          <span>🛒 Meu Pedido ({totalItemsCount})</span>
          <span style={{ backgroundColor: "#15803D", padding: "4px 10px", borderRadius: "15px" }}>R$ {cartTotal.toFixed(2)}</span>
        </div>
      )}

      {/* MODAL DO CARRINHO */}
      {isCartOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "100%", maxWidth: "420px", backgroundColor: "#fff", height: "100%", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", overflowY: "auto" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: "15px" }}>
                <h2 style={{ fontSize: "20px", margin: 0, color: "#1E293B" }}>🛍️ Seu Pedido</h2>
                <button onClick={() => setIsCartOpen(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
              </div>

              <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
                {cart.length === 0 ? (
                  <p style={{ color: "#64748B", textAlign: "center" }}>Seu carrinho está vazio.</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.ad.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F1F5F9", paddingBottom: "10px" }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: "bold", fontSize: "14px" }}>{item.ad.title}</p>
                        <p style={{ margin: "2px 0 0 0", color: theme.primary, fontSize: "13px", fontWeight: "bold" }}>R$ {((item.ad.price || 0) * item.quantity).toFixed(2)}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button onClick={() => updateQuantity(item.ad.id, -1)} style={{ width: "26px", height: "26px", borderRadius: "50%", border: "1px solid #CBD5E1", cursor: "pointer" }}>-</button>
                        <span style={{ fontWeight: "bold", fontSize: "14px" }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.ad.id, 1)} style={{ width: "26px", height: "26px", borderRadius: "50%", border: "1px solid #CBD5E1", cursor: "pointer" }}>+</button>
                        <button onClick={() => removeFromCart(item.ad.id)} style={{ background: "none", border: "none", color: "#EF4444", marginLeft: "8px", cursor: "pointer" }}>🗑️</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div style={{ marginTop: "25px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <h3 style={{ fontSize: "15px", margin: 0, color: "#1E293B" }}>📋 Dados da Entrega</h3>
                  <input type="text" placeholder="Seu Nome" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px" }} />
                  <input type="text" placeholder="Endereço de Entrega (Rua, Nº, Bairro)" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px" }} />
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px" }}>
                    <option value="Pix">Pix</option>
                    <option value="Cartão de Crédito/Débito">Cartão de Crédito/Débito</option>
                    <option value="Dinheiro (com troco)">Dinheiro</option>
                  </select>
                  <input type="text" placeholder="Observações (ex: tirar cebola)" value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px" }} />
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ borderTop: "2px solid #E2E8F0", paddingTop: "15px", marginTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", fontSize: "18px", fontWeight: "bold" }}>
                  <span>Total:</span>
                  <span style={{ color: theme.primary }}>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleSendOrder}
                  style={{
                    width: "100%",
                    padding: "14px",
                    backgroundColor: "#22C55E",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "15px",
                    cursor: "pointer",
                  }}
                >
                  💬 Enviar Pedido no WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center", padding: "60px", color: "#64748B", fontWeight: "bold" }}>Carregando a vitrine da loja...</p>}>
      <ShopContent />
    </Suspense>
  );
}