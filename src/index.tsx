import './index.css';
import React, { Suspense, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { App } from './App';
import { GuiasOdoo19 } from './pages/Capacitaciones/GuiasOdoo19';

const SAPortal = React.lazy(() => import('./pages/SA/SAPortal').then(m => ({ default: m.SAPortal })));
const SAAdmin  = React.lazy(() => import('./pages/SA/SAAdmin').then(m => ({ default: m.SAAdmin })));

function NoIndex() {
  useEffect(() => {
    const m = document.createElement('meta');
    m.name = 'robots';
    m.content = 'noindex, nofollow';
    document.head.appendChild(m);
    const t = document.querySelector('title');
    if (t) t.textContent = 'Guías del usuario · Odoo 19 · KTX LAB';
    const desc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (desc) desc.content = 'Guías visuales de Odoo 19 para usuarios: introducción a la interfaz, CRM, Ventas, Suscripciones y Alquiler. Elaboradas por KTX LAB.';
    return () => { document.head.removeChild(m); };
  }, []);
  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ScrollToTop />
    <Suspense fallback={null}>
      <Routes>
        <Route path="/sa/admin" element={<SAAdmin />} />
        <Route path="/sa"       element={<SAPortal />} />
        <Route path="/capacitaciones/odoo/guias-usuario" element={<><NoIndex /><GuiasOdoo19 /></>} />
        <Route path="/*"        element={<App />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);
