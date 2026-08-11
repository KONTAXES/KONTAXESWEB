import React from 'react';
import { type FormProgress } from '../types';

interface Props {
  progress:    FormProgress;
  submitting:  boolean;
  onBack:      () => void;
  onSubmit:    () => void;
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: 12, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, minWidth: 200, flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#e2e8f0', fontSize: 13, wordBreak: 'break-word' }}>{value}</span>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px', marginBottom: 16 }}>
      <h4 style={{ color: '#a78bfa', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 14px' }}>{title}</h4>
      {children}
    </div>
  );
}

export function StepRevision({ progress, submitting, onBack, onSubmit }: Props) {
  const { sociedad: s, socios, junta } = progress;

  return (
    <div>
      <h2 style={{ color: '#fff', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, margin: '0 0 6px', fontFamily: "'Space Grotesk', sans-serif" }}>
        ✅ Revisión y Envío
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: '0 0 28px' }}>
        Revisa que toda la información esté correcta antes de enviar. Una vez enviado no podrás modificarlo.
      </p>

      <Block title="🏢 Datos de la Sociedad">
        <Row label="Denominación Social"         value={s.denominacion} />
        <Row label="Objeto Social"                value={s.objeto_social} />
        <Row label="Capital Autorizado"           value={s.capital_autorizado ? `Q ${s.capital_autorizado}` : ''} />
        <Row label="Capital Suscrito"             value={s.capital_suscrito ? `Q ${s.capital_suscrito}` : ''} />
        <Row label="Capital Pagado"               value={s.capital_pagado ? `Q ${s.capital_pagado}` : ''} />
        <Row label="Moneda"                       value={s.moneda} />
        <Row label="Domicilio"                    value={s.domicilio} />
        <Row label="Plazo de Duración"            value={s.plazo_duracion} />
        <Row label="Ejercicio Contable"           value={s.ejercicio_contable} />
      </Block>

      {socios.map((socio, i) => (
        <Block key={socio.id} title={`👤 Socio ${i + 1}: ${socio.nombre_completo || '—'}`}>
          <Row label="Nombre Completo"     value={socio.nombre_completo} />
          <Row label="DPI"                 value={socio.dpi} />
          <Row label="NIT"                 value={socio.nit} />
          <Row label="Fecha de Nacimiento" value={socio.fecha_nacimiento} />
          <Row label="Lugar de Nacimiento" value={socio.lugar_nacimiento} />
          <Row label="Nacionalidad"        value={socio.nacionalidad} />
          <Row label="Estado Civil"        value={socio.estado_civil} />
          <Row label="Profesión"           value={socio.profesion} />
          <Row label="Dirección"           value={socio.direccion} />
          <Row label="Teléfono"            value={socio.telefono} />
          <Row label="Correo"              value={socio.correo} />
          <Row label="Número de Acciones"  value={socio.num_acciones} />
          <Row label="Valor por Acción"    value={socio.valor_accion ? `Q ${socio.valor_accion}` : ''} />
          <Row label="Cargo en Junta"      value={socio.cargo_junta || 'Accionista solamente'} />
        </Block>
      ))}

      <Block title="⚖️ Junta Directiva">
        <Row label="Gerente General"   value={junta.gerente_general} />
        <Row label="Presidente"        value={junta.presidente} />
        <Row label="Secretario/a"      value={junta.secretario} />
        <Row label="Tesorero/a"        value={junta.tesorero} />
        <Row label="Vocales"           value={junta.vocales} />
      </Block>

      <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
        Al enviar, KONTAXES recibirá toda tu información de forma segura y se pondrá en contacto contigo para los siguientes pasos del proceso de constitución.
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', marginTop: 8 }}>
        <button type="button" onClick={onBack}
          style={{ padding: '12px 24px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          ← Editar
        </button>
        <button type="button" onClick={onSubmit} disabled={submitting}
          style={{ padding: '14px 36px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #10b981)', color: '#fff', cursor: submitting ? 'wait' : 'pointer', fontSize: 15, fontWeight: 800, boxShadow: '0 4px 24px rgba(124,58,237,0.4)', opacity: submitting ? 0.7 : 1, transition: 'all 0.2s' }}>
          {submitting ? 'Enviando…' : '🚀 Enviar registro completo'}
        </button>
      </div>
    </div>
  );
}
