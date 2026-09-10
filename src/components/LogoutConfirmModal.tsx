import React from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm rounded-3xl p-6 border shadow-2xl bg-[#18241b] border-[#293d2c] text-stone-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
      >
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-950/60 text-red-400 border border-red-800/50">
              <LogOut className="w-5 h-5" />
            </div>
            <h3 id="logout-title" className="text-base font-bold text-white">
              Deseja sair?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
            aria-label="Fechar alerta"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-3">
          <p className="text-xs text-stone-300 leading-relaxed">
            Você será desconectado da sua conta atual e redirecionado para a página de login e cadastro do <strong className="text-emerald-300 font-semibold">StudyWood</strong>.
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirm();
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 active:bg-red-700 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sim, sair</span>
          </button>
        </div>
      </div>
    </div>
  );
};
