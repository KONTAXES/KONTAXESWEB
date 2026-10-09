import React from 'react';

const BASE = '/capacitaciones/odoo';
const PDF1 = `${BASE}/Guia_Usuario_01_Introduccion_a_Odoo.pdf`;
const PDF2 = `${BASE}/Guia_Usuario_02_CRM_Ventas_Suscripciones_Alquiler.pdf`;

/* ── Design tokens ─────────────────────────────────────────── */
const T = {
  ink:       '#111316',
  hero2:     '#1B1D21',
  accent:    '#2563EB',
  accentSoft:'#EAF1FF',
  graphite:  '#2B2F36',
  muted:     '#5D6470',
  line:      '#E3E6EA',
  soft:      '#F5F6F8',
} as const;

/* ── Octagon clip-path ─────────────────────────────────────── */
const OCTA = 'polygon(29% 0,71% 0,100% 29%,100% 71%,71% 100%,29% 100%,0 71%,0 29%)';

function Octagon({ size, color, style }: { size: number; color: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: size, height: size,
      background: color,
      clipPath: OCTA,
      flexShrink: 0,
      ...style,
    }} />
  );
}

const guias = [
  {
    num: '01',
    title: 'Introducción a Odoo',
    subtitle: 'Conozca la interfaz. Empiece aquí.',
    pages: 21,
    pdf: PDF1,
    cover: `${BASE}/portada-guia-1-01.png`,
    items: [
      'Barra superior, menú de inicio y bandeja de mensajes y actividades',
      'Panel de control, vistas (lista, kanban, formulario, calendario, pivote…)',
      'Buscar, filtrar, agrupar y guardar favoritos',
      'Formulario, tipos de campo y botones inteligentes',
      'Chatter: mensajes, notas y seguidores',
      'Actividades, preferencias y atajos de teclado',
      'Hoja de referencia de íconos',
    ],
  },
  {
    num: '02',
    title: 'Ventas en Odoo',
    subtitle: 'CRM · Ventas · Suscripciones · Alquiler',
    pages: 18,
    pdf: PDF2,
    cover: `${BASE}/portada-guia-2-01.png`,
    items: [
      'CRM: flujo de oportunidades, ganar, perder y pronóstico',
      'Ventas: cotizar, enviar, confirmar y facturar',
      'Suscripciones: contratos recurrentes, renovación, venta adicional y cierre',
      'Alquiler: reservar, recoger, devolver y depósitos',
      'Hoja de referencia rápida por módulo',
    ],
  },
];

const proximas = [
  'Guía 3 · Inventario',
  'Guía 4 · Compras',
  'Guía del administrador · Configuración',
];

export function GuiasOdoo19() {
  return (
    <>
      {/* noindex injected via meta in <head> — handled by Helmet or manually */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .guias-page { font-family: 'Inter', system-ui, sans-serif; color: ${T.graphite}; background: #fff; }
        .guias-page * { box-sizing: border-box; }
        .guias-pill { display: inline-flex; align-items: center; gap: 6px; border: 1px solid rgba(255,255,255,0.3); border-radius: 999px; padding: 6px 14px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; color: rgba(255,255,255,0.9); }
        .btn-primary { display: inline-block; background: ${T.accent}; color: #fff; font-weight: 700; font-size: 15px; padding: 13px 24px; border-radius: 8px; text-decoration: none; transition: background 0.15s; }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-outline-white { display: inline-block; border: 2px solid rgba(255,255,255,0.5); color: #fff; font-weight: 600; font-size: 15px; padding: 11px 22px; border-radius: 8px; text-decoration: none; transition: border-color 0.15s; }
        .btn-outline-white:hover { border-color: #fff; }
        .btn-accent { display: inline-block; background: ${T.accent}; color: #fff; font-weight: 600; font-size: 14px; padding: 10px 20px; border-radius: 7px; text-decoration: none; transition: background 0.15s; }
        .btn-accent:hover { background: #1d4ed8; }
        .btn-outline-accent { display: inline-block; border: 1.5px solid ${T.accent}; color: ${T.accent}; font-weight: 600; font-size: 14px; padding: 9px 20px; border-radius: 7px; text-decoration: none; transition: background 0.15s; }
        .btn-outline-accent:hover { background: ${T.accentSoft}; }
        .guide-card { background: #fff; border: 1px solid ${T.line}; border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; }
        .guide-card-body { padding: 28px; flex: 1; display: flex; flex-direction: column; gap: 16px; }
        .step-circle { width: 36px; height: 36px; border-radius: 50%; background: ${T.accentSoft}; color: ${T.accent}; font-weight: 800; font-size: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .coming-pill { display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 1px solid ${T.line}; border-radius: 999px; padding: 8px 18px; font-size: 14px; font-weight: 600; color: ${T.graphite}; }
        .coming-tag { font-size: 10px; font-weight: 700; letter-spacing: 0.06em; color: ${T.muted}; background: ${T.soft}; padding: 2px 8px; border-radius: 999px; }
        @media (max-width: 767px) {
          .hero-btns { flex-direction: column !important; }
          .guides-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .coming-row { flex-direction: column !important; align-items: flex-start !important; }
          .footer-sect { flex-direction: column !important; gap: 12px !important; }
          .footer-legal { flex-direction: column !important; gap: 6px !important; text-align: center !important; }
        }
      `}</style>

      <div className="guias-page">

        {/* ── HERO ──────────────────────────────────────────── */}
        <section style={{ background: T.ink, position: 'relative', overflow: 'hidden', padding: '60px 16px 56px' }}>
          {/* Octagon decorations */}
          <Octagon size={260} color={T.hero2} style={{ position: 'absolute', top: -60, right: -80, opacity: 0.9 }} />
          <Octagon size={160} color={T.hero2} style={{ position: 'absolute', top: 60, right: 120, opacity: 0.5 }} />
          <Octagon size={40}  color={T.accent} style={{ position: 'absolute', bottom: 80, left: 24 }} />

          <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            {/* Logo KTX LAB */}
            <img
              src={`${BASE}/ktxlab-logo-blanco.png`}
              alt="Logo de KTX LAB"
              style={{ height: 56, marginBottom: 36, display: 'block' }}
            />

            {/* Pill kicker */}
            <div style={{ marginBottom: 20 }}>
              <span className="guias-pill">GUÍAS DEL USUARIO · ODOO 19</span>
            </div>

            {/* Title */}
            <h1 style={{ color: '#fff', fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 16px', maxWidth: 640, textWrap: 'balance' }}>
              Aprenda a usar Odoo, paso a paso
            </h1>

            {/* Subtitle */}
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, lineHeight: 1.6, margin: '0 0 36px', maxWidth: 560 }}>
              Guías visuales para el trabajo diario: cada pantalla, ícono y botón explicado con imágenes señaladas.
            </p>

            {/* Buttons */}
            <div className="hero-btns" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
              <a className="btn-primary" href={PDF1} target="_blank" rel="noopener noreferrer">
                Empezar por la Guía 1
              </a>
              <a className="btn-outline-white" href="#guias">
                Ver todas las guías
              </a>
            </div>

            {/* KTX LAB attribution */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 18px', maxWidth: 480 }}>
              <img src={`${BASE}/ktxlab-simbolo-blanco.png`} alt="KTX LAB" style={{ height: 22, objectFit: 'contain', opacity: 0.7 }} />
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                Material elaborado y patrocinado por KTX LAB · Versión 2.0 · Octubre 2026
              </p>
            </div>
          </div>
        </section>

        {/* ── LAS GUÍAS ─────────────────────────────────────── */}
        <section id="guias" style={{ padding: '72px 16px', background: T.soft }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: T.ink, margin: '0 0 8px', textWrap: 'balance' }}>
              Las guías
            </h2>
            <p style={{ color: T.muted, fontSize: 15, margin: '0 0 40px' }}>
              Dos guías diseñadas para ser leídas en orden.
            </p>

            <div className="guides-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {guias.map((g) => (
                <div key={g.num} className="guide-card">
                  {/* Cover image */}
                  <div style={{ position: 'relative', background: T.ink }}>
                    <img
                      src={g.cover}
                      alt={`Portada de la Guía ${g.num}: ${g.title}`}
                      style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block', opacity: 0.92 }}
                    />
                    {/* Number badge */}
                    <div style={{ position: 'absolute', bottom: -20, left: 24 }}>
                      <Octagon size={44} color={T.ink} style={{}}>
                      </Octagon>
                      <span style={{ position: 'absolute', top: 0, left: 0, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15 }}>
                        {g.num}
                      </span>
                    </div>
                  </div>

                  <div className="guide-card-body" style={{ paddingTop: 36 }}>
                    <div>
                      <h3 style={{ font: '700 18px/1.3 Inter,system-ui,sans-serif', color: T.ink, margin: '0 0 4px' }}>{g.title}</h3>
                      <p style={{ color: T.accent, fontSize: 13, fontWeight: 600, margin: 0 }}>{g.subtitle}</p>
                    </div>

                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {g.items.map((item, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: T.graphite, lineHeight: 1.5 }}>
                          <Octagon size={8} color={T.accent} style={{ marginTop: 5, flexShrink: 0 }} />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>{g.pages} páginas · PDF</p>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 'auto', paddingTop: 8 }}>
                      <a className="btn-accent" href={g.pdf} target="_blank" rel="noopener noreferrer">
                        Ver guía
                      </a>
                      <a className="btn-outline-accent" href={g.pdf} download>
                        Descargar PDF
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CÓMO USAR ─────────────────────────────────────── */}
        <section style={{ padding: '72px 16px', background: '#fff' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: T.ink, margin: '0 0 40px', textWrap: 'balance' }}>
              Cómo usar las guías
            </h2>
            <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
              {[
                { n: '1', title: 'Lea la Guía 1 primero.', body: 'Todo lo que aprenda ahí se repite en cada aplicación.' },
                { n: '2', title: 'Siga los números.', body: 'Cada imagen tiene marcadores azules numerados; la explicación con el mismo número está debajo.' },
                { n: '3', title: 'Practique en la base de pruebas.', body: 'Repita cada tarea paso a paso antes de hacerlo en la base real.' },
              ].map((s) => (
                <div key={s.n} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="step-circle">{s.n}</div>
                  <div>
                    <strong style={{ display: 'block', fontSize: 15, color: T.ink, marginBottom: 6 }}>{s.title}</strong>
                    <p style={{ fontSize: 14, color: T.muted, margin: 0, lineHeight: 1.6 }}>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRÓXIMAMENTE ──────────────────────────────────── */}
        <section style={{ padding: '56px 16px', background: T.soft }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: T.ink, margin: '0 0 24px' }}>Próximamente</h2>
            <div className="coming-row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {proximas.map((p) => (
                <span key={p} className="coming-pill">
                  <span className="coming-tag">Próximamente</span>
                  {p}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── PIE DE SECCIÓN ────────────────────────────────── */}
        <section style={{ padding: '40px 16px 0', background: '#fff', borderTop: `1px solid ${T.line}` }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div className="footer-sect" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 28, borderBottom: `1px solid ${T.line}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={`${BASE}/ktxlab-simbolo-negro.png`} alt="Símbolo KTX LAB" style={{ height: 24, width: 24, objectFit: 'contain' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: T.graphite }}>Material elaborado y patrocinado por KTX LAB</span>
              </div>
              <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>Implementación, configuración y capacitación en Odoo.</p>
            </div>
            <div className="footer-legal" style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 24px' }}>
              <p style={{ fontSize: 12, color: T.muted, margin: 0, textAlign: 'center' }}>
                Odoo es una marca registrada de Odoo S.A. KTX LAB no está afiliada a Odoo S.A.
              </p>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
