import React from 'react';

export const PURPLE = '#9333ea';
export const EMERALD = '#10b981';

export const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#e2e8f0', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  transition: 'border-color 0.2s',
};

export function Field({
  label, required, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}{required && <span style={{ color: '#f87171', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11 }}>{hint}</span>}
    </div>
  );
}

export function Input({
  value, onChange, placeholder, type = 'text', required,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
  const [focused, setFocused] = React.useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      style={{ ...fieldStyle, borderColor: focused ? 'rgba(147,51,234,0.6)' : 'rgba(255,255,255,0.1)' }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

export function Select({
  value, onChange, children, required,
}: {
  value: string; onChange: (v: string) => void; children: React.ReactNode; required?: boolean;
}) {
  const [focused, setFocused] = React.useState(false);
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      required={required}
      style={{ ...fieldStyle, borderColor: focused ? 'rgba(147,51,234,0.6)' : 'rgba(255,255,255,0.1)', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 36 }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {children}
    </select>
  );
}

export function Textarea({
  value, onChange, placeholder, rows = 3,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  const [focused, setFocused] = React.useState(false);
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{ ...fieldStyle, resize: 'vertical', borderColor: focused ? 'rgba(147,51,234,0.6)' : 'rgba(255,255,255,0.1)' }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

export function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px', marginBottom: 20 }}>
      <h3 style={{ color: '#c084fc', fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 20px', paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

export function Grid({ cols = 2, children }: { cols?: number; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
      {children}
    </div>
  );
}

export function NavButtons({
  onBack, onNext, nextLabel = 'Continuar →', loading,
}: {
  onBack?: () => void; onNext?: () => void; nextLabel?: string; loading?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 32, justifyContent: 'space-between' }}>
      {onBack ? (
        <button type="button" onClick={onBack}
          style={{ padding: '12px 24px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.2s' }}
          onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)'; (e.target as HTMLElement).style.color = '#fff'; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}
        >
          ← Anterior
        </button>
      ) : <div />}
      {onNext && (
        <button type="submit"
          disabled={loading}
          style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #10b981)', color: '#fff', cursor: loading ? 'wait' : 'pointer', fontSize: 14, fontWeight: 700, boxShadow: '0 4px 20px rgba(124,58,237,0.3)', opacity: loading ? 0.7 : 1, transition: 'all 0.2s' }}
          onMouseEnter={e => !loading && ((e.target as HTMLElement).style.transform = 'translateY(-1px)')}
          onMouseLeave={e => ((e.target as HTMLElement).style.transform = 'none')}
        >
          {loading ? 'Enviando…' : nextLabel}
        </button>
      )}
    </div>
  );
}
