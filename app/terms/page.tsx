"use client";

import { useEffect, useState } from "react";

export default function TermsOfUsePage() {
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
        📋 Termos e Condições de Uso
      </h1>
      <p style={{ color: "#64748B", fontSize: "14px", margin: "0 0 30px 0" }}>
        Última atualização: 09 de Junho de 2026
      </p>

      <section style={{ backgroundColor: "#FFF", padding: "30px", borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "15px", color: "#334155" }}>
        
        <h2 style={{ fontSize: "18px", color: "#0F4C81", margin: "0 0 12px 0" }}>1. Aceitação dos Termos</h2>
        <p>
          Ao aceder e utilizar o portal <strong>Conecta Cidade SP</strong>, especificamente os serviços disponibilizados para <strong>{currentCity}</strong>, o utilizador concorda em cumprir e vincular-se aos seguintes termos e condições de uso. Se não concordar com algum dos termos, não deverá utilizar a plataforma.
        </p>

        <h2 style={{ fontSize: "18px", color: "#0F4C81", marginTop: "25px" }}>2. Natureza do Serviço</h2>
        <p>
          O Conecta Cidade SP funciona exclusivamente como um <strong>guia e diretório local classificado</strong>. A plataforma oferece um espaço virtual para que anunciantes e lojistas publiquem os seus produtos, serviços e informações comerciais. 
        </p>
        <p style={{ backgroundColor: "#FFFBEB", padding: "12px", borderRadius: "6px", borderLeft: "4px solid #F59E0B" }}>
          <strong>Aviso de Isenção de Responsabilidade:</strong> O Conecta Cidade SP não é proprietário, não possui stock, não vende, não intermedeia pagamentos e não faz entregas dos produtos anunciados. Qualquer transação comercial é combinada de forma direta e independente entre o comprador e o vendedor (geralmente via WhatsApp), sendo estes os únicos responsáveis pelo negócio.
        </p>

        <h2 style={{ fontSize: "18px", color: "#0F4C81", marginTop: "25px" }}>3. Obrigações dos Anunciantes e Lojistas</h2>
        <p>
          Ao criar um anúncio ou configurar uma loja, o utilizador compromete-se a:
        </p>
        <ul>
          <li>Fornecer informações verdadeiras, atualizadas e exatas sobre o produto ou serviço;</li>
          <li>Garantir que a imagem associada corresponde fielmente ao item real;</li>
          <li>Não anunciar produtos proibidos por lei, falsificados, armas, substâncias ilícitas ou que infrinjam direitos de autor.</li>
        </ul>

        <h2 style={{ fontSize: "18px", color: "#0F4C81", marginTop: "25px" }}>4. Moderação e Remoção de Conteúdo</h2>
        <p>
          A equipa de moderação central do Conecta Cidade SP reserva-se o direito de remover, suspender ou editar qualquer anúncio ou perfil de loja que viole as diretrizes comerciais da plataforma, apresente indícios de fraude ou receba denúncias fundamentadas de utilizadores, sem necessidade de aviso prévio.
        </p>

        <h2 style={{ fontSize: "18px", color: "#0F4C81", marginTop: "25px" }}>5. Limitação de Responsabilidade</h2>
        <p>
          Em nenhuma circunstância o Conecta Cidade SP ou a sua equipa central serão responsáveis por quaisquer danos (diretos, indiretos ou lucros cessantes) decorrentes de negociações malsucedidas, produtos com defeito, imprevistos na prestação de serviços ou comportamentos inadequados de terceiros na plataforma.
        </p>

        <h2 style={{ fontSize: "18px", color: "#0F4C81", marginTop: "25px" }}>6. Contacto e Suporte</h2>
        <p>
          Dúvidas sobre a interpretação destes termos ou comunicações legais devem ser encaminhadas diretamente para a nossa central através do e-mail oficial: <strong>conectacidadesp@gmail.com</strong>.
        </p>

      </section>

    </main>
  );
}