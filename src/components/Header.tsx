import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Clock, 
  
} from 'lucide-react';
import { StudentProfile, ThemeConfig } from '../types';
import { INITIAL_PROFILE } from '../data/initialData';

interface HeaderProps {
  profile?: StudentProfile;
  theme: ThemeConfig;
  syncStatus?: any;
  onOpenMobileMenu?: () => void;
  onToggleMobileMenu?: () => void;
  activeTabTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  profile = INITIAL_PROFILE,
  theme,
  onOpenMobileMenu,
  onToggleMobileMenu,
  activeTabTitle,
}) => {
  const handleOpenMobile = onOpenMobileMenu || onToggleMobileMenu;

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
            <div className={`text-xs md:text-sm font-medium flex flex-col gap-0.5 ${
              isDark ? 'text-emerald-100/95' : 'text-stone-600'
            }`}>
              <span className="text-base md:text-lg font-extrabold text-amber-300">{profile.course}</span>
              <span className="text-sm md:text-base">{profile.university}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Controls & Time */}
        <div className="flex flex-wrap items-center gap-2.5 md:gap-3 self-end md:self-auto">
          
          {/* Date & Time Widget */}
          <div className={`hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-xl border text-base ${
            isDark 
              ? 'bg-black/25 backdrop-blur-xs border-white/15 text-white' 
              : 'bg-stone-100 border-stone-200 text-stone-800'
          }`}>
            <div className={`flex items-center gap-2 font-mono font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>
              <Clock className={`w-5 h-5 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`} />
              <span>{currentTime}</span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
