
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.searchParams.get("storeId");

    if (!storeId || !UUID_REGEX.test(storeId)) {
      return NextResponse.json(
        { error: "Identificador do estabelecimento inválido." },
        { status: 400 }
      );
    }

    const { data: store, error } = await supabaseAdmin
      .from("profiles")
      .select("store_name")
      .eq("id", storeId)
      .maybeSingle();

    if (error) {
      console.error("Erro ao consultar estabelecimento:", error.message);

      return NextResponse.json(
        { error: "Não foi possível consultar o estabelecimento." },
        { status: 500 }
      );
    }

    if (!store) {
      return NextResponse.json(
        { error: "Estabelecimento não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { storeName: store.store_name || "Estabelecimento" },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (error) {
    console.error("Erro na consulta do estabelecimento:", error);

    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
