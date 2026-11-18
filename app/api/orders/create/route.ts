
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OrderItem = {
  id: string;
  quantity: number;
};

type OrderRequest = {
  storeId: string;
  customerName?: string;
  deliveryType: "delivery" | "pickup";
  address?: string;
  paymentMethod?: string;
  orderNotes?: string;
  items: OrderItem[];
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OrderRequest;

    if (!body || !UUID_REGEX.test(body.storeId || "")) {
      return errorResponse("Estabelecimento inválido.", 400);
    }

    if (
      body.deliveryType !== "delivery" &&
      body.deliveryType !== "pickup"
    ) {
      return errorResponse("Modalidade de entrega inválida.", 400);
    }

    if (
      !Array.isArray(body.items) ||
      body.items.length === 0 ||
      body.items.length > 100
    ) {
      return errorResponse("Carrinho inválido.", 400);
    }

    const quantities = new Map<string, number>();

    for (const item of body.items) {
      if (
        !item ||
        !UUID_REGEX.test(item.id) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 100
      ) {
        return errorResponse("Produto ou quantidade inválida.", 400);
      }

      const total = (quantities.get(item.id) || 0) + item.quantity;

      if (total > 100) {
        return errorResponse("Quantidade inválida.", 400);
      }

      quantities.set(item.id, total);
    }

    const { data: store, error: storeError } = await supabaseAdmin
      .from("profiles")
      .select("id, store_name, store_type, delivery_fee")
      .eq("id", body.storeId)
      .maybeSingle();

    if (storeError || !store || store.store_type !== "food") {
      return errorResponse("Estabelecimento não encontrado.", 404);
    }

    const productIds = [...quantities.keys()];

    const { data: products, error: productsError } =
      await supabaseAdmin
        .from("ads")
        .select("id, user_id, title, price, is_hidden")
        .eq("user_id", body.storeId)
        .in("id", productIds);

    if (productsError || !products) {
      return errorResponse("Erro ao consultar os produtos.", 500);
    }

    const productMap = new Map(
      products.map((product) => [product.id, product])
    );

    let subtotalCents = 0;

    const items = [];

    for (const [id, quantity] of quantities) {
      const product = productMap.get(id);

      if (!product || product.is_hidden === true) {
        return errorResponse(
          "Um dos produtos não está mais disponível.",
          400
        );
      }

      const price =
        product.price === null ? null : Number(product.price);

      if (
        price !== null &&
        (!Number.isFinite(price) || price < 0)
      ) {
        return errorResponse("Preço inválido.", 400);
      }

      if (price !== null) {
        subtotalCents += Math.round(price * 100) * quantity;
      }

      items.push({
        id: product.id,
        title: product.title,
        qty: quantity,
        price,
      });
    }

    const deliveryFeeCents =
      body.deliveryType === "delivery"
        ? Math.round(Number(store.delivery_fee || 0) * 100)
        : 0;

    if (
      !Number.isFinite(deliveryFeeCents) ||
      deliveryFeeCents < 0
    ) {
      return errorResponse("Taxa de entrega inválida.", 400);
    }

    const subtotal = subtotalCents / 100;
    const deliveryFee = deliveryFeeCents / 100;
    const total = (subtotalCents + deliveryFeeCents) / 100;

    const customerName = String(body.customerName || "")
      .trim()
      .slice(0, 150);

    const address =
      body.deliveryType === "delivery"
        ? String(body.address || "").trim().slice(0, 500)
        : "";

    const paymentMethod = String(body.paymentMethod || "")
      .trim()
      .slice(0, 150);

    const orderNotes = String(body.orderNotes || "")
      .trim()
      .slice(0, 1000);

    // A função transacional será instalada no Supabase
    // antes de conectar o botão de finalizar pedido.
    const { data, error } = await supabaseAdmin.rpc(
      "create_order_transactional",
      {
        p_store_id: store.id,
        p_customer_name: customerName || "Não informado",
        p_delivery_type: body.deliveryType,
        p_address: address,
        p_payment_method: paymentMethod,
        p_order_notes: orderNotes,
        p_items: items,
        p_subtotal: subtotal,
        p_delivery_fee: deliveryFee,
        p_total: total,
      }
    );

    if (error) {
      console.error("Erro ao criar pedido:", error.message);
      return errorResponse(
        "Não foi possível registrar o pedido.",
        500
      );
    }

    return NextResponse.json(
      {
        success: true,
        order: data,
        storeName: store.store_name,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
          "Referrer-Policy": "no-referrer",
        },
      }
    );
  } catch (error) {
    console.error("Erro na rota de pedidos:", error);

    return errorResponse(
      "Não foi possível processar o pedido.",
      500
    );
  }
}
