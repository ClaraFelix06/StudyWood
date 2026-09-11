import React from 'react';
import { 
  Home, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  BookOpen, 
  Users, 
  Image as ImageIcon, 
  StickyNote, 
  Settings, 
  Sparkles, 
  X,
  LogOut
} from 'lucide-react';
import { ThemeConfig, StudentProfile } from '../types';
import { DAILY_TIPS, INITIAL_PROFILE } from '../data/initialData';

export type NavTab = 
  | 'dashboard' 
  | 'calendar' 
  | 'tasks' 
  | 'gallery' 
  | 'buddies' 
  | 'subjects' 
  | 'notes' 
  | 'settings';

interface SidebarProps {
  currentTab?: string;
  activeTab?: string;
  onSelectTab?: (tab: NavTab) => void;
  onTabChange?: (tab: string) => void;
  theme: ThemeConfig;
  syncStatus?: any;
  isMobileOpen?: boolean;
  mobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  onCloseMobile?: () => void;
  onOpenSettings: () => void;
  onToggleThemeMode?: () => void;
  profile?: StudentProfile;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const {
    theme,
    onOpenSettings,
    onToggleThemeMode,
    profile = INITIAL_PROFILE,
    onOpenAuthModal,
    onLogout,
  } = props;

  const currentTab = (props.currentTab || props.activeTab || 'dashboard');
  const onSelectTab = (tab: NavTab) => {
    props.onSelectTab?.(tab);
    props.onTabChange?.(tab);
    props.setIsMobileOpen?.(false);
    props.onCloseMobile?.();
  };

  const isMobileOpen = props.isMobileOpen ?? props.mobileOpen ?? false;
  const setIsMobileOpen = (open: boolean) => {
    props.setIsMobileOpen?.(open);
    if (!open) props.onCloseMobile?.();
  };

  const [tipIndex, setTipIndex] = React.useState(0);

  const nextTip = () => {
    setTipIndex((prev) => (prev + 1) % DAILY_TIPS.length);
  };

  // 100% em português brasileiro, sem 'overview' e sem 'widgets'
  const navItems = [
    { id: 'dashboard', label: 'Início', sub: 'Painel Principal', icon: Home },
    { id: 'calendar', label: 'Agenda', sub: 'Prazos & Aulas', icon: CalendarIcon },
    { id: 'tasks', label: 'Tarefas', sub: 'Lista & Entregas', icon: CheckSquare },
    { id: 'gallery', label: 'Mural', sub: 'Fotos & Registros', icon: ImageIcon },
    { id: 'buddies', label: 'Professores', sub: 'Contatos & Emails', icon: Users },
    { id: 'subjects', label: 'Disciplinas', sub: 'Matérias & Frequência', icon: BookOpen },
    { id: 'notes', label: 'Anotações', sub: 'Ideias & Rascunhos', icon: StickyNote },
  ] as const;

  const isDark = theme.mode === 'dark';

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-3 select-none">
      {/* Top Section */}
      <div className="space-y-4">
        
        {/* Brand Card */}
        <div 
          id="studywood-brand-card"
          className="relative px-4 py-3.5 rounded-2xl shadow-xs border text-center overflow-hidden transition-all duration-300 bg-[#18241b] border-[#273c2c]"
        >
          <div className="flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
            <span>Planner Acadêmico</span>
          </div>
          <h1 className="text-xl font-black tracking-tight mt-0.5 text-white">
            StudyWood
          </h1>
          <p className="text-[11px] font-medium text-emerald-200/90">
            Gestão & Estudos Universitários
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1" aria-label="Navegação Principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = currentTab === item.id;
            
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id as NavTab);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left text-sm transition-all duration-200 ${
                  isSelected
                    ? isDark
                      ? 'bg-white text-[#1c2820] shadow-sm font-bold translate-x-1'
                      : 'bg-[#234d32] text-white shadow-sm font-bold translate-x-1'
                    : isDark
                      ? 'text-stone-300 hover:text-white hover:bg-white/10 font-semibold'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100 font-semibold'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${
                  isSelected 
                    ? isDark ? 'text-[#234d32]' : 'text-emerald-200' 
                    : isDark ? 'text-emerald-400' : 'text-emerald-800'
                }`} />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm">{item.label}</span>
                  <span className={`text-[10px] font-normal ${
                    isSelected 
                      ? isDark ? 'text-[#234d32]/70' : 'text-emerald-100' 
                      : isDark ? 'text-stone-400' : 'text-stone-500'
                  }`}>
                    {item.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Mascot Section with Dica do Dia */}
      <div className={`mt-4 pt-3 border-t space-y-2.5 ${
        isDark ? 'border-white/10' : 'border-stone-200'
      }`}>
        {/* Student Profile Identity Card */}
        <div className="p-2.5 rounded-2xl bg-black/30 border border-stone-800/80 flex items-center gap-2.5">
          <div className="relative shrink-0">
            <img
              src={profile.avatarUrl || INITIAL_PROFILE.avatarUrl}
              alt={profile.name}
              className="w-10 h-10 rounded-xl object-cover border border-emerald-500 bg-stone-800"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {profile.name}
            </p>
            <p className="text-[10px] text-emerald-300 truncate">
              {profile.course}
            </p>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Sair / Trocar de conta"
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-400 hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          id="open-settings-btn"
          onClick={onOpenSettings}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors border ${
            isDark 
              ? 'text-white/90 hover:bg-white/10 border-white/10' 
              : 'text-stone-800 hover:bg-stone-100 border-stone-200 bg-stone-50'
          }`}
        >
          <Settings className={`w-4 h-4 ${isDark ? 'text-amber-200' : 'text-amber-600'}`} />
          <span>Configurações & Foto</span>
        </button>

        {/* Daily Tip Bubble */}
        <div 
          onClick={nextTip}
          className={`cursor-pointer group relative p-3 rounded-2xl border transition-all ${
            isDark 
              ? 'bg-black/25 border-white/15 text-white/90 hover:bg-black/35' 
              : 'bg-[#eef6f0] border-emerald-200 text-stone-800 hover:bg-[#e4f1e7]'
          }`}
          title="Clique para ver outra dica acadêmica"
        >
          <div className="flex items-start gap-2.5">
            <div className={`relative shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center text-lg shadow-xs ${
              isDark 
                ? 'bg-[#1b3d27] border-amber-300 text-white' 
                : 'bg-[#234d32] border-amber-400 text-white'
            }`}>
              🦉
            </div>

            <div className="space-y-1 overflow-hidden">
              <div className={`flex items-center justify-between text-[11px] font-bold ${
                isDark ? 'text-amber-200' : 'text-emerald-900'
              }`}>
                <span>Dica de Estudo</span>
                <span className="text-[10px] opacity-75 group-hover:scale-110 transition-transform">🍃</span>
              </div>
              <p className={`text-[11px] leading-snug font-medium line-clamp-3 ${
                isDark ? 'text-emerald-100/90' : 'text-stone-700'
              }`}>
                {DAILY_TIPS[tipIndex]}
              </p>
            </div>
          </div>
          <div className={`text-[9px] text-right mt-1 ${
            isDark ? 'text-emerald-200/70' : 'text-emerald-800/80 font-semibold'
          }`}>
            Toque para ver próxima dica
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside 
        id="desktop-sidebar"
        className={`hidden md:flex flex-col w-64 shrink-0 transition-colors duration-300 shadow-sm z-20 ${
          isDark 
            ? 'bg-[#152017] border-r border-[#243628] text-stone-100' 
            : 'bg-white border-r border-stone-200 text-stone-800'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 md:hidden flex"
          onClick={() => setIsMobileOpen(false)}
        >
          <div 
            className={`w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200 relative flex flex-col ${
              isDark ? 'bg-[#152017] text-white' : 'bg-white text-stone-800'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsMobileOpen(false)}
              className={`absolute top-3 right-3 p-1.5 rounded-full ${
                isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div 
        id="mobile-bottom-nav"
        className={`md:hidden fixed bottom-0 left-0 right-0 z-30 backdrop-blur-md border-t px-2 py-1.5 flex items-center justify-around ${
          isDark 
            ? 'bg-[#152017]/95 border-white/15 text-white' 
            : 'bg-white/95 border-stone-200 text-stone-800 shadow-lg'
        }`}
      >
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] ${
            currentTab === 'dashboard' 
              ? (isDark ? 'text-amber-300 font-bold' : 'text-emerald-700 font-bold') 
              : (isDark ? 'text-white/70' : 'text-stone-500')
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Início</span>
        </button>

        <button
          onClick={() => onSelectTab('calendar')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] ${
            currentTab === 'calendar' 
              ? (isDark ? 'text-amber-300 font-bold' : 'text-emerald-700 font-bold') 
              : (isDark ? 'text-white/70' : 'text-stone-500')
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span>Calendário</span>
        </button>

        <button
          onClick={() => onSelectTab('tasks')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] ${
            currentTab === 'tasks' 
              ? (isDark ? 'text-amber-300 font-bold' : 'text-emerald-700 font-bold') 
              : (isDark ? 'text-white/70' : 'text-stone-500')
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span>Tarefas</span>
        </button>

        <button
          onClick={() => onSelectTab('gallery')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] ${
            currentTab === 'gallery' 
              ? (isDark ? 'text-amber-300 font-bold' : 'text-emerald-700 font-bold') 
              : (isDark ? 'text-white/70' : 'text-stone-500')
          }`}
        >
          <ImageIcon className="w-5 h-5" />
          <span>Mural</span>
        </button>

        <button
          onClick={onOpenSettings}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] ${
            isDark ? 'text-white/70 hover:text-amber-300' : 'text-stone-500 hover:text-emerald-700'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Ajustes</span>
        </button>
      </div>
    </>
  );
};
