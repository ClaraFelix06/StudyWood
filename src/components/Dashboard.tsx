import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  Clock, 
  BookOpen, 
  Users, 
  Image as ImageIcon, 
  StickyNote, 
  Sparkles, 
  Minus, 
  Maximize2, 
  Mail, 
  GraduationCap, 
  Check, 
  X,
  MapPin,
  CheckSquare,
  Infinity as InfinityIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  StudentProfile, 
  Task, 
  Subject, 
  AcademicEvent, 
  StudyBuddy, 
  AcademicNote, 
  GalleryPhoto, 
  WidgetConfig, 
  ThemeConfig,
  TaskType
} from '../types';
import { createGoogleCalendarUrl, playNotificationSound } from '../utils/storage';
import { INITIAL_PROFILE } from '../data/initialData';
import { WeeklySchedule } from './WeeklySchedule';

interface DashboardProps {
  profile?: StudentProfile;
  tasks: Task[];
  subjects: Subject[];
  events: AcademicEvent[];
  buddies: StudyBuddy[];
  notes: AcademicNote[];
  photos?: GalleryPhoto[];
  widgets?: WidgetConfig[];
  theme: ThemeConfig;
  onNavigate?: (tab: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onToggleTaskStatus: (taskId: string) => void;
  onUpdateTaskProgress?: (taskId: string, delta: number) => void;
  onUpdateProgress?: (taskId: string, delta: number) => void;
  onOpenNewTaskModal: (initialType?: TaskType) => void;
  onOpenEventModal?: () => void;
  onAddPhoto?: (photo: Omit<GalleryPhoto, 'id' | 'date'>) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile = INITIAL_PROFILE,
  tasks,
  subjects,
  events,
  buddies,
  notes,
  photos = [],
  theme,
  onNavigate,
  onNavigateToTab,
  onToggleTaskStatus,
  onUpdateTaskProgress,
  onUpdateProgress,
  onOpenNewTaskModal,
}) => {
  const navigate = (tab: string) => {
    if (onNavigate) onNavigate(tab);
    else if (onNavigateToTab) onNavigateToTab(tab);
  };

  const handleUpdate = onUpdateTaskProgress || onUpdateProgress;

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());

  // Gallery state for modal inspection in dashboard
  const [expandedPhoto, setExpandedPhoto] = useState<GalleryPhoto | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const displayPhotos = photos;
  const currentPhoto = displayPhotos[activePhotoIndex % displayPhotos.length];

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(today.getDate());
  };

  // Filter events for current month
  const getEventsForDay = (day: number) => {
    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(month + 1).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    return events.filter(evt => evt.date.startsWith(dateStr));
  };

  // Academic tasks for dashboard
  const displayTasks = tasks.slice(0, 5);

  // Selected day events
  const selectedDayEvents = getEventsForDay(selectedDay);

  // Trigger celebration
  const triggerCelebration = () => {
    playNotificationSound();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#234d32', '#e3b341', '#52b788', '#d8f3dc'],
    });
  };

  const isDark = theme.mode === 'dark';

  return (
    <div className="space-y-8 pb-16">
      
      {/* =========================================================================
          1. TOPO: CALENDÁRIO MAIOR E COMPLETO
          ========================================================================= */}
      <section 
        id="dashboard-calendar-card"
        className="rounded-3xl p-6 md:p-8 border shadow-xs transition-all duration-300"
        style={{
          backgroundColor: isDark ? '#1c241e' : '#ffffff',
          borderColor: isDark ? '#2a382d' : '#e5e7eb',
        }}
      >
        {/* Calendar Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-stone-200 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#234d32] dark:text-emerald-400">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-black tracking-tight text-stone-900 dark:text-[#f3f6f3]">
                    {monthNames[month]} {year}
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-900">
                    {profile.currentSemester}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-stone-600 dark:text-stone-300 mt-0.5">
                  Acompanhe suas aulas, prazos de entrega, provas e defesas acadêmicas.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              onClick={goToToday}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-colors"
            >
              Hoje
            </button>
            <div className="flex items-center rounded-xl bg-stone-100 dark:bg-stone-800 p-1 border border-stone-200 dark:border-stone-700">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors"
                aria-label="Mês Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors"
                aria-label="Próximo Mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => navigate('calendar')}
              className="px-4 py-2 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>Ver Calendário Completo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main Calendar Grid + Day Details Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Calendar Grid (8 cols on XL) */}
          <div className="xl:col-span-8">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 text-center mb-2">
              {weekDayNames.map((d, index) => (
                <div 
                  key={d} 
                  className={`text-xs font-extrabold uppercase tracking-wider py-1 ${
                    index === 0 || index === 6 ? 'text-stone-400 dark:text-stone-500' : 'text-[#234d32] dark:text-emerald-400'
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Month Day Cells */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty leading cells */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div 
                  key={`empty-${i}`} 
                  className="min-h-[72px] md:min-h-[86px] rounded-2xl bg-stone-50/40 dark:bg-stone-900/20 border border-transparent"
                />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNumber = i + 1;
                const isToday = isCurrentMonth && dayNumber === today.getDate();
                const isSelected = dayNumber === selectedDay;
                const dayEvents = getEventsForDay(dayNumber);

                return (
                  <div
                    key={`day-${dayNumber}`}
                    onClick={() => setSelectedDay(dayNumber)}
                    className={`min-h-[72px] md:min-h-[86px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected 
                        ? 'border-[#234d32] bg-emerald-50 dark:bg-emerald-950/40 shadow-xs ring-2 ring-[#234d32]/20'
                        : isToday
                        ? 'border-amber-400 bg-amber-50/60 dark:bg-amber-950/20'
                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/40 hover:bg-stone-50 dark:hover:bg-stone-800/60'
                    }`}
                  >
                    {/* Day number & indicator */}
                    <div className="flex items-center justify-between">
                      <span 
                        className={`text-xs md:text-sm font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday 
                            ? 'bg-amber-500 text-white shadow-xs' 
                            : isSelected
                            ? 'bg-[#234d32] text-white shadow-xs'
                            : 'text-stone-900 dark:text-stone-200'
                        }`}
                      >
                        {dayNumber}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#234d32] text-white">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Day Events preview pills */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((evt) => (
                        <div
                          key={evt.id}
                          className="text-[10px] truncate px-1.5 py-0.5 rounded-md font-semibold text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700/50"
                          style={{
                            backgroundColor: isDark ? `${evt.color || '#234d32'}2b` : '#f5f7f5',
                            borderLeftWidth: '3px',
                            borderLeftColor: evt.color || '#234d32',
                          }}
                          title={`${evt.time ? `${evt.time} - ` : ''}${evt.title}`}
                        >
                          {evt.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[9px] text-stone-500 font-bold block text-right">
                          +{dayEvents.length - 2} mais
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Day Agenda & Quick Pointers (4 cols on XL) */}
          <div className="xl:col-span-4 flex flex-col justify-between p-5 rounded-2xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#234d32] dark:text-emerald-400" />
                  <h3 className="font-extrabold text-sm text-stone-900 dark:text-[#f3f6f3]">
                    Dia {selectedDay} de {monthNames[month]}
                  </h3>
                </div>
                <span className="text-xs text-stone-600 dark:text-stone-400 font-semibold">
                  {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'compromisso' : 'compromissos'}
                </span>
              </div>

              {/* Event list for selected day */}
              {selectedDayEvents.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                    Nenhum compromisso marcado para este dia.
                  </p>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-400 font-semibold mt-1">
                    Excelente momento para adiantar leituras e exercícios!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {selectedDayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3 rounded-xl border bg-white dark:bg-stone-800/80 transition-shadow hover:shadow-xs"
                      style={{
                        borderColor: isDark ? '#2f3d32' : '#e5e7eb',
                        borderLeftWidth: '4px',
                        borderLeftColor: evt.color || '#234d32',
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                          {evt.title}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-600 shrink-0 font-bold">
                          {evt.time || 'Dia todo'}
                        </span>
                      </div>
                      {evt.location && (
                        <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-500" />
                          <span>{evt.location}</span>
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="px-2 py-0.5 rounded-full font-bold capitalize bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-600">
                          {evt.type}
                        </span>
                        <a
                          href={createGoogleCalendarUrl({
                            title: evt.title,
                            details: evt.description || `Evento acadêmico: ${evt.title}`,
                            location: evt.location || 'Campus Universitário',
                            startDate: evt.date,
                            startTime: evt.time || '08:00',
                            endTime: evt.endTime || '10:00',
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#234d32] dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                        >
                          <span>Google Agenda</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Action to Calendar */}
            <div className="pt-4 border-t border-stone-200 dark:border-stone-800 mt-4">
              <button
                onClick={() => navigate('calendar')}
                className="w-full py-2 px-3 rounded-xl bg-stone-200/90 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Novo Evento ou Prova</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <WeeklySchedule events={events} subjects={subjects} theme={theme} />

      {/* =========================================================================
          2. ABAIXO DO CALENDÁRIO: METAS E MURAL (GALERIA) LADO A LADO
          ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tarefas Acadêmicas do Semestre */}
        <div 
          id="dashboard-tasks-card"
          className="rounded-3xl p-6 border shadow-xs flex flex-col justify-between transition-all duration-300"
          style={{
            backgroundColor: isDark ? '#1c241e' : '#ffffff',
            borderColor: isDark ? '#2a382d' : '#e5e7eb',
          }}
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight text-stone-900 dark:text-[#f3f6f3]">
                    Tarefas do Semestre
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    Acompanhe suas tarefas e entregas pendentes
                  </p>
                </div>
              </div>
              <button 
                onClick={() => navigate('tasks')}
                className="text-xs font-bold text-[#234d32] dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Ver Todas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
              {displayTasks.length === 0 ? (
                <div className="text-center py-6 text-stone-500 text-xs">
                  Nenhuma tarefa cadastrada. Adicione sua primeira atividade!
                </div>
              ) : (
                displayTasks.map((task) => {
                  const isCompleted = task.status === 'concluido';
                  const subject = subjects.find(s => s.id === task.subjectId);
                  const isNoDeadline = Boolean(task.noDeadline || !task.dueDate);

                  return (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 hover:shadow-xs transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-2.5 overflow-hidden">
                        <button
                          onClick={() => {
                            onToggleTaskStatus(task.id);
                            if (!isCompleted) triggerCelebration();
                          }}
                          className="mt-0.5 text-stone-400 hover:text-emerald-600 transition-colors shrink-0"
                          title={isCompleted ? 'Desmarcar' : 'Concluir tarefa'}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <div className="overflow-hidden">
                          <h4 className={`text-xs font-bold leading-snug truncate ${
                            isCompleted ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-100'
                          }`}>
                            {task.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px]">
                            {subject && (
                              <span className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: subject.color }} />
                                {subject.name}
                              </span>
                            )}
                            {isNoDeadline ? (
                              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                <InfinityIcon className="w-3 h-3" />
                                Sem tempo limite
                              </span>
                            ) : (
                              <span className="text-stone-500 dark:text-stone-400">
                                Prazo: {task.dueDate} {task.dueTime ? `às ${task.dueTime}` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Priority Tag */}
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                        task.priority === 'alta' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' 
                          : task.priority === 'media'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => onOpenNewTaskModal('tarefa')}
            className="w-full mt-4 py-2.5 px-4 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#234d32] dark:text-emerald-400" />
            <span>Adicionar Nova Tarefa</span>
          </button>
        </div>

        {/* Galeria de Fotos & Memórias de Estudo (Substituindo o antigo Mural) */}
        <div 
          id="dashboard-gallery-card"
          className="rounded-3xl p-6 border shadow-xs flex flex-col justify-between transition-all duration-300"
          style={{
            backgroundColor: isDark ? '#1c241e' : '#ffffff',
            borderColor: isDark ? '#2a382d' : '#e5e7eb',
          }}
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#234d32] dark:text-emerald-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight text-stone-900 dark:text-[#f3f6f3]">
                    Mural
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    Fotos e registros visuais dos seus estudos
                  </p>
                </div>
              </div>
            </div>

            {/* Featured Photo with Description */}
            {currentPhoto ? (
              <div className="space-y-3">
                <div 
                  className="relative aspect-16/9 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-800 group cursor-pointer"
                  onClick={() => setExpandedPhoto(currentPhoto)}
                >
                  <img 
                    src={currentPhoto.imageUrl} 
                    alt={currentPhoto.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end justify-between p-3.5 text-white">
                    <span className="text-xs font-bold flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Clique para ver ampliado</span>
                    </span>
                  </div>
                </div>

                {/* Photo Description Card */}
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-extrabold text-xs text-stone-900 dark:text-stone-100">
                      {currentPhoto.title}
                    </h4>
                    <span className="text-[10px] text-stone-600 dark:text-stone-400 font-medium">
                      {currentPhoto.date}
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed line-clamp-2">
                    {currentPhoto.description}
                  </p>
                </div>

                {/* Carousel Pager Dots */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    {displayPhotos.map((_, idx) => (
                      <button
                        key={`dot-${idx}`}
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === activePhotoIndex % displayPhotos.length 
                            ? 'w-6 bg-[#234d32] dark:bg-emerald-400' 
                            : 'w-2 bg-stone-300 dark:bg-stone-700'
                        }`}
                        aria-label={`Ver foto ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActivePhotoIndex((prev) => (prev - 1 + displayPhotos.length) % displayPhotos.length)}
                      className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
                      title="Foto anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActivePhotoIndex((prev) => (prev + 1) % displayPhotos.length)}
                      className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
                      title="Próxima foto"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="min-h-32 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 flex items-center justify-center text-center px-4">
                <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">Ainda não há fotos no seu mural</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. ABAIXO DISSO: PROFESSORES E DISCIPLINAS LADO A LADO
          ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Professores & Orientadores */}
        <div 
          id="dashboard-professors-card"
          className="rounded-3xl p-6 border shadow-xs flex flex-col justify-between transition-all duration-300"
          style={{
            backgroundColor: isDark ? '#1c241e' : '#ffffff',
            borderColor: isDark ? '#2a382d' : '#e5e7eb',
          }}
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#234d32] dark:text-emerald-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight text-stone-900 dark:text-[#f3f6f3]">
                    Professores
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    Contatos e e-mails de atendimento dos seus professores
                  </p>
                </div>
              </div>
              <button 
                onClick={() => navigate('buddies')}
                className="text-xs font-bold text-[#234d32] dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Ver Professores</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Professors Grid/List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {buddies.slice(0, 4).map((buddy) => (
                <div
                  key={buddy.id}
                  onClick={() => navigate('buddies')}
                  className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-[#234d32] dark:text-emerald-300 shrink-0 font-bold text-sm">
                    👨‍🏫
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                      {buddy.name}
                    </h4>
                    {buddy.contact && (
                      <p className="text-[10px] text-stone-600 dark:text-stone-400 truncate">
                        {buddy.contact}
                      </p>
                    )}
                    {buddy.email && (
                      <span className="text-[9px] text-[#234d32] dark:text-emerald-400 font-semibold truncate block mt-0.5">
                        {buddy.email}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('buddies')}
            className="w-full mt-4 py-2.5 px-4 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4 text-[#234d32] dark:text-emerald-400" />
            <span>Ver Todos os Professores</span>
          </button>
        </div>

        {/* Disciplinas do Semestre */}
        <div 
          id="dashboard-subjects-card"
          className="rounded-3xl p-6 border shadow-xs flex flex-col justify-between transition-all duration-300"
          style={{
            backgroundColor: isDark ? '#1c241e' : '#ffffff',
            borderColor: isDark ? '#2a382d' : '#e5e7eb',
          }}
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight text-stone-900 dark:text-[#f3f6f3]">
                    Disciplinas do Semestre
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    Acompanhamento de presença e matérias
                  </p>
                </div>
              </div>
              <button 
                onClick={() => navigate('subjects')}
                className="text-xs font-bold text-[#234d32] dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Ver Todas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Subjects List */}
            <div className="space-y-3">
              {subjects.slice(0, 4).map((sub) => {
                const attended = sub.attendanceAttended ?? 28;
                const total = sub.attendanceTotal ?? 30;
                const attendanceRate = Math.round((attended / total) * 100);

                return (
                  <div
                    key={sub.id}
                    onClick={() => navigate('subjects')}
                    className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 hover:shadow-xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: sub.color || '#234d32' }}
                        />
                        <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">
                          {sub.name}
                        </h4>
                        {sub.code && (
                          <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                            {sub.code}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-[#234d32] dark:text-emerald-400">
                        {attendanceRate}% presença
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-stone-600 dark:text-stone-400">
                      <span>Prof. {sub.professor}</span>
                      <span>{sub.room || (sub.credits ? `${sub.credits} créditos` : 'Sala a definir')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => navigate('subjects')}
            className="w-full mt-4 py-2.5 px-4 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-[#234d32] dark:text-emerald-400" />
            <span>Gerenciar Disciplinas & Frequência</span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          4. POR FIM: NOTAS E IDEIAS LÁ EMBAIXO
          ========================================================================= */}
      <section 
        id="dashboard-notes-card"
        className="rounded-3xl p-6 md:p-8 border shadow-xs transition-all duration-300"
        style={{
          backgroundColor: isDark ? '#1c241e' : '#ffffff',
          borderColor: isDark ? '#2a382d' : '#e5e7eb',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <StickyNote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base md:text-lg tracking-tight text-stone-900 dark:text-[#f3f6f3]">
                Anotações & Ideias de Estudo
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Rascunhos rápidos, dicas de aula, ideias de TCC e lembretes acadêmicos
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate('notes')}
            className="text-xs font-bold text-[#234d32] dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Abrir Bloco Completo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {notes.slice(0, 3).map((note) => (
            <div
              key={note.id}
              onClick={() => navigate('notes')}
              className="p-4 rounded-2xl border transition-all duration-200 hover:shadow-xs cursor-pointer flex flex-col justify-between group bg-stone-50 dark:bg-stone-900/50 border-stone-200 dark:border-stone-800"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-extrabold text-xs text-stone-900 dark:text-stone-100 group-hover:text-[#234d32] dark:group-hover:text-emerald-400 transition-colors">
                    {note.title}
                  </h4>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400">
                    {note.date}
                  </span>
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line line-clamp-3">
                  {note.content}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-stone-200/60 dark:border-stone-800">
                {note.tags?.map((t) => (
                  <span
                    key={t}
                    className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Expanded Photo Inspection Modal */}
      {expandedPhoto && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setExpandedPhoto(null)}
        >
          <div 
            className="w-full max-w-2xl rounded-3xl overflow-hidden border shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col"
            style={{
              backgroundColor: isDark ? '#1a221d' : '#ffffff',
              borderColor: isDark ? '#2d3a31' : '#e5e7eb',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[60vh] bg-black flex items-center justify-center">
              <img 
                src={expandedPhoto.imageUrl} 
                alt={expandedPhoto.title}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setExpandedPhoto(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-all"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-stone-900 dark:text-[#f1f5f2]">
                  {expandedPhoto.title}
                </h3>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 mb-3">
                {expandedPhoto.date}
              </p>
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-line">
                  {expandedPhoto.description}
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setExpandedPhoto(null)}
                  className="px-5 py-2 rounded-xl bg-[#234d32] hover:bg-[#1b3d27] text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
