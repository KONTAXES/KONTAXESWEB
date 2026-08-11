import React, { useState } from 'react';
import { type DatosSocio, EMPTY_SOCIO } from '../types';
import { Field, Grid, Input, NavButtons, SectionCard, Select } from './shared';

interface Props {
  socios: DatosSocio[];
  onChange: (s: DatosSocio[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepSocios({ socios, onChange, onBack, onNext }: Props) {
  const [active, setActive] = useState(0);

  function updateSocio(i: number, patch: Partial<DatosSocio>) {
    const next = socios.map((s, idx) => idx === i ? { ...s, ...patch } : s);
    onChange(next);
  }

  function addSocio() {
    onChange([...socios, EMPTY_SOCIO()]);
    setActive(socios.length);
  }

  function removeSocio(i: number) {
    if (socios.length <= 2) return;
    const next = socios.filter((_, idx) => idx !== i);
    onChange(next);
    setActive(Math.min(active, next.length - 1));
  }

  function handleSubmit(e: React.FormEvent) { e.preventDefault(); onNext(); }

  const s = socios[active] ?? socios[0];
  const f = <K extends keyof DatosSocio>(k: K) => (v: string) => updateSocio(active, { [k]: v });

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ color: '#fff', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, margin: '0 0 6px', fontFamily: "'Space Grotesk', sans-serif" }}>
        👥 Socios
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: '0 0 20px' }}>
        Datos personales de cada socio accionista de la sociedad.
      </p>

      {/* Socio tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {socios.map((s, i) => (
          <button key={s.id} type="button" onClick={() => setActive(i)}
            style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${i === active ? 'rgba(147,51,234,0.6)' : 'rgba(255,255,255,0.1)'}`, background: i === active ? 'rgba(147,51,234,0.15)' : 'rgba(255,255,255,0.03)', color: i === active ? '#c084fc' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s' }}>
            {s.nombre_completo.split(' ')[0] || `Socio ${i + 1}`}
          </button>
        ))}
        <button type="button" onClick={addSocio}
          style={{ padding: '8px 16px', borderRadius: 8, border: '1px dashed rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.06)', color: '#34d399', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s' }}>
          + Agregar socio
        </button>
      </div>

      <SectionCard title={`Datos personales — ${s.nombre_completo || `Socio ${active + 1}`}`}>
        <Grid cols={1}>
          <Field label="Nombre Completo" required>
            <Input value={s.nombre_completo} onChange={f('nombre_completo')} placeholder="Nombre completo tal como aparece en el DPI" required />
          </Field>
        </Grid>
        <Grid cols={2}>
          <Field label="DPI (Documento Personal de Identificación)" required>
            <Input value={s.dpi} onChange={f('dpi')} placeholder="0000 00000 0101" required />
          </Field>
          <Field label="NIT" required>
            <Input value={s.nit} onChange={f('nit')} placeholder="0000000-0" required />
          </Field>
          <Field label="Fecha de Nacimiento" required>
            <Input type="date" value={s.fecha_nacimiento} onChange={f('fecha_nacimiento')} required />
          </Field>
          <Field label="Lugar de Nacimiento" required>
            <Input value={s.lugar_nacimiento} onChange={f('lugar_nacimiento')} placeholder="Ciudad, Departamento, País" required />
          </Field>
          <Field label="Nacionalidad">
            <Input value={s.nacionalidad} onChange={f('nacionalidad')} placeholder="Guatemalteca" />
          </Field>
          <Field label="Estado Civil" required>
            <Select value={s.estado_civil} onChange={f('estado_civil')} required>
              <option value="">Seleccionar…</option>
              <option value="soltero">Soltero/a</option>
              <option value="casado">Casado/a</option>
              <option value="unido">Unido de hecho</option>
              <option value="divorciado">Divorciado/a</option>
              <option value="viudo">Viudo/a</option>
            </Select>
          </Field>
        </Grid>
        <div style={{ marginTop: 16 }}>
          <Field label="Profesión u Oficio" required>
            <Input value={s.profesion} onChange={f('profesion')} placeholder="Ej. Perito Contador, Ingeniero, Médico…" required />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Contacto y Domicilio">
        <Grid cols={1}>
          <Field label="Dirección de Domicilio Particular" required>
            <Input value={s.direccion} onChange={f('direccion')} placeholder="Calle, número, zona, municipio, departamento" required />
          </Field>
        </Grid>
        <Grid cols={2}>
          <Field label="Teléfono / Celular" required>
            <Input value={s.telefono} onChange={f('telefono')} placeholder="+502 0000-0000" required />
          </Field>
          <Field label="Correo Electrónico" required>
            <Input type="email" value={s.correo} onChange={f('correo')} placeholder="correo@ejemplo.com" required />
          </Field>
        </Grid>
      </SectionCard>

      <SectionCard title="Participación Accionaria">
        <Grid cols={2}>
          <Field label="Número de Acciones" required hint="Cantidad de acciones que este socio aportará.">
            <Input value={s.num_acciones} onChange={f('num_acciones')} placeholder="Ej. 500" required />
          </Field>
          <Field label="Valor por Acción (Q)" required>
            <Input value={s.valor_accion} onChange={f('valor_accion')} placeholder="Ej. 100.00" required />
          </Field>
        </Grid>
        <div style={{ marginTop: 16 }}>
          <Field label="¿Ejercerá cargo en la Junta Directiva?">
            <Select value={s.cargo_junta} onChange={f('cargo_junta')}>
              <option value="">Ninguno / Accionista solamente</option>
              <option value="gerente">Gerente General</option>
              <option value="presidente">Presidente del Consejo de Administración</option>
              <option value="secretario">Secretario</option>
              <option value="tesorero">Tesorero</option>
              <option value="vocal">Vocal</option>
            </Select>
          </Field>
        </div>
      </SectionCard>

      {socios.length > 2 && (
        <button type="button" onClick={() => removeSocio(active)}
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, marginBottom: 16 }}>
          🗑 Eliminar a {s.nombre_completo.split(' ')[0] || `Socio ${active + 1}`}
        </button>
      )}

      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Continuar con Junta Directiva →" />
    </form>
  );
}
