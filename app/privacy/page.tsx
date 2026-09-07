"use client";

import { useEffect, useState } from "react";

export default function PrivacyPolicyPage() {
  const [currentCity, setCurrentCity] = useState("nossa região");

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
        🔒 Política de Privacidade
      </h1>
      <p style={{ color: "#64748B", fontSize: "14px", margin: "0 0 30px 0" }}>
        Última atualização: 09 de Junho de 2026
      </p>

      <section style={{ backgroundColor: "#FFF", padding: "30px", borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "15px", color: "#334155" }}>
        
        <p>
          A sua privacidade é importante para nós. É política do <strong>Conecta Cidade SP</strong> respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site, especificamente para a operação em <strong>{currentCity}</strong> e demais cidades integradas.
        </p>

        <h2 style={{ fontSize: "18px", color: "#0F4C81", marginTop: "25px" }}>1. Coleta de Informações</h2>
        <p>
          Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço (como a criação de anúncios ou perfis de loja). Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento.
        </p>
        <ul>
          <li><strong>Anunciantes:</strong> Coletamos Nome, WhatsApp e fotos dos produtos.</li>
          <li><strong>Lojistas:</strong> Coletamos o Nome Fantasia e Logotipo da empresa.</li>
          <li><strong>Visitantes:</strong> Coletamos dados de preferência de cidade para personalizar sua experiência.</li>
        </ul>

        <h2 style={{ fontSize: "18px", color: "#0F4C81", marginTop: "25px" }}>2. Uso das Informações</h2>
        <p>
          As informações coletadas são utilizadas exclusivamente para:
        </p>
        <ul>
          <li>Exibir seus anúncios para outros usuários da região.</li>
          <li>Permitir que interessados entrem em contato via WhatsApp.</li>
          <li>Melhorar a relevância dos anúncios exibidos na sua cidade.</li>
        </ul>

        <h2 style={{ fontSize: "18px", color: "#0F4C81", marginTop: "25px" }}>3. Retenção de Dados</h2>
        <p>
          Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemo-los dentro de meios comercialmente aceitáveis ​​para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
        </p>

        <h2 style={{ fontSize: "18px", color: "#0F4C81", marginTop: "25px" }}>4. Compartilhamento com Terceiros</h2>
        <p>
          Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei. O nosso site pode ter links para sites externos (como o WhatsApp) que não são operados por nós. Esteja ciente de que não temos controle sobre o conteúdo e práticas desses sites e não podemos aceitar responsabilidade por suas respectivas políticas de privacidade.
        </p>

        <h2 style={{ fontSize: "18px", color: "#0F4C81", marginTop: "25px" }}>5. Compromisso do Usuário</h2>
        <p>
          O usuário se compromete a fazer uso adequado dos conteúdos e da informação que o Conecta Cidade SP oferece no site e com caráter enunciativo, mas não limitativo:
        </p>
        <ul>
          <li>A não se envolver em atividades que sejam ilegais ou contrárias à boa fé e à ordem pública;</li>
          <li>A não publicar anúncios de produtos ilícitos ou que firam a dignidade humana.</li>
        </ul>

        <h2 style={{ fontSize: "18px", color: "#0F4C81", marginTop: "25px" }}>6. LGPD e Direitos do Titular</h2>
        <p>
          Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/18), você tem o direito de acessar, corrigir ou solicitar a exclusão de seus dados a qualquer momento através do nosso canal de contato oficial: <strong>conectacidadesp@gmail.com</strong>.
        </p>

      </section>

    </main>
  );
}