import React, { useState, useRef } from 'react';
import { 
  X, 
  Moon, 
  Type, 
  Check, 
  Sparkles,
  Upload,
  User,
  Image as ImageIcon,
  LogIn,
  LogOut,
  RotateCcw,
  GraduationCap
} from 'lucide-react';
import { ThemeConfig, StudentProfile } from '../types';
import { AVATAR_PRESETS, INITIAL_PROFILE } from '../data/initialData';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
  onUpdateTheme: (newTheme: Partial<ThemeConfig>) => void;
  profile: StudentProfile;
  onUpdateProfile: (profile: Partial<StudentProfile>) => void;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onUpdateTheme,
  profile,
  onUpdateProfile,
  onOpenAuthModal,
  onLogout,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Upload custom photo from device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFeedback('Por favor selecione uma imagem válida (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showFeedback('A imagem selecionada é muito grande (máximo 5MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        onUpdateProfile({ avatarUrl: base64 });
        showFeedback('Foto de perfil atualizada com sucesso!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Set avatar by URL
  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onUpdateProfile({ avatarUrl: urlInput.trim() });
    setUrlInput('');
    showFeedback('Foto de perfil atualizada com sucesso!');
  };

  // Restore default avatar
  const handleResetAvatar = () => {
    onUpdateProfile({ avatarUrl: INITIAL_PROFILE.avatarUrl });
    showFeedback('Foto de perfil restaurada para o padrão.');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg rounded-3xl p-5 sm:p-6 border shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto bg-[#1c241e] border-[#2a382d] text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Configurações & Perfil
              </h3>
              <p className="text-xs text-stone-400">
                Personalize sua foto, estilo de fonte e gerencie sua conta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-700 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="space-y-6">
          
          {/* ======================================================== */}
          {/* 1. SEÇÃO: FOTO DE PERFIL DO USUÁRIO                      */}
          {/* ======================================================== */}
          <div className="p-4 rounded-2xl bg-black/30 border border-stone-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                Foto de Perfil do Estudante
              </label>
              <span className="text-[11px] text-stone-400 font-medium">
                Identidade Visual
              </span>
            </div>

            {/* Current Avatar Card */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-[#162118] border border-[#273d2a]">
              <div className="relative group">
                <img
                  src={profile.avatarUrl || INITIAL_PROFILE.avatarUrl}
                  alt={profile.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md bg-stone-900"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Alterar foto"
                  className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                >
                  <Upload className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">
                  {profile.name}
                </h4>
                <p className="text-xs text-emerald-300 flex items-center gap-1.5 truncate mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{profile.course}</span>
                </p>
                <p className="text-[11px] text-stone-400 truncate">
                  {profile.university}
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetAvatar}
                title="Restaurar avatar padrão"
                className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Action 1: Upload from device */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-800/70 hover:bg-emerald-700 border border-emerald-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Upload className="w-4 h-4" />
                <span>Escolher Foto do Computador / Celular</span>
              </button>
            </div>

            {/* Action 2: Image URL input */}
            <form onSubmit={handleApplyUrl} className="flex gap-2">
              <div className="relative flex-1">
                <ImageIcon className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Ou cole o link de uma imagem (https://...)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-stone-700 text-white placeholder:text-stone-600 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={!urlInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold disabled:opacity-40 transition-colors shrink-0"
              >
                Aplicar
              </button>
            </form>

            {/* Action 3: Preset Avatars */}
            <div>
              <p className="text-[11px] font-bold text-stone-400 mb-2">
                Ou escolha um dos avatares acadêmicos sugeridos:
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = profile.avatarUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        onUpdateProfile({ avatarUrl: preset.url });
                        showFeedback(`Avatar "${preset.label}" selecionado!`);
                      }}
                      title={preset.label}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all hover:scale-105 ${
                        isSelected 
                          ? 'border-emerald-400 ring-2 ring-emerald-500/40' 
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-emerald-950/40 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-emerald-300 font-bold" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. SEÇÃO: TEMA VISUAL (MODO ESCURO EXCLUSIVO)            */}
          {/* ======================================================== */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-400 mb-2.5">
              Tema Visual
            </label>
            <div className="p-4 rounded-2xl border border-emerald-600/40 bg-[#162218] flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-stone-800 text-emerald-400">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-100 flex items-center gap-2">
                    <span>Modo Escuro Exclusivo</span>
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Ativo
                    </span>
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">
                    Paleta noturna focada em conforto para os olhos, leitura de alto contraste e foco total nos estudos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. SEÇÃO: TIPOGRAFIA (FONTES)                            */}
          {/* ======================================================== */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-400">
                Estilo de Fonte (Tipografia)
              </label>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                <Type className="w-3.5 h-3.5" />
                <span>Alternar Fonte</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {/* Opção 1: Fonte Padrão */}
              <button
                type="button"
                onClick={() => onUpdateTheme({ fontFamily: 'default', fontStyle: 'default' })}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  theme.fontFamily === 'default'
                    ? 'border-emerald-500 bg-emerald-950/40 shadow-xs'
                    : 'border-stone-800 hover:bg-stone-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-800 flex items-center justify-center font-bold text-sm text-stone-200 border border-stone-700">
                    Aa
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-stone-100">
                      Fonte Padrão (Sem Serifa)
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      Moderna, limpa e com legibilidade ideal para leitura acadêmica.
                    </p>
                  </div>
                </div>
                {theme.fontFamily === 'default' && (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-stone-900 flex items-center justify-center text-xs">
                    <Check className="w-3 h-3 font-bold" />
                  </div>
                )}
              </button>

              {/* Opção 2: Fonte Manuscrita */}
              <button
                type="button"
                onClick={() => onUpdateTheme({ fontFamily: 'handwriting', fontStyle: 'handwriting' })}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  theme.fontFamily === 'handwriting'
                    ? 'border-emerald-500 bg-emerald-950/40 shadow-xs'
                    : 'border-stone-800 hover:bg-stone-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-950/40 flex items-center justify-center font-bold text-base text-amber-300 font-handwriting border border-amber-900/60">
                    Aa
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-stone-100 font-handwriting text-sm">
                      Fonte Manuscrita (Caderno Universitário)
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      Estilo diário de bordo e caderno de notas artesanal.
                    </p>
                  </div>
                </div>
                {theme.fontFamily === 'handwriting' && (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-stone-900 flex items-center justify-center text-xs">
                    <Check className="w-3 h-3 font-bold" />
                  </div>
                )}
              </button>

              {/* Opção 3: Fonte Técnica */}
              <button
                type="button"
                onClick={() => onUpdateTheme({ fontFamily: 'technical', fontStyle: 'technical' })}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  theme.fontFamily === 'technical'
                    ? 'border-emerald-500 bg-emerald-950/40 shadow-xs'
                    : 'border-stone-800 hover:bg-stone-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950/40 flex items-center justify-center font-mono font-bold text-xs text-emerald-400 border border-emerald-900/60">
                    &gt;_
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-stone-100 font-mono">
                      Fonte Técnica (Código & Foco)
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      Monoespaçada, inspirada em editores de programação e cálculo.
                    </p>
                  </div>
                </div>
                {theme.fontFamily === 'technical' && (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-stone-900 flex items-center justify-center text-xs">
                    <Check className="w-3 h-3 font-bold" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 4. SEÇÃO: CONTA E SESSÃO                                */}
          {/* ======================================================== */}
          <div className="pt-2 border-t border-stone-800">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-400 mb-2">
              Conta & Acesso
            </label>
            <div className="p-3.5 rounded-2xl bg-black/25 border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-stone-800 text-stone-300">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    {profile.name}
                  </p>
                  <p className="text-[11px] text-stone-400">
                    {profile.email || 'alexandre@studywood.com'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onOpenAuthModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuthModal();
                    }}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Trocar Conta</span>
                  </button>
                )}
                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair</span>
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-stone-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs"
          >
            Concluir
          </button>
        </div>

      </div>
    </div>
  );
};
