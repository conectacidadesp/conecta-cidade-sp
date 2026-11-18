"use client";
import { useState, useEffect } from "react";

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Verifica se já está rodando como app instalado
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // 2. Verifica se é celular (oculta no computador)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipad|ipod|android/.test(userAgent);
    if (!isMobile) return;

    // 3. Verifica se o usuário já fechou o aviso recentemente
    const dismissed = localStorage.getItem("pwa_banner_dismissed");
    if (dismissed) return;

    // Detecta se é iPhone/iPad
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    if (iosDevice) {
      // No iPhone, exibe o banner após 2 segundos
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }

    // No Android, captura o evento nativo de instalação do navegador
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    // Dispara a janela nativa de instalação do celular
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSInstructions(false);
    localStorage.setItem("pwa_banner_dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Banner Flutuante Inferior (Apenas Celular) */}
      <div
        style={{
          position: "fixed",
          bottom: 14,
          left: 12,
          right: 12,
          backgroundColor: "#0B2545",
          color: "#FFFFFF",
          borderRadius: 14,
          padding: "12px 14px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.35)",
          zIndex: 9998,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          border: "1px solid #1E3A8A",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <img
            src="https://ahiyxrdplhecskzoiogd.supabase.co/storage/v1/object/public/site-assets/Logo%20redonda.png"
            alt="App Conecta Cidade SP"
            style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0, backgroundColor: "#fff" }}
          />
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: "bold", lineHeight: "1.2" }}>
              Instale o Aplicativo
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#CBD5E1", lineHeight: "1.2" }}>
              Compre e venda muito mais rápido!
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <button
            onClick={handleInstallClick}
            style={{
              backgroundColor: "#22C55E",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(34, 197, 94, 0.4)",
            }}
          >
            Instalar
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Fechar"
            style={{
              background: "none",
              border: "none",
              color: "#94A3B8",
              fontSize: 18,
              cursor: "pointer",
              padding: "4px",
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Modal de Instrução Rápida para iPhone (Safari) */}
      {showIOSInstructions && (
        <div
          onClick={() => setShowIOSInstructions(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#FFFFFF",
              color: "#0F172A",
              borderRadius: 16,
              padding: 20,
              width: "100%",
              maxWidth: 380,
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <h4 style={{ margin: "0 0 8px", fontSize: 16, color: "#0B2545" }}>
              Instalar no iPhone
            </h4>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#475569", lineHeight: "1.4" }}>
              Para adicionar o <strong>Conecta Cidade SP</strong> na sua tela inicial:
            </p>
            <div style={{ textAlign: "left", fontSize: 13, backgroundColor: "#F8FAFC", padding: 12, borderRadius: 10, marginBottom: 16 }}>
              <p style={{ margin: "0 0 8px" }}>
                1. Toque no ícone de <strong>Compartilhar</strong> (quadrado com seta para cima) na barra inferior do Safari.
              </p>
              <p style={{ margin: 0 }}>
                2. Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.
              </p>
            </div>
            <button
              onClick={() => setShowIOSInstructions(false)}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#0088FF",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}