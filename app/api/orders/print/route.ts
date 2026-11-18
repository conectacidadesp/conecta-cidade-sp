
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token || !/^[a-f0-9]{48}$/.test(token)) {
      return NextResponse.json(
        { error: "Token de impressão inválido." },
        { status: 400 }
      );
    }

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id, store_id, order_number, customer_name, delivery_type, address, payment_method, order_notes, items, subtotal, delivery_fee, total, created_at"
      )
      .eq("print_token", token)
      .maybeSingle();

    if (error) {
      console.error("Erro ao consultar comanda:", error.code);

      return NextResponse.json(
        { error: "Não foi possível consultar a comanda." },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: "Comanda não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { order },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "Referrer-Policy": "no-referrer",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (error) {
    console.error("Erro interno na API de impressão:", error);

    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
