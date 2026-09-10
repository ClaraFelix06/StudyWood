import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Clock, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Plus, 
  Type 
} from 'lucide-react';
import { StudentProfile, ThemeConfig } from '../types';
import { INITIAL_PROFILE } from '../data/initialData';

interface HeaderProps {
  profile?: StudentProfile;
  theme: ThemeConfig;
  syncStatus?: any;
  onOpenMobileMenu?: () => void;
  onToggleMobileMenu?: () => void;
  onOpenNewTaskModal?: () => void;
  onOpenSettings?: () => void;
  onToggleThemeMode?: () => void;
  onToggleTheme?: () => void;
  onCycleFont?: () => void;
  activeTabTitle?: string;
  onOpenAuthModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile = INITIAL_PROFILE,
  theme,
  onOpenMobileMenu,
  onToggleMobileMenu,
  onOpenNewTaskModal,
  onOpenSettings,
  onToggleThemeMode,
  onToggleTheme,
  onCycleFont,
  activeTabTitle,
  onOpenAuthModal,
}) => {
  const handleOpenMobile = onOpenMobileMenu || onToggleMobileMenu;
  const handleToggleTheme = onToggleThemeMode || onToggleTheme;

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      );
      setCurrentDateFormatted(
        now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getFontLabel = () => {
    switch (theme.fontFamily) {
      case 'handwriting':
        return 'Manuscrita';
      case 'technical':
        return 'Técnica';
      default:
        return 'Padrão';
    }
  };

  const isDark = theme.mode === 'dark';

  return (
    <header 
      id="app-header"
      className="relative w-full rounded-3xl overflow-hidden shadow-xs mb-6 border transition-all duration-300"
      style={{
        backgroundColor: isDark ? '#18241b' : '#ffffff',
        borderColor: isDark ? '#273c2c' : '#e5e7eb',
      }}
    >
      {/* Subtle scenic background overlay */}
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url(${theme.bannerImage})`,
        }}
      />

      {/* Header Content */}
      <div className={`relative z-10 px-5 py-4 md:px-7 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? 'text-white' : 'text-stone-900'
      }`}>
        
        {/* Left Side: Mobile Menu Button + Greetings */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={handleOpenMobile}
            className={`md:hidden p-2 rounded-xl transition-colors ${
              isDark ? 'bg-black/25 hover:bg-black/40 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200'
            }`}
            aria-label="Abrir Menu Lateral"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🍃</span>
              <h2 className={`text-xl md:text-2xl font-black tracking-tight ${
                isDark ? 'text-white drop-shadow-xs' : 'text-stone-900'
              }`}>
                {activeTabTitle || `Bem-vindo(a), ${profile.name.split(' ')[0]}!`}
              </h2>
            </div>
            <p className={`text-xs md:text-sm font-medium flex items-center gap-2 flex-wrap ${
              isDark ? 'text-emerald-100/95' : 'text-stone-600'
            }`}>
              <span>Planner Acadêmico: StudyWood • {profile.university}</span>
              <span className="opacity-60">•</span>
              <span className={`font-semibold px-2 py-0.5 rounded-md ${
                isDark ? 'text-amber-200 bg-black/20' : 'text-emerald-800 bg-emerald-50 border border-emerald-200/80'
              }`}>
                {profile.course}
              </span>
            </p>
          </div>
        </div>

        {/* Right Side: Quick Controls & Time */}
        <div className="flex flex-wrap items-center gap-2.5 md:gap-3 self-end md:self-auto">
          
          {/* Date & Time Widget */}
          <div className={`hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl border text-xs ${
            isDark 
              ? 'bg-black/25 backdrop-blur-xs border-white/15 text-white' 
              : 'bg-stone-100 border-stone-200 text-stone-800'
          }`}>
            <div className={`flex items-center gap-1.5 ${isDark ? 'text-emerald-200' : 'text-stone-600'}`}>
              <CalendarIcon className={`w-3.5 h-3.5 ${isDark ? 'text-amber-300' : 'text-emerald-700'}`} />
              <span>{currentDateFormatted}</span>
            </div>
            <span className={isDark ? 'text-white/30' : 'text-stone-300'}>|</span>
            <div className={`flex items-center gap-1.5 font-mono font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>
              <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`} />
              <span>{currentTime}</span>
            </div>
          </div>

          {/* Font switcher button */}
          {onCycleFont && (
            <button
              onClick={onCycleFont}
              id="quick-font-cycle-btn"
              title={`Fonte Atual: ${getFontLabel()}. Clique para alternar (Padrão / Manuscrita / Técnica)`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                isDark 
                  ? 'bg-black/25 hover:bg-black/35 border-white/15 text-emerald-100' 
                  : 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-800'
              }`}
            >
              <Type className={`w-3.5 h-3.5 ${isDark ? 'text-amber-300' : 'text-emerald-800'}`} />
              <span className="hidden sm:inline">{getFontLabel()}</span>
            </button>
          )}

          {/* New Activity Button */}
          {onOpenNewTaskModal && (
            <button
              onClick={onOpenNewTaskModal}
              id="new-task-quick-btn"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all ${
                isDark 
                  ? 'bg-amber-400 hover:bg-amber-300 text-stone-950' 
                  : 'bg-[#234d32] hover:bg-[#1a3d27] text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Nova Tarefa</span>
            </button>
          )}

          {/* Profile Avatar & Settings trigger */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-1.5 p-1 rounded-2xl border-2 transition-all group ${
                isDark ? 'border-emerald-500/80 hover:border-emerald-400 bg-black/20' : 'border-emerald-600/80 hover:border-emerald-700 bg-emerald-50'
              }`}
              title="Foto de Perfil & Configurações (Clique para alterar)"
            >
              <img 
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                alt={profile.name}
                className="w-8 h-8 rounded-xl object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <span className="hidden lg:inline text-xs font-bold text-white pr-1.5">
                {profile.name.split(' ')[0]}
              </span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
