import React from 'react';
import { type DatosSociedad } from '../types';
import { Field, Grid, Input, NavButtons, SectionCard, Select, Textarea } from './shared';

interface Props {
  data: Partial<DatosSociedad>;
  onChange: (d: Partial<DatosSociedad>) => void;
  onNext: () => void;
}

export function StepSociedad({ data, onChange, onNext }: Props) {
  const f = <K extends keyof DatosSociedad>(k: K) => (v: string) => onChange({ ...data, [k]: v });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext();
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ color: '#fff', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, margin: '0 0 6px', fontFamily: "'Space Grotesk', sans-serif" }}>
        🏢 Datos de la Sociedad
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: '0 0 28px' }}>
        Información general de la empresa que se va a constituir.
      </p>

      <SectionCard title="Identificación">
        <Grid cols={1}>
          <Field label="Denominación Social (nombre de la empresa)" required hint="Incluye al final 'Sociedad Anónima' o 'S.A.'">
            <Input value={data.denominacion ?? ''} onChange={f('denominacion')} placeholder="Ej. Comercial San José, Sociedad Anónima" required />
          </Field>
          <Field label="Objeto Social (actividad principal)" required hint="Describe a qué se dedicará la empresa.">
            <Textarea value={data.objeto_social ?? ''} onChange={f('objeto_social')} placeholder="Ej. Compra, venta e importación de artículos de consumo masivo..." rows={3} />
          </Field>
        </Grid>
      </SectionCard>

      <SectionCard title="Capital Social">
        <Grid cols={3}>
          <Field label="Capital Autorizado (Q)" required>
            <Input value={data.capital_autorizado ?? ''} onChange={f('capital_autorizado')} placeholder="Ej. 50,000.00" required />
          </Field>
          <Field label="Capital Suscrito (Q)" required>
            <Input value={data.capital_suscrito ?? ''} onChange={f('capital_suscrito')} placeholder="Ej. 25,000.00" required />
          </Field>
          <Field label="Capital Pagado (Q)" required>
            <Input value={data.capital_pagado ?? ''} onChange={f('capital_pagado')} placeholder="Ej. 12,500.00" required />
          </Field>
        </Grid>
        <div style={{ marginTop: 16 }}>
          <Field label="Moneda">
            <Select value={data.moneda ?? 'GTQ'} onChange={f('moneda')}>
              <option value="GTQ">Quetzal guatemalteco (Q)</option>
              <option value="USD">Dólar estadounidense ($)</option>
            </Select>
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Constitución">
        <Grid cols={1}>
          <Field label="Domicilio Social" required hint="Ciudad/municipio donde tendrá su sede la sociedad.">
            <Input value={data.domicilio ?? ''} onChange={f('domicilio')} placeholder="Ej. Ciudad de Guatemala, Guatemala" required />
          </Field>
        </Grid>
        <Grid cols={2}>
          <Field label="Plazo de Duración">
            <Select value={data.plazo_duracion ?? 'indefinido'} onChange={f('plazo_duracion')}>
              <option value="indefinido">Indefinido</option>
              <option value="10">10 años</option>
              <option value="25">25 años</option>
              <option value="50">50 años</option>
              <option value="99">99 años</option>
            </Select>
          </Field>
          <Field label="Ejercicio Contable">
            <Select value={data.ejercicio_contable ?? 'enero-diciembre'} onChange={f('ejercicio_contable')}>
              <option value="enero-diciembre">Enero a Diciembre</option>
              <option value="julio-junio">Julio a Junio</option>
              <option value="otro">Otro</option>
            </Select>
          </Field>
        </Grid>
      </SectionCard>

      <NavButtons onNext={onNext} nextLabel="Continuar con Socios →" />
    </form>
  );
}
