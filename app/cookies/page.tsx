"use client";

import { useEffect, useState } from "react";

export default function CookiesPolicyPage() {
  const [currentCity, setCurrentCity] = useState("sua localidade");

  useEffect(() => {
    const savedCity = localStorage.getItem("selectedCity");
    if (savedCity) {
      setCurrentCity(savedCity.replace(" - ", "-"));
    }
  }, []);

  return (
    <main style={{ padding: "40px 20px", maxWidth: "850px", margin: "0 auto", fontFamily: "sans-serif", color: "#1E293B", minHeight: "100vh", lineHeight: "1.7" }}>
      
      {/* Botão Voltar */}
      <button 
        onClick={() => window.location.href = "/"} 
        style={{ background: "none", border: "none", color: "#0F4C81", cursor: "pointer", padding: 0, fontSize: "14px", fontWeight: "bold", marginBottom: "20px" }}
      >
        ⬅️ Voltar para a Home
      </button>

      <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#0F4C81", margin: "0 0 10px 0" }}>
        🍪 Política de Cookies
      </h1>
      <p style={{ color: "#64748B", fontSize: "14px", margin: "0 0 30px 0" }}>
        Última atualização: 09 de Junho de 2026
      </p>

      <section style={{ backgroundColor: "#FFF", padding: "30px", borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "15px", color: "#334155" }}>
        
        <h2 style={{ fontSize: "18px", color: "#0F4C81", margin: "0 0 12px 0" }}>1. O que são cookies?</h2>
        <p>
          Como é prática comum em quase todos os sites profissionais, o portal <strong>Conecta Cidade SP</strong> utiliza cookies e armazenamento local (como <code>localStorage</code>). Eles são pequenos arquivos ou registros de texto guardados no seu navegador para melhorar a sua experiência de navegação, lembrando suas preferências em <strong>{currentCity}</strong>.
        </p>

        <h2 style={{ fontSize: "18px", color: "#0F4C81", marginTop: "25px" }}>2. Como usamos os cookies e o armazenamento local?</h2>
        <p>
          Utilizamos essas tecnologias por vários motivos listados abaixo. Infelizmente, na maioria dos casos, não existem opções padrão do setor para desativar os cookies sem desativar completamente as funcionalidades que eles adicionam ao site. Recomendamos que você deixe todos ativados para garantir o funcionamento correto do sistema.
        </p>
        
        <ul style={{ paddingLeft: "20px" }}>
          <li style={{ marginBottom: "10px" }}>
            <strong>Preferência de Cidade:</strong> Armazenamos a cidade que você selecionou para que, nas próximas visitas, o portal carregue automaticamente os anúncios e lojas de <strong>{currentCity}</strong> sem que você precise escolher novamente.
          </li>
          <li style={{ marginBottom: "10px" }}>
            <strong>Sessão e Login:</strong> Guardamos registros temporários de autenticação para que você possa acessar o painel "Minha Loja" e gerenciar seus anúncios de forma segura sem precisar digitar a senha a cada clique.
          </li>
          <li style={{ marginBottom: "10px" }}>
            <strong>Analytics e Anúncios (Futuro):</strong> Em etapas futuras de monetização, parceiros confiáveis (como o Google AdSense) poderão utilizar cookies para coletar métricas anônimas de acessos e exibir anúncios mais relevantes para os interesses da sua região.
          </li>
        </ul>

        <h2 style={{ fontSize: "18px", color: "#0F4C81", marginTop: "25px" }}>3. Desativar Cookies</h2>
        <p>
          Você pode impedir a configuração de cookies ajustando as configurações do seu navegador (consulte a "Ajuda" do seu navegador para saber como fazer isso). Esteja ciente de que a desativação de cookies afetará a funcionalidade deste e de muitos outros sites que você visita. A desativação geralmente resultará na perda de recursos essenciais deste portal (como a filtragem automática por cidade).
        </p>

        <h2 style={{ fontSize: "18px", color: "#0F4C81", marginTop: "25px" }}>4. Mais informações</h2>
        <p>
          Esperamos que estas informações estejam claras. Se houver algo que você não tem certeza se precisa ou não, geralmente é mais seguro deixar os cookies ativados caso interaja com um dos recursos que você usa em nosso site. Para esclarecer qualquer dúvida, entre em contato conosco através do e-mail oficial: <strong>conectacidadesp@gmail.com</strong>.
        </p>

      </section>

    </main>
  );
}