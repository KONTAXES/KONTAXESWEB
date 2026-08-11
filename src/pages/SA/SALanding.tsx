import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Props {
  onRegistered: (email: string, id: string) => void;
}

type State = 'idle' | 'loading' | 'sent' | 'already' | 'error';

export function SALanding({ onRegistered }: Props) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [msg,   setMsg]   = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState('loading');

    try {
      // Check if already registered
      const { data: existing } = await supabase
        .from('sa_registrations')
        .select('id, completed')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (existing) {
        if (existing.completed) {
          setState('already');
          setMsg('Este correo ya completó su registro. Si tienes alguna duda, contacta a KONTAXES.');
        } else {
          // Resend magic link
          await supabase.auth.signInWithOtp({
            email: email.toLowerCase().trim(),
            options: { emailRedirectTo: `${window.location.origin}/sa` },
          });
          setState('sent');
          setMsg('Ya tienes un registro en progreso. Te reenviamos el enlace de acceso.');
        }
        return;
      }

      // New registration — send magic link
      const { error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: { emailRedirectTo: `${window.location.origin}/sa` },
      });

      if (error) throw error;
      setState('sent');
      setMsg('');
    } catch {
      setState('error');
      setMsg('Ocurrió un error. Intenta de nuevo o contacta a KONTAXES.');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#07030f', fontFamily: "'Calibri', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <header style={{ padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/K_white.png" alt="KONTAXES" style={{ height: 32, width: 'auto', filter: 'drop-shadow(0 0 12px rgba(147,51,234,0.6))' }} />
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>KONTAXES</div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Portal de Constitución de Sociedad Anónima</div>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: 520 }}>

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(147,51,234,0.12)', border: '1px solid rgba(147,51,234,0.3)', borderRadius: 999, padding: '5px 16px', marginBottom: 24 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span style={{ color: '#a78bfa', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Formulario Activo</span>
          </div>

          <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.2, margin: '0 0 12px', fontFamily: "'Space Grotesk', sans-serif" }}>
            Constitución de{' '}
            <span style={{ background: 'linear-gradient(90deg, #c084fc, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Sociedad Anónima
            </span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.7, margin: '0 0 36px' }}>
            Ingresa tu correo electrónico y recibirás un enlace de acceso único y seguro. El formulario guarda tu progreso automáticamente.
          </p>

          {state === 'sent' ? (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 16, padding: '28px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
              <div style={{ color: '#34d399', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>¡Enlace enviado!</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.7 }}>
                {msg || 'Revisa tu bandeja de entrada y haz clic en el enlace para comenzar el formulario. El enlace es válido por 1 hora.'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 16 }}>
                ¿No llegó? Revisa spam o{' '}
                <button onClick={() => setState('idle')} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', textDecoration: 'underline', fontSize: 12 }}>
                  intenta de nuevo
                </button>
              </div>
            </div>
          ) : state === 'already' ? (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: '28px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
              <div style={{ color: '#f87171', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Registro ya completado</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.7 }}>{msg}</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nombre@correo.com"
                style={{
                  width: '100%', padding: '14px 18px', borderRadius: 12, fontSize: 15,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff', outline: 'none', marginBottom: 16, boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(147,51,234,0.6)')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
              {state === 'error' && (
                <div style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{msg}</div>
              )}
              <button
                type="submit"
                disabled={state === 'loading'}
                style={{
                  width: '100%', padding: '15px', borderRadius: 12, fontSize: 15, fontWeight: 700,
                  background: 'linear-gradient(135deg, #7c3aed, #10b981)', color: '#fff', border: 'none',
                  cursor: state === 'loading' ? 'wait' : 'pointer',
                  boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
                  opacity: state === 'loading' ? 0.7 : 1,
                  transition: 'opacity 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => state !== 'loading' && ((e.target as HTMLElement).style.transform = 'translateY(-1px)')}
                onMouseLeave={e => ((e.target as HTMLElement).style.transform = 'none')}
              >
                {state === 'loading' ? 'Enviando…' : 'Enviar enlace de acceso →'}
              </button>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
                El enlace es de uso único y expira en 1 hora. Tu información está encriptada.
              </p>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '16px 32px', borderTop: '1px solid rgba(255,255,255,0.04)', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
        KONTAXES · kontaxes.com · info@kontaxes.com · +502 3517-4713
      </footer>
    </div>
  );
}
