"use client";

export default function HowItWorksPage() {
  return (
    <main style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif", color: "#1E293B", minHeight: "100vh", lineHeight: "1.6" }}>
      
      {/* Botão Voltar */}
      <button 
        onClick={() => window.location.href = "/"} 
        style={{ background: "none", border: "none", color: "#0F4C81", cursor: "pointer", padding: 0, fontSize: "14px", fontWeight: "bold", marginBottom: "20px" }}
      >
        ⬅️ Voltar para a Home
      </button>

      <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#0F4C81", margin: "0 0 10px 0" }}>
        💡 Como Funciona o Conecta Cidade SP?
      </h1>
      <p style={{ color: "#64748B", fontSize: "16px", margin: "0 0 35px 0" }}>
        Entenda como nossa plataforma conecta consumidores, profissionais autônomos e lojistas em um único ambiente regionalizado e seguro.
      </p>

      {/* Seção 1: Para os Moradores / Compradores */}
      <section style={{ marginBottom: "35px", backgroundColor: "#FFF", padding: "25px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#0F4C81", margin: "0 0 15px 0", display: "flex", alignItems: "center", gap: "10px" }}>
          🛍️ Para Quem Quer Comprar ou Contratar
        </h2>
        <ol style={{ margin: 0, paddingLeft: "20px", color: "#334155" }}>
          <li style={{ marginBottom: "10px" }}>
            <strong>Explore sua Região:</strong> Acesse o portal e veja as ofertas e serviços disponíveis na sua própria cidade de forma totalmente gratuita.
          </li>
          <li style={{ marginBottom: "10px" }}>
            <strong>Analise os Detalhes:</strong> Clique nos anúncios para expandir a descrição, conferir fotos e verificar valores informados.
          </li>
          <li style={{ marginBottom: "10px" }}>
            <strong>Negocie Direto:</strong> Use o botão "Chamar no WhatsApp" para falar diretamente com o vendedor ou prestador de serviço. O Conecta Cidade SP não cobra taxas sobre as transações e não intermedia pagamentos, garantindo total liberdade nas suas compras.
          </li>
        </ol>
      </section>

      {/* Seção 2: Para Anunciantes / Lojistas */}
      <section style={{ marginBottom: "35px", backgroundColor: "#FFF", padding: "25px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#0F4C81", margin: "0 0 15px 0", display: "flex", alignItems: "center", gap: "10px" }}>
          🏪 Para Quem Quer Anunciar ou Criar uma Loja
        </h2>
        <ul style={{ margin: 0, paddingLeft: "20px", color: "#334155", listStyleType: "disc" }}>
          <li style={{ marginBottom: "10px" }}>
            <strong>Anúncios Rápidos:</strong> Qualquer morador ou profissional autônomo pode publicar seus produtos ou serviços clicando no botão "Criar Anúncio", preenchendo as informações e inserindo uma foto.
          </li>
          <li style={{ marginBottom: "10px" }}>
            <strong>Espaço Exclusivo para Lojas:</strong> Empresas locais podem configurar um perfil profissional na seção "Minha Loja". Ao adicionar o nome comercial e o logotipo, o sistema gera automaticamente uma página de estoque dinâmico exclusiva para a sua empresa.
          </li>
          <li style={{ marginBottom: "10px" }}>
            <strong>Carrossel de Destaques:</strong> As lojas com anúncios ativos ganham destaque automático no carrossel rotativo da página inicial da cidade, atraindo muito mais cliques e relevância visual.
          </li>
        </ul>
      </section>

      {/* Seção 3: Termo de Segurança */}
      <section style={{ backgroundColor: "#FFF1F2", padding: "20px", borderRadius: "12px", borderLeft: "5px solid #F43F5E", marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#9F1239", fontWeight: "bold" }}>⚠️ Compromisso com a Segurança</h3>
        <p style={{ margin: 0, fontSize: "14px", color: "#4C0519", lineHeight: "1.5" }}>
          Para manter o ambiente confiável para toda a comunidade, nossa equipe monitora denúncias de anúncios falsos, abusivos ou irregulares enviados pelos usuários. Anúncios fora das diretrizes comerciais da plataforma serão removidos imediatamente após análise técnica de nossa moderação central.
        </p>
      </section>

    </main>
  );
}