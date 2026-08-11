import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { SALanding } from './SALanding';
import { SAForm }    from './SAForm';
import { SADone }    from './SADone';
import { SAClosed }  from './SAClosed';

type View = 'loading' | 'closed' | 'landing' | 'form' | 'done';

export function SAPortal() {
  const [view,  setView]  = useState<View>('loading');
  const [email, setEmail] = useState('');
  const [regId, setRegId] = useState('');

  // Check if form is active and if user already has a session
  useEffect(() => {
    async function init() {
      try {
        // 1. Is form active?
        const { data: cfg } = await supabase
          .from('sa_config')
          .select('active')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (!cfg?.active) { setView('closed'); return; }

        // 2. Is there a session from a magic link?
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          const { data: reg } = await supabase
            .from('sa_registrations')
            .select('id, completed')
            .eq('email', session.user.email)
            .single();

          if (reg) {
            if (reg.completed) { setView('done'); return; }
            setEmail(session.user.email);
            setRegId(reg.id);
            setView('form');
            return;
          }
          // Create registration for new user arriving via magic link
          const { data: newReg } = await supabase
            .from('sa_registrations')
            .insert({ email: session.user.email, progress: {}, completed: false })
            .select('id')
            .single();
          if (newReg) {
            setEmail(session.user.email);
            setRegId(newReg.id);
            setView('form');
            return;
          }
        }

        setView('landing');
      } catch {
        setView('landing');
      }
    }
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email && view === 'landing') {
        setEmail(session.user.email);
        setView('form');
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegistered = (newEmail: string, id: string) => {
    setEmail(newEmail);
    setRegId(id);
    // Don't go to form yet — wait for magic link click
  };

  const handleCompleted = () => setView('done');

  if (view === 'loading') return <SAScreen><Spinner /></SAScreen>;
  if (view === 'closed')  return <SAClosed />;
  if (view === 'done')    return <SADone email={email} />;
  if (view === 'form')    return (
    <SAForm email={email} regId={regId} onCompleted={handleCompleted} />
  );
  return <SALanding onRegistered={handleRegistered} />;
}

function SAScreen({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07030f' }}>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ width: 40, height: 40, border: '3px solid rgba(147,51,234,0.2)', borderTopColor: '#9333ea', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  );
}
