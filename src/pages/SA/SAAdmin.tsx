import React, { useEffect, useState } from 'react';
import { supabase, type SaRegistration } from '../../lib/supabase';

const ADMIN_PASSWORD = import.meta.env.VITE_SA_ADMIN_PASSWORD ?? 'kontaxes2026';

type Screen = 'login' | 'panel';

export function SAAdmin() {
  const [screen,   setScreen]   = useState<Screen>('login');
  const [pwd,      setPwd]      = useState('');
  const [error,    setError]    = useState('');
  const [active,   setActive]   = useState<boolean | null>(null);
  const [rows,     setRows]     = useState<SaRegistration[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState<SaRegistration | null>(null);

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) { setScreen('panel'); loadData(); }
    else setError('Contraseña incorrecta');
  }

  async function loadData() {
    setLoading(true);
    const [{ data: cfg }, { data: regs }] = await Promise.all([
      supabase.from('sa_config').select('active').order('updated_at', { ascending: false }).limit(1).single(),
      supabase.from('sa_registrations').select('*').order('created_at', { ascending: false }),
    ]);
    if (cfg) setActive(cfg.active);
    if (regs) setRows(regs as SaRegistration[]);
    setLoading(false);
  }

  async function toggleActive() {
    const next = !active;
    await supabase.from('sa_config').update({ active: next, updated_at: new Date().toISOString() }).neq('id', '00000000-0000-0000-0000-000000000000');
    setActive(next);
  }

  if (screen === 'login') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07030f', fontFamily: "'Calibri', sans-serif" }}>
        <div style={{ width: '100%', maxWidth: 360, padding: 24 }}>
          <img src="/K_white.png" alt="K" style={{ height: 36, marginBottom: 28, filter: 'drop-shadow(0 0 12px rgba(147,51,234,0.6))' }} />
          <h2 style={{ color: '#fff', fontWeight: 800, margin: '0 0 24px', fontFamily: "'Space Grotesk', sans-serif" }}>Panel Admin · S.A.</h2>
          <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Contraseña de administrador" autoFocus
              style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, outline: 'none' }} />
            {error && <div style={{ color: '#f87171', fontSize: 13 }}>{error}</div>}
            <button type="submit" style={{ padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#10b981)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07030f', fontFamily: "'Calibri', sans-serif" }}>
      {/* Header */}
      <header style={{ padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/K_white.png" alt="K" style={{ height: 28 }} />
          <span style={{ color: '#fff', fontWeight: 700 }}>Admin · S.A. Portal</span>
        </div>
        <button onClick={loadData} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>
          ↻ Refrescar
        </button>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>

        {/* Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: active ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.07)', border: `1px solid ${active ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.25)'}`, borderRadius: 16, padding: '20px 24px', marginBottom: 28 }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
              {active ? '🟢 Formulario ACTIVO' : '🔴 Formulario CERRADO'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              {active ? 'Los socios pueden acceder y llenar el formulario.' : 'El formulario está cerrado. Los socios verán pantalla de cierre.'}
            </div>
          </div>
          <button onClick={toggleActive}
            style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: active ? 'rgba(239,68,68,0.2)' : 'linear-gradient(135deg,#7c3aed,#10b981)', color: active ? '#f87171' : '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14, transition: 'all 0.2s' }}>
            {active ? 'Desactivar' : 'Activar'}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
          {[
            ['Total registros', rows.length, '#c084fc'],
            ['Completados', rows.filter(r => r.completed).length, '#34d399'],
            ['En progreso', rows.filter(r => !r.completed).length, '#fbbf24'],
          ].map(([label, value, color]) => (
            <div key={label as string} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px', textAlign: 'center' }}>
              <div style={{ color, fontSize: 36, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>{value as number}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>{label as string}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 40 }}>Cargando…</div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(147,51,234,0.15)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Correo', 'Estado', 'Sociedad', 'Socios', 'Fecha', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#a78bfa', fontWeight: 700, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>No hay registros aún</td></tr>
                )}
                {rows.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', color: '#e2e8f0' }}>{r.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: r.completed ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.12)', color: r.completed ? '#34d399' : '#fcd34d' }}>
                        {r.completed ? '✓ Completado' : '⏳ En progreso'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)' }}>
                      {(r.progress as any)?.sociedad?.denominacion || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)' }}>
                      {(r.progress as any)?.socios?.length ?? 0}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
                      {new Date(r.created_at).toLocaleDateString('es-GT')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => setSelected(r)}
                        style={{ background: 'rgba(147,51,234,0.12)', border: '1px solid rgba(147,51,234,0.25)', color: '#c084fc', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', overflowY: 'auto', zIndex: 9999 }}
          onClick={() => setSelected(null)}>
          <div style={{ background: '#0f0a1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, maxWidth: 720, width: '100%' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ color: '#fff', margin: 0, fontFamily: "'Space Grotesk',sans-serif" }}>{selected.email}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <pre style={{ color: '#e2e8f0', fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 18, maxHeight: '70vh', overflowY: 'auto' }}>
              {JSON.stringify(selected.progress, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
