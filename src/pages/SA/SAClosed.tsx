import React from 'react';

export function SAClosed() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#07030f', fontFamily: "'Calibri', sans-serif", alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <img src="/K_white.png" alt="K" style={{ height: 44, opacity: 0.45, marginBottom: 28 }} />
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <h1 style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(1.5rem,3.5vw,2.2rem)', fontWeight: 800, margin: '0 0 12px', fontFamily: "'Space Grotesk', sans-serif" }}>
        Formulario cerrado
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 15, lineHeight: 1.8, maxWidth: 420 }}>
        El período de registro para la Sociedad Anónima está cerrado actualmente. Si tienes dudas, contáctanos.
      </p>
      <a href="mailto:info@kontaxes.com" style={{ marginTop: 28, color: '#a78bfa', fontSize: 14, textDecoration: 'none' }}>
        info@kontaxes.com
      </a>
    </div>
  );
}
