import React from 'react';

export function SADone({ email }: { email: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#07030f', fontFamily: "'Calibri', sans-serif", alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <img src="/K_white.png" alt="K" style={{ height: 52, filter: 'drop-shadow(0 0 28px rgba(16,185,129,0.7))', marginBottom: 28 }} />
      <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
      <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, margin: '0 0 12px', fontFamily: "'Space Grotesk', sans-serif" }}>
        ¡Registro completado!
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, lineHeight: 1.8, maxWidth: 480, margin: '0 0 32px' }}>
        Hemos recibido toda la información de la Sociedad Anónima correctamente desde <strong style={{ color: '#a78bfa' }}>{email}</strong>. Nuestro equipo revisará los datos y te contactará para los siguientes pasos.
      </p>
      <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 14, padding: '20px 28px', maxWidth: 400 }}>
        <div style={{ color: '#34d399', fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Próximos pasos</div>
        {['KONTAXES revisará tu información.', 'Te contactaremos en los próximos días hábiles.', 'Coordinaremos la firma ante Notario.'].map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
            <span style={{ color: '#34d399', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>{t}</span>
          </div>
        ))}
      </div>
      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 32 }}>
        info@kontaxes.com · +502 3517-4713 · kontaxes.com
      </p>
    </div>
  );
}
