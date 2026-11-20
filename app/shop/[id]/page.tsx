
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
  subcategory?: string | null;
  is_hidden?: boolean | null;
  display_order?: number;
}

interface StoreProfile {
  id: string;
  store_name: string;
  logo_url: string | null;
  banner_url?: string | null;
  theme_color?: string | null;
  font_style?: string | null;
  store_type?: "marketplace" | "food";
  open_time?: string;
  close_time?: string;
  delivery_fee?: number | null;
  created_at?: string;
}

interface CartItem {
  ad: Ad;
  quantity: number;
}

const THEMES: Record<string, { primary: string; bg: string; text: string; accent: string }> = {
  blue: { primary: "#0F4C81", bg: "#F8FAFC", text: "#1E293B", accent: "#22C55E" },
  "#0F4C81": { primary: "#0F4C81", bg: "#F8FAFC", text: "#1E293B", accent: "#22C55E" },
  sky: { primary: "#0284C7", bg: "#F0F9FF", text: "#0C4A6E", accent: "#0284C7" },
  "#0284C7": { primary: "#0284C7", bg: "#F0F9FF", text: "#0C4A6E", accent: "#0284C7" },
  emerald: { primary: "#059669", bg: "#ECFDF5", text: "#064E3B", accent: "#10B981" },
  "#059669": { primary: "#059669", bg: "#ECFDF5", text: "#064E3B", accent: "#10B981" },
  lime: { primary: "#10B981", bg: "#ECFDF5", text: "#064E3B", accent: "#059669" },
  "#10B981": { primary: "#10B981", bg: "#ECFDF5", text: "#064E3B", accent: "#059669" },
  purple: { primary: "#7C3AED", bg: "#F5F3FF", text: "#4C1D95", accent: "#8B5CF6" },
  "#7C3AED": { primary: "#7C3AED", bg: "#F5F3FF", text: "#4C1D95", accent: "#8B5CF6" },
  rose: { primary: "#E11D48", bg: "#FFF1F2", text: "#881337", accent: "#F43F5E" },
  "#E11D48": { primary: "#E11D48", bg: "#FFF1F2", text: "#881337", accent: "#F43F5E" },
  orange: { primary: "#F97316", bg: "#FFF7ED", text: "#7C2D12", accent: "#F97316" },
  "#EA580C": { primary: "#EA580C", bg: "#FFF7ED", text: "#7C2D12", accent: "#F97316" },
  "#F97316": { primary: "#F97316", bg: "#FFF7ED", text: "#7C2D12", accent: "#EA580C" },
  red: { primary: "#DC2626", bg: "#FEF2F2", text: "#7F1D1D", accent: "#EF4444" },
  "#DC2626": { primary: "#DC2626", bg: "#FEF2F2", text: "#7F1D1D", accent: "#EF4444" },
  darkGold: { primary: "#D97706", bg: "#FFFBEB", text: "#78350F", accent: "#F59E0B" },
  "#D97706": { primary: "#D97706", bg: "#FFFBEB", text: "#78350F", accent: "#F59E0B" },
  brown: { primary: "#78350F", bg: "#FEF3C7", text: "#451A03", accent: "#D97706" },
  "#78350F": { primary: "#78350F", bg: "#FEF3C7", text: "#451A03", accent: "#D97706" },
  slate: { primary: "#475569", bg: "#F8FAFC", text: "#0F172A", accent: "#64748B" },
  "#475569": { primary: "#475569", bg: "#F8FAFC", text: "#0F172A", accent: "#64748B" },
  black: { primary: "#0F172A", bg: "#F1F5F9", text: "#020617", accent: "#334155" },
  "#0F172A": { primary: "#0F172A", bg: "#F1F5F9", text: "#020617", accent: "#334155" },
};

const FONT_FAMILIES: Record<string, string> = {
  sans: "system-ui, -apple-system, sans-serif",
  serif: "Georgia, Cambria, 'Times New Roman', serif",
  mono: "Menlo, Monaco, Consolas, monospace",
  rounded: "'Comic Sans MS', 'Quicksand', 'Nunito', sans-serif",
  display: "'Impact', 'Arial Black', sans-serif",
  cursive: "'Brush Script MT', 'Lucida Handwriting', cursive",
};

// 💵 Função para formatar o texto digitado no padrão monetário brasileiro (R$ 0,00)
const formatCurrencyInput = (value: string) => {
  const onlyDigits = value.replace(/\D/g, "");
  if (!onlyDigits) return "";
  const numberValue = parseFloat(onlyDigits) / 100;
  return numberValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

// Verifica o funcionamento considerando o horário de Brasília e a virada do dia.
function checkIsOpen(openTime?: string, closeTime?: string, now = new Date()) {
  if (!openTime || !closeTime) return true;

  const parseTime = (value: string) => {
    const match = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) return null;
    return hours * 60 + minutes;
  };

  const opening = parseTime(openTime);
  const closing = parseTime(closeTime);

  if (opening === null || closing === null) return false;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const hours = Number(parts.find((part) => part.type === "hour")?.value ?? "0") % 24;
  const minutes = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  const current = hours * 60 + minutes;

  if (opening === closing) return true;

  if (closing > opening) {
    return current >= opening && current < closing;
  }

  return current >= opening || current < closing;
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

  const [selectedTabCategory, setSelectedTabCategory] = useState("Todos");

  // Atualiza o status da loja automaticamente.
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());
    const interval = window.setInterval(updateTime, 30000);
    window.addEventListener("focus", updateTime);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", updateTime);
    };
  }, []);

  // Estados do Carrinho & Endereço
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [paymentMethod, setPaymentMethod] = useState("Pix");
  const [changeFor, setChangeFor] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const submittingOrderRef = useRef(false);
  const lastRegisteredOrderRef = useRef<{
    signature: string;
    orderNumber: number;
    printToken: string;
    createdAt: string;
    items: { title: string; qty: number; price: number | null }[];
    subtotal: number;
    deliveryFee: number;
    total: number;
  } | null>(null);
  const targetAdRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadShopData() {
      if (!rawId) return;
      setLoading(true);
      let storeUserId = rawId;
      let adIdToHighlight = targetAdQuery;

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

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", storeUserId)
        .maybeSingle();

      if (profileData && !profileError) {
        setProfile(profileData);
      }

      const { data: adsData } = await supabase
        .from("ads")
        .select("*")
        .eq("user_id", storeUserId)
        .or("is_hidden.is.null,is_hidden.eq.false")
        .order("display_order", { ascending: true, nullsFirst: false })
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

  const rawTheme = profile?.theme_color || "blue";
  const theme = THEMES[rawTheme] || {
    primary: rawTheme.startsWith("#") ? rawTheme : "#0F4C81",
    bg: "#F8FAFC",
    text: "#1E293B",
    accent: "#22C55E",
  };

  const rawFontKey = profile?.font_style || "sans";
  const activeFontFamily = FONT_FAMILIES[rawFontKey] || FONT_FAMILIES.sans;
  const isFoodMode = profile?.store_type === "food";
  const isOpen = checkIsOpen(profile?.open_time, profile?.close_time, currentTime);

  const storeCreatedDate = profile?.created_at
    ? new Date(profile.created_at)
    : null;

  const formattedStoreCreatedDate =
    storeCreatedDate && !Number.isNaN(storeCreatedDate.getTime())
      ? storeCreatedDate.toLocaleDateString("pt-BR", {
          timeZone: "America/Sao_Paulo",
        })
      : null;

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
  };

  const removeFromCard = (adId: string) => {
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

  const subtotal = cart.reduce((total, item) => total + (item.ad.price !== null ? item.ad.price * item.quantity : 0), 0);
  const deliveryFee = deliveryType === "delivery" ? (profile?.delivery_fee || 0) : 0;
  const cartTotal = subtotal + deliveryFee;
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Registra a comanda no Supabase antes de encaminhar o pedido ao WhatsApp.
  const handleSendOrder = async () => {
    if (submittingOrderRef.current || cart.length === 0 || !profile?.id) return;

    const formattedPhone = (ads[0]?.whatsapp || "").replace(/\D/g, "");
    if (!formattedPhone) {
      alert("O estabelecimento não possui um WhatsApp cadastrado.");
      return;
    }

    const finalPayment = paymentMethod === "Dinheiro (com troco)" && changeFor.trim()
      ? `Dinheiro (Troco para ${changeFor})`
      : paymentMethod;

    const fullAddress = deliveryType === "delivery"
      ? `${street.trim() || "Não informada"}, Nº ${number.trim() || "S/N"} ${neighborhood.trim() ? `- ${neighborhood.trim()}` : ""}`
      : "";

    const requestBody = {
      storeId: profile.id,
      customerName: customerName.trim(),
      deliveryType,
      address: fullAddress,
      paymentMethod: finalPayment,
      orderNotes: orderNotes.trim(),
      items: cart.map((item) => ({ id: item.ad.id, quantity: item.quantity })),
    };
    const signature = JSON.stringify(requestBody);

    submittingOrderRef.current = true;
    setIsSubmittingOrder(true);

    // Abre a guia durante o clique, antes do await, para evitar bloqueio de pop-up.
    const whatsappWindow = window.open("about:blank", "_blank");

    try {
      let registeredOrder = lastRegisteredOrderRef.current;

      if (!registeredOrder || registeredOrder.signature !== signature) {
        const response = await fetch("/api/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify(requestBody),
        });

        const result = await response.json();

        if (!response.ok || !result?.success || !result?.order) {
          throw new Error(result?.error || "Não foi possível registrar o pedido.");
        }

        const orderNumber = Number(result.order.order_number);
        const printToken = String(result.order.print_token || "");
        const createdAt = String(result.order.created_at || "");

        if (!Number.isInteger(orderNumber) || orderNumber < 1 || !/^[a-f0-9]{48}$/.test(printToken)) {
          throw new Error("O servidor retornou uma comanda inválida.");
        }

        registeredOrder = {
          signature,
          orderNumber,
          printToken,
          createdAt,
          items: cart.map((item) => ({
            title: item.ad.title,
            qty: item.quantity,
            price: item.ad.price,
          })),
          subtotal,
          deliveryFee,
          total: cartTotal,
        };

        lastRegisteredOrderRef.current = registeredOrder;
      }

      const sequentialOrderNumber = `#${String(registeredOrder.orderNumber).padStart(2, "0")}`;
      const date = registeredOrder.createdAt ? new Date(registeredOrder.createdAt) : new Date();
      const formattedDate = date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
      const formattedTime = date.toLocaleTimeString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour12: false,
      });
      const printLink = `${window.location.origin}/print-order?token=${encodeURIComponent(registeredOrder.printToken)}`;

      let message = `🛒 *PEDIDO ${sequentialOrderNumber} - ${profile.store_name || "Delivery"}*\n`;
      message += `📅 *Data:* ${formattedDate} às ${formattedTime}\n`;
      message += `*(Enviado via Conecta Cidade SP)*\n\n`;
      message += `👤 *Cliente:* ${customerName.trim() || "Não informado"}\n`;
      message += `📦 *Modalidade:* ${deliveryType === "delivery" ? "🚚 Entrega em Domicílio" : "🏃 Retirada no Local"}\n`;

      if (deliveryType === "delivery") {
        message += `📍 *Endereço:* ${street.trim() || "Não informada"}, Nº ${number.trim() || "S/N"}\n`;
        if (neighborhood.trim()) {
          message += `🏘️ *Bairro/Compl.:* ${neighborhood.trim()}\n`;
        }
      }

      message += `💳 *Forma de Pagamento:* ${finalPayment}\n`;
      if (orderNotes.trim()) {
        message += `📝 *Observações:* ${orderNotes.trim()}\n`;
      }

      message += `\n📋 *ITENS DO PEDIDO:*\n`;

      registeredOrder.items.forEach((item) => {
        const itemPriceText = item.price !== null
          ? `R$ ${(item.price * item.qty).toFixed(2)}`
          : "A combinar";
        message += `▪ ${item.qty}x ${item.title} — ${itemPriceText}\n`;
      });

      message += `\n------------------\n`;
      message += `Subtotal: R$ ${registeredOrder.subtotal.toFixed(2)}\n`;

      if (deliveryType === "delivery") {
        message += `Taxa de Entrega: R$ ${registeredOrder.deliveryFee.toFixed(2)}\n`;
      }

      message += `💰 *TOTAL A PAGAR: R$ ${registeredOrder.total.toFixed(2)}*\n\n`;
      message += `🖨️ *Imprimir Comanda:* ${printLink}`;

      const waUrl = `https://wa.me/55${formattedPhone}?text=${encodeURIComponent(message)}`;

      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.location.replace(waUrl);
      } else {
        window.location.assign(waUrl);
      }
    } catch (error) {
      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.close();
      }
      alert(error instanceof Error ? error.message : "Erro ao registrar o pedido.");
    } finally {
      submittingOrderRef.current = false;
      setIsSubmittingOrder(false);
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center", padding: "60px", color: "#64748B", fontWeight: "bold" }}>Carregando a vitrine da loja...</p>;
  }

  const getItemCategory = (ad: Ad) => {
    if (ad.subcategory && ad.subcategory.trim() !== "") {
      return ad.subcategory.trim();
    }
    if (ad.category && ad.category.trim() !== "") {
      return ad.category.trim();
    }
    return "Outros Produtos";
  };

  const uniqueCategories = Array.from(new Set(ads.map(ad => getItemCategory(ad)))).sort((a, b) => a.localeCompare(b));
  const categoriesList = ["Todos", ...uniqueCategories];

  const filteredAds = selectedTabCategory === "Todos"
    ? ads
    : ads.filter(ad => getItemCategory(ad) === selectedTabCategory);

  const groupedAds = filteredAds.reduce<Record<string, Ad[]>>((acc, ad) => {
    const categoryName = getItemCategory(ad);
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(ad);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, paddingBottom: "100px", fontFamily: activeFontFamily }}>
      <style jsx global>{`
        body {
          font-family: ${activeFontFamily};
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
        .modern-product-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: linear-gradient(135deg, #ffffff 0%, ${theme.primary}07 100%);
        }
        .modern-product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 32px rgba(0, 0, 0, 0.12) !important;
          border-color: ${theme.primary} !important;
        }
        @media (max-width: 767px) {
          .shop-main { padding-left: 12px !important; padding-right: 12px !important; }
          .shop-product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
          }
          .shop-product-card { min-width: 0; border-radius: 12px !important; }
          .shop-product-card:hover { transform: none; }
          .shop-product-image { height: auto !important; aspect-ratio: 1 / 1; padding: 6px !important; }
          .shop-product-image img { max-width: 100%; max-height: 100%; object-fit: contain; }
          .shop-product-info { padding: 10px !important; }
          .shop-product-info h3 { font-size: 13px !important; line-height: 1.3 !important; height: 34px !important; }
          .shop-product-info p { font-size: 11px !important; line-height: 1.3 !important; height: 29px !important; }
          .shop-product-bottom { padding: 0 10px 10px !important; }
          .shop-product-price { padding: 7px 8px !important; margin-bottom: 8px !important; gap: 4px; flex-wrap: wrap; }
          .shop-product-price span:first-child { font-size: 9px !important; }
          .shop-product-price span:last-child { font-size: 13px !important; overflow-wrap: anywhere; }
          .shop-product-action { padding: 10px 5px !important; font-size: 11px !important; line-height: 1.3 !important; min-height: 42px; box-sizing: border-box; }
        }
      `}</style>

      {profile?.banner_url && (
        <div style={{ width: "100%", height: "220px", overflow: "hidden", position: "relative" }}>
          <img
            src={profile.banner_url}
            alt="Capa da Loja"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      )}

      <main className="shop-main" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "15px",
          marginBottom: "20px",
          backgroundColor: `${theme.primary}12`,
          border: `1px solid ${theme.primary}33`,
          borderRadius: "16px",
          padding: "20px 25px",
          marginTop: "25px",
          position: "relative",
          zIndex: 2,
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", flex: 1, minWidth: "250px" }}>
            {profile?.logo_url ? (
              <img src={profile.logo_url} alt={profile.store_name} style={{ width: "80px", height: "80px", minWidth: "80px", borderRadius: "50%", objectFit: "cover", boxShadow: "0 4px 10px rgba(0,0,0,0.2)", border: `3px solid ${theme.bg}` }} />
            ) : (
              <div style={{ width: "80px", height: "80px", minWidth: "80px", borderRadius: "50%", backgroundColor: theme.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "bold", border: `3px solid ${theme.bg}` }}>
                {profile?.store_name?.charAt(0).toUpperCase() || "L"}
              </div>
            )}
            <div style={{ overflow: "hidden", flex: 1 }}>
              <h1 style={{ fontSize: "24px", margin: 0, color: theme.primary, fontWeight: "bold", whiteSpace: "normal", wordBreak: "break-word" }}>
                {profile?.store_name || "Vitrine da Loja"}
              </h1>
              <p style={{ color: theme.text, opacity: 0.8, margin: "4px 0", fontSize: "13px", lineHeight: "1.3" }}>
                {isFoodMode ? "🍔 Faça seu pedido online no nosso cardápio virtual!" : "Confira todo o nosso estoque virtual ativo abaixo"}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: "bold", margin: "6px 0", padding: "3px 8px", backgroundColor: isOpen ? "#ECFDF5" : "#FEF2F2", borderRadius: 6, width: "fit-content" }}>
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: isOpen ? "#10B981" : "#EF4444",
                  display: "inline-block"
                }} />
                <span style={{ color: isOpen ? "#065F46" : "#991B1B" }}>
                  {isOpen ? "Aberto Agora" : "Fechado Agora"}
                </span>
                <span style={{ color: "#64748B", fontWeight: "normal", fontSize: 11 }}>
                  ({profile?.open_time || "08:00"} às {profile?.close_time || "18:00"})
                </span>
              </div>

              {formattedStoreCreatedDate && (
                <div style={{
                  color: theme.text,
                  fontSize: "12px",
                  marginTop: "8px",
                  opacity: 0.85,
                  lineHeight: "1.4"
                }}>
                  🛡️ Loja na Conecta Cidade SP desde: <strong>{formattedStoreCreatedDate}</strong>
                </div>
              )}
            </div>
          </div>
          <span style={{ backgroundColor: theme.primary, color: "#fff", fontSize: "12px", fontWeight: "bold", padding: "8px 14px", borderRadius: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", whiteSpace: "nowrap" }}>
            {isFoodMode ? "🍟 Modo Delivery & Cardápio" : "🛍️ Modo Loja / Marketplace"}
          </span>
        </div>

        {categoriesList.length > 2 && (
          <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "15px", marginBottom: "25px", scrollbarWidth: "none" }}>
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedTabCategory(cat)}
                style={{
                  padding: "10px 18px",
                  borderRadius: "25px",
                  border: selectedTabCategory === cat ? `2px solid ${theme.primary}` : "1px solid #CBD5E1",
                  backgroundColor: selectedTabCategory === cat ? theme.primary : "#FFFFFF",
                  color: selectedTabCategory === cat ? "#FFFFFF" : "#334155",
                  fontWeight: "bold",
                  fontSize: "13px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: selectedTabCategory === cat ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {ads.length === 0 ? (
          <p style={{ color: "#64748B", textAlign: "center", padding: "40px" }}>Esta loja ainda não publicou produtos no estoque.</p>
        ) : (
          Object.entries(groupedAds).map(([category, items]) => {
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
                <div className="shop-product-grid" style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
                  gap: "20px"
                }}>
                  {items.map((ad, idx) => {
                    const isHighlighted = ad.id === highlightedAdId;
                    const formattedPrice = ad.price !== null ? `R$ ${ad.price.toFixed(2)}` : "A combinar";
                    const imageText = ad.image_url ? ad.image_url : "";
                    const adLink = typeof window !== "undefined" ? `${window.location.origin}` : "";

                    const marketMessage = `🛍️ *Olá! Tenho interesse neste produto:*\n\n` +
                      `📦 *Produto:* ${ad.title}\n` +
                      `💰 *Preço:* ${formattedPrice}\n` +
                      (ad.description ? `📝 *Detalhes:* ${ad.description}\n` : ``) +
                      (imageText ? `\n📸 *Foto do Produto:* ${imageText}\n` : ``) +
                      `\n🔗 *Página do Anúncio:* ${adLink}\n\n` +
                      `_Enviado através do Conecta Cidade SP._`;

                    return (
                      <div
                        key={`${ad.id}-${idx}`}
                        ref={isHighlighted && idx === 0 ? targetAdRef : null}
                        className="modern-product-card shop-product-card"
                        style={{
                          border: isHighlighted ? `3px solid ${theme.primary}` : `2px solid ${theme.primary}50`,
                          borderRadius: "16px",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          boxShadow: isHighlighted ? "0 8px 25px rgba(0,0,0,0.15)" : "0 6px 18px rgba(0, 0, 0, 0.06)",
                          transform: isHighlighted ? "scale(1.02)" : "scale(1)",
                          position: "relative",
                        }}
                      >
                        {isHighlighted && (
                          <span style={{ position: "absolute", top: 10, left: 10, backgroundColor: theme.primary, color: "#fff", fontSize: "10px", fontWeight: "bold", padding: "4px 8px", borderRadius: "6px", zIndex: 1, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>
                            ⚡ Em Destaque
                          </span>
                        )}
                        <div>
                          {ad.image_url ? (
                            <div className="shop-product-image" style={{ width: "100%", height: "185px", backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", padding: 10, borderBottom: `1px solid ${theme.primary}25`, boxSizing: "border-box" }}>
                              <img src={ad.image_url} alt={ad.title} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center" }} />
                            </div>
                          ) : (
                            <div className="shop-product-image" style={{ width: "100%", height: "185px", backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontSize: "13px", borderBottom: `1px solid ${theme.primary}25` }}>📷 Sem Foto</div>
                          )}
                          <div className="shop-product-info" style={{ padding: "16px" }}>
                            <h3 className="title-clamp" style={{ fontSize: "15px", fontWeight: "bold", margin: "0 0 6px 0", color: "#1E293B", lineHeight: "1.3", height: "39px" }}>
                              {ad.title}
                            </h3>
                            <p className="desc-clamp" style={{ fontSize: "13px", color: "#64748B", margin: 0, lineHeight: "1.3", height: "34px" }}>
                              {ad.description || "Consulte os detalhes deste item."}
                            </p>
                          </div>
                        </div>
                        <div className="shop-product-bottom" style={{ padding: "16px", paddingTop: 0 }}>
                          <div className="shop-product-price" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", backgroundColor: `${theme.primary}15`, padding: "8px 12px", borderRadius: "10px", border: `1px solid ${theme.primary}35` }}>
                            <span style={{ fontSize: "11px", fontWeight: "bold", color: theme.primary, textTransform: "uppercase", letterSpacing: "0.5px" }}>Valor</span>
                            <span style={{ fontSize: "15px", fontWeight: "800", color: theme.primary }}>
                              {formattedPrice}
                            </span>
                          </div>
                          {isFoodMode ? (
                            <button
                              className="shop-product-action"
                              onClick={() => addToCart(ad)}
                              style={{
                                width: "100%",
                                padding: "12px",
                                backgroundColor: theme.primary,
                                color: "#fff",
                                border: "none",
                                borderRadius: "10px",
                                fontWeight: "bold",
                                fontSize: "13px",
                                cursor: "pointer",
                                boxShadow: `0 4px 12px ${theme.primary}40`,
                                transition: "filter 0.2s ease",
                              }}
                            >
                              🛒 Adicionar ao Pedido
                            </button>
                          ) : (
                            <a
                              className="shop-product-action"
                              href={`https://wa.me/55${ad.whatsapp ? ad.whatsapp.replace(/\D/g, "") : ""}?text=${encodeURIComponent(marketMessage)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "block",
                                textAlign: "center",
                                padding: "12px",
                                backgroundColor: "#22C55E",
                                color: "#fff",
                                borderRadius: "10px",
                                textDecoration: "none",
                                fontWeight: "bold",
                                fontSize: "13px",
                                boxShadow: "0 4px 12px rgba(34, 197, 94, 0.35)",
                                transition: "all 0.2s ease"
                              }}
                            >
                              💬 Perguntar no WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </main>

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

      {isCartOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "100%", maxWidth: "420px", backgroundColor: "#fff", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", padding: "20px" }}>
              <h2 style={{ fontSize: "20px", margin: 0, color: "#1E293B" }}>🛍️ Seu Pedido</h2>
              <button onClick={() => setIsCartOpen(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ padding: "20px", overflowY: "auto", flex: 1, paddingBottom: "160px", display: "flex", flexDirection: "column", gap: "15px" }}>
              {cart.length === 0 ? (
                <p style={{ color: "#64748B", textAlign: "center" }}>Seu carrinho está vazio.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.ad.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F1F5F9", paddingBottom: "10px" }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: "bold", fontSize: "14px", color: "#1E293B" }}>{item.ad.title}</p>
                      <p style={{ margin: "2px 0 0 0", color: theme.primary, fontSize: "13px", fontWeight: "bold" }}>
                        {item.ad.price !== null ? `R$ ${(item.ad.price * item.quantity).toFixed(2)}` : "A combinar"}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button onClick={() => updateQuantity(item.ad.id, -1)} style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid #CBD5E1", background: "#F8FAFC", cursor: "pointer", fontWeight: "bold" }}>-</button>
                      <span style={{ fontWeight: "bold", fontSize: "14px", color: "#1E293B" }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.ad.id, 1)} style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid #CBD5E1", background: "#F8FAFC", cursor: "pointer", fontWeight: "bold" }}>+</button>
                      <button onClick={() => removeFromCard(item.ad.id)} style={{ background: "none", border: "none", color: "#EF4444", marginLeft: "4px", cursor: "pointer", fontSize: "16px" }} title="Remover item">🗑️</button>
                    </div>
                  </div>
                ))
              )}

              {cart.length > 0 && (
                <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <h3 style={{ fontSize: "15px", margin: 0, color: "#1E293B" }}>📋 Dados da Entrega</h3>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setDeliveryType("delivery")}
                      style={{
                        flex: 1, padding: "10px", borderRadius: "6px", fontSize: "13px", fontWeight: "bold", cursor: "pointer",
                        border: deliveryType === "delivery" ? `2px solid ${theme.primary}` : "1px solid #CBD5E1",
                        backgroundColor: deliveryType === "delivery" ? `${theme.primary}15` : "#fff",
                        color: deliveryType === "delivery" ? theme.primary : "#64748B"
                      }}
                    >
                      🚚 Entrega (+ R$ {(profile?.delivery_fee || 0).toFixed(2)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType("pickup")}
                      style={{
                        flex: 1, padding: "10px", borderRadius: "6px", fontSize: "13px", fontWeight: "bold", cursor: "pointer",
                        border: deliveryType === "pickup" ? `2px solid ${theme.primary}` : "1px solid #CBD5E1",
                        backgroundColor: deliveryType === "pickup" ? `${theme.primary}15` : "#fff",
                        color: deliveryType === "pickup" ? theme.primary : "#64748B"
                      }}
                    >
                      🏃 Retirada (Grátis)
                    </button>
                  </div>

                  <input type="text" placeholder="Seu Nome" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", boxSizing: "border-box" }} />

                  {deliveryType === "delivery" && (
                    <>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input type="text" placeholder="Nome da Rua / Avenida" value={street} onChange={(e) => setStreet(e.target.value)} style={{ flex: 3, padding: "10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", boxSizing: "border-box" }} />
                        <input type="text" placeholder="Nº" value={number} onChange={(e) => setNumber(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", boxSizing: "border-box" }} />
                      </div>
                      <input type="text" placeholder="Bairro / Complemento (Ex: Centro, Apto 24)" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", boxSizing: "border-box" }} />
                    </>
                  )}

                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", boxSizing: "border-box" }}>
                    <option value="Pix">Pix</option>
                    <option value="Cartão de Crédito/Débito">Cartão de Crédito/Débito</option>
                    <option value="Dinheiro (com troco)">Dinheiro (com troco)</option>
                  </select>

                  {/* 💵 Campo de troco com máscara monetária padrão R$ 0,00 */}
                  {paymentMethod === "Dinheiro (com troco)" && (
                    <input
                      type="text"
                      placeholder="Troco para quanto? (Ex: R$ 50,00)"
                      value={changeFor}
                      onChange={(e) => setChangeFor(formatCurrencyInput(e.target.value))}
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: `2px solid ${theme.primary}`, fontSize: "13px", boxSizing: "border-box", backgroundColor: `${theme.primary}08`, fontWeight: "bold", color: theme.primary }}
                    />
                  )}

                  <input type="text" placeholder="Observações (ex: tirar cebola)" value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", boxSizing: "border-box" }} />
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", borderTop: "2px solid #E2E8F0", padding: "15px 20px", backgroundColor: "#fff", boxSizing: "border-box", boxShadow: "0 -4px 10px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px", color: "#64748B" }}>
                  <span>Subtotal:</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                {deliveryType === "delivery" && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px", color: "#64748B" }}>
                    <span>Taxa de Entrega:</span>
                    <span>R$ {deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "16px", fontWeight: "bold", color: "#1E293B", borderTop: "1px dashed #CBD5E1", paddingTop: "6px" }}>
                  <span>Total:</span>
                  <span style={{ color: theme.primary }}>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleSendOrder}
                  disabled={isSubmittingOrder}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#22C55E",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "15px",
                    cursor: isSubmittingOrder ? "wait" : "pointer",
                    opacity: isSubmittingOrder ? 0.7 : 1,
                  }}
                >
                  {isSubmittingOrder ? "⏳ Registrando pedido..." : "💬 Finalizar Pedido no WhatsApp"}
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
