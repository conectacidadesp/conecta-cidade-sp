
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

interface OrderItem {
  title: string;
  qty: number;
  price: number | null;
}

interface PrintOrder {
  storeName: string;
  orderNumber: string;
  date: string;
  customer: string;
  deliveryType: string;
  address: string;
  payment: string;
  notes: string;
  items: OrderItem[];
  subtotal: string;
  deliveryFee: number;
  total: string;
}

interface DatabaseOrder {
  store_id: string;
  order_number: number;
  created_at: string;
  customer_name: string | null;
  delivery_type: string | null;
  address: string | null;
  payment_method: string | null;
  order_notes: string | null;
  items: OrderItem[];
  subtotal: number | string | null;
  delivery_fee: number | string | null;
  total: number | string | null;
}

function PrintContent() {
  const searchParams = useSearchParams();

  const [order, setOrder] = useState<PrintOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      setLoading(true);
      setError("");
      setOrder(null);

      if (!token || !/^[a-f0-9]{48}$/.test(token)) {
        setError("Link de impressão inválido.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/orders/print?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            cache: "no-store",
            referrerPolicy: "no-referrer",
          }
        );

        const result = await response.json();

        if (!response.ok || !result?.order) {
          throw new Error(
            result?.error || "Não foi possível localizar a comanda."
          );
        }

        const dbOrder = result.order as DatabaseOrder;

        // Consulta somente o nome público do estabelecimento.
        const profileResponse = await fetch(
          `/api/orders/store-name?storeId=${encodeURIComponent(
            dbOrder.store_id
          )}`,
          {
            cache: "no-store",
          }
        );

        let storeName = "Estabelecimento";

        if (profileResponse.ok) {
          const profileResult = await profileResponse.json();

          if (profileResult?.storeName) {
            storeName = String(profileResult.storeName);
          }
        }

        const createdAt = new Date(dbOrder.created_at);

        const formattedDate = Number.isNaN(createdAt.getTime())
          ? ""
          : `${createdAt.toLocaleDateString("pt-BR", {
              timeZone: "America/Sao_Paulo",
            })} às ${createdAt.toLocaleTimeString("pt-BR", {
              timeZone: "America/Sao_Paulo",
              hour12: false,
            })}`;

        const formattedOrder: PrintOrder = {
          storeName,
          orderNumber: `#${String(dbOrder.order_number).padStart(2, "0")}`,
          date: formattedDate,
          customer: dbOrder.customer_name || "Não informado",
          deliveryType:
            dbOrder.delivery_type === "delivery"
              ? "Entrega em Domicílio"
              : "Retirada no Local",
          address: dbOrder.address || "",
          payment: dbOrder.payment_method || "Não informado",
          notes: dbOrder.order_notes || "",
          items: Array.isArray(dbOrder.items)
            ? dbOrder.items.map((item) => ({
                title: String(item.title || ""),
                qty: Number(item.qty || 0),
                price:
                  item.price === null || item.price === undefined
                    ? null
                    : Number(item.price),
              }))
            : [],
          subtotal: Number(dbOrder.subtotal || 0).toFixed(2),
          deliveryFee: Number(dbOrder.delivery_fee || 0),
          total: Number(dbOrder.total || 0).toFixed(2),
        };

        if (!cancelled) {
          setOrder(formattedOrder);
        }
      } catch (err) {
        console.error("Erro ao carregar comanda:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Erro ao carregar a comanda."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <p
        style={{
          textAlign: "center",
          marginTop: 50,
          fontFamily: "sans-serif",
        }}
      >
        Carregando dados da comanda...
      </p>
    );
  }

  if (error || !order) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: 50,
          padding: 20,
          fontFamily: "sans-serif",
          color: "#991B1B",
        }}
      >
        <h3>Não foi possível abrir a comanda</h3>
        <p>{error || "Pedido não encontrado."}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 380,
        margin: "20px auto",
        padding: 15,
        fontFamily: "monospace",
        backgroundColor: "#fff",
        color: "#000",
        border: "1px dashed #999",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 15 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>
          {order.storeName}
        </h2>

        <p
          style={{
            margin: "4px 0",
            fontSize: 13,
            fontWeight: "bold",
          }}
        >
          PEDIDO {order.orderNumber}
        </p>

        <p style={{ margin: 0, fontSize: 11 }}>
          {order.date}
        </p>
      </div>

      <hr style={{ borderTop: "1px dashed #000" }} />

      <div style={{ fontSize: 12, margin: "10px 0" }}>
        <p style={{ margin: "3px 0" }}>
          <b>Cliente:</b> {order.customer}
        </p>

        <p style={{ margin: "3px 0" }}>
          <b>Tipo:</b> {order.deliveryType}
        </p>

        {order.address && (
          <p style={{ margin: "3px 0" }}>
            <b>Endereço:</b> {order.address}
          </p>
        )}

        <p style={{ margin: "3px 0" }}>
          <b>Pagamento:</b> {order.payment}
        </p>

        {order.notes && (
          <p style={{ margin: "3px 0" }}>
            <b>Obs:</b> {order.notes}
          </p>
        )}
      </div>

      <hr style={{ borderTop: "1px dashed #000" }} />

      <div style={{ fontSize: 12, margin: "10px 0" }}>
        <b>ITENS:</b>

        {order.items.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              margin: "4px 0",
            }}
          >
            <span>
              {item.qty}x {item.title}
            </span>

            <span>
              {item.price !== null
                ? `R$ ${(item.price * item.qty).toFixed(2)}`
                : "A combinar"}
            </span>
          </div>
        ))}
      </div>

      <hr style={{ borderTop: "1px dashed #000" }} />

      <div style={{ fontSize: 13, margin: "10px 0" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Subtotal:</span>
          <span>R$ {order.subtotal}</span>
        </div>

        {order.deliveryFee > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Taxa Entrega:</span>
            <span>R$ {order.deliveryFee.toFixed(2)}</span>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "bold",
            fontSize: 15,
            marginTop: 5,
          }}
        >
          <span>TOTAL:</span>
          <span>R$ {order.total}</span>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 25 }}>
        <button
          onClick={() => window.print()}
          style={{
            width: "100%",
            padding: 12,
            backgroundColor: "#000",
            color: "#fff",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: 14,
            borderRadius: 4,
          }}
        >
          🖨️ IMPRIMIR COMANDA
        </button>
      </div>
    </div>
  );
}

export default function PrintOrderPage() {
  return (
    <Suspense
      fallback={
        <p style={{ textAlign: "center", marginTop: 50 }}>
          Carregando...
        </p>
      }
    >
      <PrintContent />
    </Suspense>
  );
}
