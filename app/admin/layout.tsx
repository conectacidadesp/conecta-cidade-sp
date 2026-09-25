"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "🏠 Dashboard", href: "/admin" },
    { name: "💰 Afiliados (Shopee/ML/Amz)", href: "/admin/affiliates" },
    // Espaços reservados para o futuro que você mencionou:
    // { name: "📝 Artigos / Blog", href: "/admin/posts" },
    // { name: "🛡️ Moderação", href: "/admin/moderation" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F1F5F9" }}>
      {/* Barra Lateral Administrativa Esquerda */}
      <aside style={{ 
        width: "260px", 
        backgroundColor: "#0B2545", 
        color: "#fff", 
        display: "flex", 
        flexDirection: "column",
        boxShadow: "4px 0 10px rgba(0,0,0,0.05)"
      }}>
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #1E3A60" }}>
          <h3 style={{ margin: 0, fontSize: 18, color: "#F97316" }}>⚙️ Painel Conecta</h3>
          <span style={{ fontSize: 11, color: "#94A3B8" }}>Gerenciamento Geral</span>
        </div>

        <nav style={{ padding: "20px 12px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 14px",
                  borderRadius: 8,
                  color: isActive ? "#ffffff" : "#CBD5E1",
                  backgroundColor: isActive ? "#0088FF" : "transparent",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: isActive ? "bold" : "normal",
                  transition: "all 0.2s"
                }}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid #1E3A60", fontSize: 12, color: "#94A3B8" }}>
          <a href="/" style={{ color: "#94A3B8", textDecoration: "none" }}>← Voltar para o Site</a>
        </div>
      </aside>

      {/* Conteúdo Principal do Painel */}
      <main style={{ flex: 1, padding: "30px", overflowY: "auto", boxSizing: "border-box" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          {children}
        </div>
      </main>
    </div>
  );
}