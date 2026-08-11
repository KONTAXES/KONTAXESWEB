import React, { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { EMPTY_PROGRESS, EMPTY_SOCIO, STEPS, type FormProgress, type DatosSocio } from './types';
import { StepSociedad }  from './steps/StepSociedad';
import { StepSocios }    from './steps/StepSocios';
import { StepJunta }     from './steps/StepJunta';
import { StepRevision }  from './steps/StepRevision';

interface Props {
  email:       string;
  regId:       string;
  onCompleted: () => void;
}

export function SAForm({ email, regId, onCompleted }: Props) {
  const [progress, setProgress] = useState<FormProgress>(EMPTY_PROGRESS());
  const [saving,   setSaving]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing progress on mount
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('sa_registrations')
        .select('progress')
        .eq('id', regId)
        .single();
      if (data?.progress && Object.keys(data.progress).length > 0) {
        setProgress(data.progress as FormProgress);
      }
    }
    if (regId) load();
  }, [regId]);

  // Debounced auto-save
  const save = useCallback((p: FormProgress) => {
    if (!regId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      await supabase
        .from('sa_registrations')
        .update({ progress: p, updated_at: new Date().toISOString() })
        .eq('id', regId);
      setSaving(false);
    }, 1200);
  }, [regId]);

  function update(patch: Partial<FormProgress>) {
    setProgress(prev => {
      const next = { ...prev, ...patch };
      save(next);
      return next;
    });
  }

  function goStep(n: number) { update({ step: n }); }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await supabase
        .from('sa_registrations')
        .update({ progress, completed: true, updated_at: new Date().toISOString() })
        .eq('id', regId);
      onCompleted();
    } finally {
      setSubmitting(false);
    }
  }

  const { step } = progress;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#07030f', fontFamily: "'Calibri', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <header style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/K_white.png" alt="K" style={{ height: 28, filter: 'drop-shadow(0 0 10px rgba(147,51,234,0.6))' }} />
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>KONTAXES · S.A. Portal</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{email}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {saving && <span style={{ color: 'rgba(16,185,129,0.7)', fontSize: 11 }}>Guardando…</span>}
          {!saving && regId && <span style={{ color: 'rgba(16,185,129,0.5)', fontSize: 11 }}>✓ Guardado</span>}
        </div>
      </header>

      {/* Step progress bar */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '14px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', gap: 8 }}>
          {STEPS.map((s, i) => (
            <button key={s.id} onClick={() => i <= step && goStep(s.id)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 10, border: 'none', cursor: i <= step ? 'pointer' : 'default',
                background: i === step ? 'rgba(147,51,234,0.2)' : i < step ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                borderTop: `2px solid ${i === step ? '#9333ea' : i < step ? '#10b981' : 'transparent'}`,
                transition: 'all 0.2s',
              }}>
              <span style={{ fontSize: 14 }}>{i < step ? '✓' : s.icon}</span>
              <span style={{ color: i === step ? '#c084fc' : i < step ? '#34d399' : 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600, textAlign: 'left', lineHeight: 1.3 }}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <main style={{ flex: 1, padding: '32px 24px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {step === 0 && (
            <StepSociedad
              data={progress.sociedad}
              onChange={sociedad => update({ sociedad })}
              onNext={() => goStep(1)}
            />
          )}
          {step === 1 && (
            <StepSocios
              socios={progress.socios}
              onChange={socios => update({ socios })}
              onBack={() => goStep(0)}
              onNext={() => goStep(2)}
            />
          )}
          {step === 2 && (
            <StepJunta
              junta={progress.junta}
              socios={progress.socios}
              onChange={junta => update({ junta })}
              onBack={() => goStep(1)}
              onNext={() => goStep(3)}
            />
          )}
          {step === 3 && (
            <StepRevision
              progress={progress}
              submitting={submitting}
              onBack={() => goStep(2)}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </main>
    </div>
  );
}
