import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ChevronLeftIcon, ChevronRightIcon, XIcon,
  MaximizeIcon, MinimizeIcon, DownloadIcon,
} from 'lucide-react';
import { SlideThemeContext } from './slides/PequenioContribuyenteSlides';

export interface PresentationViewerProps {
  slideComponents: React.FC[];
  title: string;
  subtitle?: string;
  isDark: boolean;
  onClose: () => void;
  onDownloadPDF?: () => Promise<void>;
}

const STYLE = `
  @keyframes psFadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:none; }
  }
  @keyframes psFadeIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes psScaleIn {
    from { opacity:0; transform:scale(0.94); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes psSlideInRight {
    from { opacity:0; transform:translateX(52px); }
    to   { opacity:1; transform:none; }
  }
  @keyframes psSlideInLeft {
    from { opacity:0; transform:translateX(-52px); }
    to   { opacity:1; transform:none; }
  }
  .ps-up    { animation: psFadeUp   0.45s cubic-bezier(.25,.46,.45,.94) both; }
  .ps-fade  { animation: psFadeIn   0.5s  ease both; }
  .ps-scale { animation: psScaleIn  0.42s cubic-bezier(.25,.46,.45,.94) both; }
  .ps-enter-right { animation: psSlideInRight 0.38s cubic-bezier(.25,.46,.45,.94) both; }
  .ps-enter-left  { animation: psSlideInLeft  0.38s cubic-bezier(.25,.46,.45,.94) both; }
  .ps-d1 { animation-delay:0.07s; }
  .ps-d2 { animation-delay:0.14s; }
  .ps-d3 { animation-delay:0.21s; }
  .ps-d4 { animation-delay:0.28s; }
  .ps-d5 { animation-delay:0.35s; }
  .ps-d6 { animation-delay:0.42s; }
  .ps-d7 { animation-delay:0.49s; }
  .ps-d8 { animation-delay:0.56s; }
  .ps-d9 { animation-delay:0.63s; }
`;

export function PresentationViewer({
  slideComponents, title, subtitle, isDark, onClose, onDownloadPDF,
}: PresentationViewerProps) {
  const [current,      setCurrent]      = useState(0);
  const [direction,    setDirection]    = useState<'next' | 'prev'>('next');
  const [animKey,      setAnimKey]      = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloading,  setDownloading]  = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const total = slideComponents.length;

  const goTo = useCallback((n: number, dir: 'next' | 'prev') => {
    if (n < 0 || n >= total) return;
    setDirection(dir);
    setAnimKey(k => k + 1);
    setCurrent(n);
  }, [total]);

  const next = useCallback(() => goTo(current + 1, 'next'), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, 'prev'), [current, goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft')                   { e.preventDefault(); prev(); }
      if (e.key === 'Escape' && !document.fullscreenElement) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, onClose]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      await document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const handleDownload = async () => {
    if (!onDownloadPDF) return;
    setDownloading(true);
    try { await onDownloadPDF(); } finally { setDownloading(false); }
  };

  const SlideComponent = slideComponents[current];

  const chromeBg   = isDark ? 'rgba(0,0,0,0.55)'              : 'rgba(240,240,248,0.85)';
  const chromeBdr  = isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.08)';
  const arrowBg    = isDark ? 'rgba(0,0,0,0.45)'              : 'rgba(255,255,255,0.75)';
  const arrowBdr   = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.12)';
  const arrowColor = isDark ? 'rgba(255,255,255,0.35)'        : 'rgba(0,0,0,0.45)';
  const titleColor = isDark ? 'rgba(255,255,255,0.45)'        : 'rgba(0,0,0,0.55)';
  const subColor   = isDark ? 'rgba(255,255,255,0.22)'        : 'rgba(0,0,0,0.30)';
  const ctrlBg     = isDark ? 'rgba(255,255,255,0.05)'        : 'rgba(0,0,0,0.05)';
  const ctrlBdr    = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.10)';
  const ctrlColor  = isDark ? 'rgba(255,255,255,0.38)'        : 'rgba(0,0,0,0.45)';
  const progressBg = isDark ? 'rgba(255,255,255,0.07)'        : 'rgba(0,0,0,0.08)';
  const counterC   = isDark ? 'rgba(255,255,255,0.28)'        : 'rgba(0,0,0,0.38)';
  const pctColor   = isDark ? 'rgba(255,255,255,0.22)'        : 'rgba(0,0,0,0.30)';
  const hintColor  = isDark ? 'rgba(255,255,255,0.16)'        : 'rgba(0,0,0,0.22)';

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex flex-col select-none"
      style={{ background: isDark ? '#07030f' : '#f8fafc', zIndex: 9999 }}
    >
      <style>{STYLE}</style>

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          height: 40,
          padding: '0 12px',
          background: chromeBg,
          borderBottom: chromeBdr,
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <img src={isDark ? '/K_white.png' : '/K_black.png'} alt="K" style={{ height: 18, width: 'auto', opacity: 0.55 }} />
          <span className="text-xs font-medium truncate hidden sm:block" style={{ color: titleColor }}>
            {title}
          </span>
          {subtitle && (
            <span className="text-xs hidden md:block" style={{ color: subColor }}>
              · {subtitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {onDownloadPDF && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              title="Descargar material PDF"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                background: 'rgba(147,51,234,0.15)', border: '1px solid rgba(147,51,234,0.3)',
                color: '#c084fc', cursor: downloading ? 'wait' : 'pointer',
              }}
            >
              <DownloadIcon size={11} />
              {downloading ? 'Generando…' : 'Material PDF'}
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            title="Pantalla completa (F / doble clic)"
            style={{
              width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6, background: ctrlBg, border: ctrlBdr,
              color: ctrlColor, cursor: 'pointer',
            }}
          >
            {isFullscreen ? <MinimizeIcon size={13} /> : <MaximizeIcon size={13} />}
          </button>
          <button
            onClick={onClose}
            title="Cerrar"
            style={{
              width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6, background: ctrlBg, border: ctrlBdr,
              color: ctrlColor, cursor: 'pointer',
            }}
          >
            <XIcon size={13} />
          </button>
        </div>
      </div>

      {/* ── Slide area ──────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        <div
          key={`${current}-${animKey}`}
          className={`absolute inset-0 ${direction === 'next' ? 'ps-enter-right' : 'ps-enter-left'}`}
        >
          <SlideThemeContext.Provider value={isDark}>
            <SlideComponent />
          </SlideThemeContext.Provider>
        </div>

        {/* Click-to-advance overlay (center zone) */}
        <div
          className="absolute inset-0"
          style={{ cursor: 'pointer', paddingLeft: 52, paddingRight: 52 }}
          onClick={next}
        />

        {/* Prev arrow */}
        <div
          className="absolute left-0 top-0 bottom-0 flex items-center"
          style={{ width: 52, paddingLeft: 6, zIndex: 10, cursor: current > 0 ? 'pointer' : 'default' }}
          onClick={prev}
        >
          {current > 0 && (
            <div style={{
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', background: arrowBg, border: arrowBdr,
              color: arrowColor,
            }}>
              <ChevronLeftIcon size={18} />
            </div>
          )}
        </div>

        {/* Next arrow */}
        <div
          className="absolute right-0 top-0 bottom-0 flex items-center justify-end"
          style={{ width: 52, paddingRight: 6, zIndex: 10, cursor: current < total - 1 ? 'pointer' : 'default' }}
          onClick={next}
        >
          {current < total - 1 && (
            <div style={{
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', background: arrowBg, border: arrowBdr,
              color: arrowColor,
            }}>
              <ChevronRightIcon size={18} />
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 flex-shrink-0"
        style={{
          height: 36, padding: '0 14px',
          background: chromeBg,
          borderTop: chromeBdr,
        }}
      >
        <span style={{ color: counterC, fontSize: 11, fontFamily: 'monospace', width: 48 }}>
          {current + 1}/{total}
        </span>
        <div className="flex-1 rounded-full overflow-hidden" style={{ height: 3, background: progressBg }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${((current + 1) / total) * 100}%`,
              background: 'linear-gradient(90deg, #7c3aed, #10b981)',
              transition: 'width 0.35s cubic-bezier(.25,.46,.45,.94)',
            }}
          />
        </div>
        <span style={{ color: pctColor, fontSize: 11, width: 32, textAlign: 'right' }}>
          {Math.round(((current + 1) / total) * 100)}%
        </span>
        <span style={{ color: hintColor, fontSize: 10, display: 'none' }} className="sm:inline">
          ← → Navegar · Clic · Espacio
        </span>
      </div>
    </div>
  );
}
