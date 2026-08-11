import React from 'react';
import { type DatosSocio, type JuntaDirectiva } from '../types';
import { Field, Grid, Input, NavButtons, SectionCard, Textarea } from './shared';

interface Props {
  junta:    Partial<JuntaDirectiva>;
  socios:   DatosSocio[];
  onChange: (j: Partial<JuntaDirectiva>) => void;
  onBack:   () => void;
  onNext:   () => void;
}

export function StepJunta({ junta, socios, onChange, onBack, onNext }: Props) {
  const f = <K extends keyof JuntaDirectiva>(k: K) => (v: string) => onChange({ ...junta, [k]: v });

  const nombresOpciones = socios.map(s => s.nombre_completo).filter(Boolean);

  function handleSubmit(e: React.FormEvent) { e.preventDefault(); onNext(); }

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ color: '#fff', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, margin: '0 0 6px', fontFamily: "'Space Grotesk', sans-serif" }}>
        ⚖️ Junta Directiva y Administración
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: '0 0 28px' }}>
        Personas que administrarán y representarán legalmente la sociedad.
        Pueden ser los mismos socios u otras personas.
      </p>

      {nombresOpciones.length > 0 && (
        <div style={{ background: 'rgba(147,51,234,0.07)', border: '1px solid rgba(147,51,234,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
          💡 Socios registrados: {nombresOpciones.join(' · ')}
        </div>
      )}

      <SectionCard title="Órgano de Administración">
        <Grid cols={1}>
          <Field label="Gerente General" required hint="Representante legal de la sociedad. Firma documentos oficiales.">
            <Input value={junta.gerente_general ?? ''} onChange={f('gerente_general')} placeholder="Nombre completo del Gerente General" required />
          </Field>
          <Field label="Presidente del Consejo de Administración" required>
            <Input value={junta.presidente ?? ''} onChange={f('presidente')} placeholder="Nombre completo del Presidente" required />
          </Field>
        </Grid>
        <Grid cols={2}>
          <Field label="Secretario/a" required>
            <Input value={junta.secretario ?? ''} onChange={f('secretario')} placeholder="Nombre completo" required />
          </Field>
          <Field label="Tesorero/a" required>
            <Input value={junta.tesorero ?? ''} onChange={f('tesorero')} placeholder="Nombre completo" required />
          </Field>
        </Grid>
        <div style={{ marginTop: 16 }}>
          <Field label="Vocales" hint="Nombres separados por coma si hay más de uno. Puede quedar vacío si no aplica.">
            <Textarea value={junta.vocales ?? ''} onChange={f('vocales')} placeholder="Ej. Juan López, María García" rows={2} />
          </Field>
        </div>
      </SectionCard>

      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Revisar y Enviar →" />
    </form>
  );
}
