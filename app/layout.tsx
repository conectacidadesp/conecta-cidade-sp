import Header from "@/components/Header";

export const metadata = {
  title: "Conecta Cidade SP",
  description: "Classificados da sua cidade",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "sans-serif", margin: 0, padding: 0, backgroundColor: "#F8FAFC", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        
        {/* 🔹 CABEÇALHO GLOBAL DINÂMICO */}
        <Header />

        {/* 🛒 CONTEÚDO DAS PÁGINAS */}
        <div style={{ flex: 1, padding: "20px 10px" }}>
          {children}
        </div>

        {/* 🔻 RODAPÉ GLOBAL */}
        <footer style={{ backgroundColor: "#0F172A", color: "#94A3B8", padding: "40px 20px 20px", marginTop: "auto" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 30, marginBottom: 30 }}>
            <div>
              <h4 style={{ color: "#fff", margin: "0 0 12px" }}>🏢 Institucional</h4>
              <p style={{ margin: "4px 0", fontSize: 13 }}><a href="/about" style={{ color: "inherit", textDecoration: "none" }}>Quem Somos</a></p>
              <p style={{ margin: "4px 0", fontSize: 13 }}><a href="/how-it-works" style={{ color: "inherit", textDecoration: "none" }}>Como Funciona</a></p>
              <p style={{ margin: "4px 0", fontSize: 13 }}><a href="/contact" style={{ color: "inherit", textDecoration: "none" }}>Contato</a></p>
            </div>
            <div>
              <h4 style={{ color: "#fff", margin: "0 0 12px" }}>⚖️ Legal</h4>
              <p style={{ margin: "4px 0", fontSize: 13 }}><a href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Política de Privacidade</a></p>
              <p style={{ margin: "4px 0", fontSize: 13 }}><a href="/terms" style={{ color: "inherit", textDecoration: "none" }}>Termos de Uso</a></p>
              <p style={{ margin: "4px 0", fontSize: 13 }}><a href="/cookies" style={{ color: "inherit", textDecoration: "none" }}>Política de Cookies</a></p>
            </div>
            <div>
              <h4 style={{ color: "#fff", margin: "0 0 12px" }}>💻 Plataforma</h4>
              <p style={{ margin: "4px 0", fontSize: 13 }}><a href="/create" style={{ color: "inherit", textDecoration: "none" }}>Publicar Anúncio</a></p>
              <p style={{ margin: "4px 0", fontSize: 13 }}><a href="/profile" style={{ color: "inherit", textDecoration: "none" }}>Meu Perfil</a></p>
            </div>
            <div>
              <h4 style={{ color: "#fff", margin: "0 0 12px" }}>📍 Cidades Atendidas</h4>
              <p style={{ margin: "4px 0", fontSize: 13 }}>• Rubiácea-SP</p>
              <p style={{ margin: "4px 0", fontSize: 13 }}>• Guararapes-SP</p>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #1E293B", textAlign: "center", paddingTop: 20, fontSize: 12 }}>
            © 2026 Conecta Cidade SP. Todos os direitos reservados.
          </div>
        </footer>

      </body>
    </html>
  );
}