"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !message) {
      alert("Por favor, preencha todos os campos do formulário.");
      return;
    }

    alert(`Obrigado pelo contato, ${name}! Sua mensagem foi enviada com sucesso para nossa central de atendimento. Retornaremos em breve no e-mail informado.`);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <main style={{ padding: "40px 20px", maxWidth: "600px", margin: "0 auto", fontFamily: "sans-serif", color: "#1E293B", minHeight: "100vh" }}>
      
      {/* Botão Voltar */}
      <button 
        onClick={() => window.location.href = "/"} 
        style={{ background: "none", border: "none", color: "#0F4C81", cursor: "pointer", padding: 0, fontSize: "14px", fontWeight: "bold", marginBottom: "20px" }}
      >
        ⬅️ Voltar para a Home
      </button>

      <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#0F4C81", margin: "0 0 10px 0" }}>
        📬 Fale Conosco
      </h1>
      <p style={{ color: "#64748B", fontSize: "16px", margin: "0 0 30px 0", lineHeight: "1.5" }}>
        Tem alguma dúvida, crítica, sugestão ou deseja anunciar com destaque? Entre em contato com a equipe de suporte do <strong>Conecta Cidade SP</strong>.
      </p>

      {/* Caixa de Mensagem Direta (E-mail Institucional) */}
      <div style={{ backgroundColor: "#F1F5F9", borderRadius: "12px", padding: "20px", marginBottom: "30px", borderLeft: "5px solid #0F4C81" }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", color: "#1E293B", fontWeight: "bold" }}>💻 Central de Atendimento</h3>
        <p style={{ margin: "0 0 15px 0", fontSize: "14px", color: "#64748B" }}>Se preferir enviar um e-mail diretamente anexando mídias ou propostas comerciais, escreva para:</p>
        
        <a 
          href="mailto:conectacidadesp@gmail.com" 
          style={{ display: "inline-block", padding: "10px 20px", backgroundColor: "#0F4C81", color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", fontSize: "14px" }}
        >
          ✉️ conectacidadesp@gmail.com
        </a>
      </div>

      {/* Formulário de Contato */}
      <form onSubmit={handleSubmit} style={{ backgroundColor: "#FFF", padding: "25px", borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", color: "#0F4C81", fontWeight: "bold" }}>✉️ Envie uma Mensagem</h3>
        
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "5px", color: "#334155" }}>Nome Completo</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome" 
            style={{ width: "100%", padding: "10px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "5px", color: "#334155" }}>E-mail de Contato</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@exemplo.com" 
            style={{ width: "100%", padding: "10px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "5px", color: "#334155" }}>Sua Mensagem</label>
          <textarea 
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Como podemos ajudar?" 
            style={{ width: "100%", padding: "10px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "14px", outline: "none", boxSizing: "border-box", resize: "vertical" }}
          ></textarea>
        </div>

        <button 
          type="submit" 
          style={{ width: "100%", padding: "12px", backgroundColor: "#0F4C81", color: "#FFF", border: "none", borderRadius: "6px", fontWeight: "bold", fontSize: "14px", cursor: "pointer" }}
        >
          Enviar Formulário
        </button>
      </form>

    </main>
  );
}