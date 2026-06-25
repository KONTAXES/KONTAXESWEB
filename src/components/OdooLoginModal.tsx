import React, { useEffect, useRef } from 'react';
import { XIcon, ExternalLinkIcon } from 'lucide-react';
interface OdooLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function OdooLoginModal({ isOpen, onClose }: OdooLoginModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-5xl h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="flex items-center space-x-4">
            <img
              src="/K_V4-2.png"
              alt="KONTAXES"
              className="h-10 w-auto" />
            
            <div>
              <h2 className="text-xl font-bold text-white">Acceso a Odoo</h2>
              <p className="text-sm text-purple-100">
                Sistema de gestión empresarial
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href="https://odoo.kontaxes.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              title="Abrir en nueva pestaña">
              
              <ExternalLinkIcon size={20} />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Cerrar">
              
              <XIcon size={24} />
            </button>
          </div>
        </div>

        {/* Iframe Container */}
        <div className="relative w-full h-[calc(100%-88px)] bg-white dark:bg-gray-900">
          <iframe
            src="https://odoo.kontaxes.com"
            className="w-full h-full border-0"
            title="Odoo Login"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox" />
          
        </div>

        {/* Loading indicator (optional) */}
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 pointer-events-none opacity-0 transition-opacity">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando Odoo...</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>);

}