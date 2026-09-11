import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  MapPin, 
  Bell, 
  ExternalLink, 
  Download, 
  Check, 
  Trash2,
  Sparkles,
  Link2
} from 'lucide-react';
import { AcademicEvent, Subject, Task, ThemeConfig } from '../types';
import { createGoogleCalendarUrl, exportToICS } from '../utils/storage';
import { WeeklySchedule } from './WeeklySchedule';

interface CalendarViewProps {
  events: AcademicEvent[];
  tasks: Task[];
  subjects: Subject[];
  theme: ThemeConfig;
  onAddEvent: (event: Omit<AcademicEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  tasks,
  subjects,
  theme,
  onAddEvent,
  onDeleteEvent,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIcalSyncModal, setShowIcalSyncModal] = useState(false);
  const [icalUrlInput, setIcalUrlInput] = useState('');
  const [gcalSyncedSuccess, setGcalSyncedSuccess] = useState(false);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventSubjectId, setNewEventSubjectId] = useState(subjects[0]?.id || '');
  const [newEventDate, setNewEventDate] = useState(selectedDay);
  const [newEventStartTime, setNewEventStartTime] = useState('09:00');
  const [newEventEndTime, setNewEventEndTime] = useState('11:00');
  const [newEventType, setNewEventType] = useState<'aula' | 'prova' | 'entrega' | 'reuniao' | 'evento'>('prova');
  const [newEventLocation, setNewEventLocation] = useState('Campus Central');
  const [newEventNotes, setNewEventNotes] = useState('');
  const [newEventReminder, setNewEventReminder] = useState(60);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const adjustedFirstDay = (firstDayIndex + 6) % 7;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today.toISOString().split('T')[0]);
  };

  const getSubject = (id: string) => subjects.find((s) => s.id === id);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    onAddEvent({
      title: newEventTitle,
      subjectId: newEventSubjectId,
      date: newEventDate,
      startTime: newEventStartTime,
      endTime: newEventEndTime,
      type: newEventType,
      location: newEventLocation,
      notes: newEventNotes,
      reminderMinutes: newEventReminder,
      googleEventId: `gcal-${Date.now()}`,
    });

    setNewEventTitle('');
    setShowAddModal(false);
  };

  // Selected Day Items
  const dayEvents = events.filter((e) => e.date === selectedDay);
  const dayTasks = tasks.filter((t) => t.dueDate === selectedDay);

  // Export all calendar items to .ics
  const handleExportICS = () => {
    const allItems = [
      ...events.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        startTime: e.startTime,
        endTime: e.endTime,
        location: e.location,
        notes: e.notes,
      })),
      ...tasks.map((t) => ({
        id: t.id,
        title: `[Entrega] ${t.title}`,
        date: t.dueDate,
        startTime: t.dueTime || '12:00',
        endTime: t.dueTime || '13:00',
        location: 'Entrega Acadêmica',
        notes: t.notes,
      })),
    ];
    exportToICS(allItems);
  };

  const isDark = theme.mode === 'dark';

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Header Card */}
      <div 
        className="p-5 rounded-3xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          backgroundColor: isDark ? '#1c241e' : '#ffffff',
          borderColor: isDark ? '#2a382d' : '#e5e7eb',
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <h2 className="text-xl font-extrabold tracking-tight text-stone-900 dark:text-emerald-300">
              Agenda Acadêmica & Google Calendar
            </h2>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            Visualize seus compromissos no mês, sincronize com o Google Calendar e configure lembretes personalizados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100"
          >
            Hoje
          </button>
          
          <button
            onClick={handleExportICS}
            title="Exportar arquivo .ics para Google Calendar no Android ou Desktop"
            className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar .ICS</span>
          </button>

          <button
            onClick={() => setShowIcalSyncModal(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Vincular Google URL</span>
          </button>

          <button
            onClick={() => {
              setNewEventDate(selectedDay);
              setShowAddModal(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Compromisso</span>
          </button>
        </div>
      </div>

      {/* Main Calendar Layout (Month Grid + Selected Day Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Month Calendar Grid */}
        <div 
          className="lg:col-span-2 p-5 rounded-3xl border shadow-xs"
          style={{
            backgroundColor: isDark ? '#1c241e' : '#ffffff',
            borderColor: isDark ? '#2a382d' : '#e5e7eb',
          }}
        >
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-stone-900 dark:text-emerald-300">
              {monthNames[month]} {year}
            </h3>
            <div className="flex items-center gap-1">
              <button 
                onClick={prevMonth}
                className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-stone-600 dark:text-stone-400 mb-2">
            {weekDays.map((wd) => (
              <div key={wd} className="py-1">{wd}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blanks */}
            {Array.from({ length: adjustedFirstDay }).map((_, i) => (
              <div key={`cal-blank-${i}`} className="min-h-16 md:min-h-20 p-1" />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = selectedDay === dateStr;
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              const dayEvts = events.filter((e) => e.date === dateStr);
              const dayTsks = tasks.filter((t) => t.dueDate === dateStr);

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(dateStr)}
                  className={`cursor-pointer min-h-16 md:min-h-20 p-1.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#234d32] bg-emerald-50 dark:bg-emerald-950/40 shadow-xs'
                      : isToday
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20'
                      : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                      isToday ? 'bg-amber-500 text-white' : isSelected ? 'bg-[#234d32] text-white' : 'text-stone-800 dark:text-stone-200'
                    }`}>
                      {day}
                    </span>
                    {(dayEvts.length > 0 || dayTsks.length > 0) && (
                      <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400">
                        {dayEvts.length + dayTsks.length}
                      </span>
                    )}
                  </div>

                  {/* Badges preview */}
                  <div className="space-y-0.5 overflow-hidden">
                    {dayEvts.slice(0, 2).map((e) => (
                      <div 
                        key={e.id} 
                        className="text-[9px] px-1 py-0.5 rounded truncate font-medium bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100"
                        title={e.title}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayTsks.slice(0, 1).map((t) => (
                      <div 
                        key={t.id} 
                        className="text-[9px] px-1 py-0.5 rounded truncate font-medium bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100"
                        title={t.title}
                      >
                        ⏱ {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda & Google Calendar Action */}
        <div 
          className="p-5 rounded-3xl border shadow-xs flex flex-col justify-between"
          style={{
            backgroundColor: isDark ? '#1c241e' : '#ffffff',
            borderColor: isDark ? '#2a382d' : '#e5e7eb',
          }}
        >
          <div>

          <WeeklySchedule events={events} subjects={subjects} theme={theme} />
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#234d32] dark:text-emerald-400">
                  Agenda do Dia
                </span>
                <h4 className="font-extrabold text-stone-900 dark:text-stone-100 text-base">
                  {selectedDay}
                </h4>
              </div>
              <button
                onClick={() => {
                  setNewEventDate(selectedDay);
                  setShowAddModal(true);
                }}
                className="p-1.5 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] text-white shadow-xs"
                title="Novo compromisso para este dia"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* List of items on this day */}
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {dayEvents.length === 0 && dayTasks.length === 0 ? (
                <div className="text-center py-10 text-stone-500 dark:text-stone-400 text-xs">
                  Nenhum compromisso ou prova marcada para este dia.
                  <button 
                    onClick={() => {
                      setNewEventDate(selectedDay);
                      setShowAddModal(true);
                    }}
                    className="block mx-auto mt-2 text-[#234d32] dark:text-emerald-400 font-bold hover:underline"
                  >
                    + Adicionar atividade
                  </button>
                </div>
              ) : (
                <>
                  {/* Academic Events */}
                  {dayEvents.map((evt) => {
                    const subject = getSubject(evt.subjectId);
                    const gcalUrl = createGoogleCalendarUrl({
                      title: evt.title,
                      details: `${evt.notes || ''}\nDisciplina: ${subject?.name || ''}`,
                      location: evt.location,
                      startDate: evt.date,
                      startTime: evt.startTime,
                      endTime: evt.endTime,
                    });

                    return (
                      <div 
                        key={evt.id}
                        className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-1.5 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                            {evt.title}
                          </span>
                          <button
                            onClick={() => onDeleteEvent(evt.id)}
                            className="text-stone-400 hover:text-red-500 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-600 dark:text-stone-400">
                          <div className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-stone-400" />
                            <span>{evt.startTime} - {evt.endTime}</span>
                          </div>
                          {evt.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-stone-400" />
                              <span>{evt.location}</span>
                            </div>
                          )}
                        </div>

                        {subject && (
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-800 dark:text-stone-300">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }} />
                            <span>{subject.name}</span>
                          </div>
                        )}

                        {/* Direct Google Calendar Button */}
                        <a
                          href={gcalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-400 hover:underline"
                        >
                          <span>Adicionar ao Google Calendar</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    );
                  })}

                  {/* Tasks Due Today */}
                  {dayTasks.map((t) => (
                    <div 
                      key={t.id}
                      className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-950 dark:text-amber-200">
                          ⏱ Entrega: {t.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-amber-900 dark:text-amber-300">
                          {t.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-700 dark:text-stone-300">
                        {t.dueTime ? `Horário limite: ${t.dueTime}` : 'Prazo final hoje'}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Quick Tip for Google Calendar Sync */}
          <div className="mt-4 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-950 dark:text-blue-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
              <span>Sincronização com Celular & Desktop</span>
            </div>
            <p className="text-[11px] text-blue-900 dark:text-blue-300 leading-relaxed">
              Use o botão <strong>Exportar .ICS</strong> no topo para importar todas as provas e entregas diretamente no aplicativo Google Calendar do seu Android ou computador!
            </p>
          </div>
        </div>

      </div>

      {/* New Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-md rounded-3xl p-6 border shadow-2xl animate-in zoom-in-95"
            style={{
              backgroundColor: isDark ? '#1c241e' : '#ffffff',
              borderColor: isDark ? '#2a382d' : '#e5e7eb',
            }}
          >
            <h3 className="text-lg font-bold text-stone-900 dark:text-emerald-300 mb-4 flex items-center gap-2">
              <span>📅</span> Novo Compromisso Acadêmico
            </h3>

            <form onSubmit={handleCreateEvent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                  Título do Evento / Prova *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Prova Final P2, Seminário de IA..."
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                    Disciplina
                  </label>
                  <select
                    value={newEventSubjectId}
                    onChange={(e) => setNewEventSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                    Tipo
                  </label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100"
                  >
                    <option value="prova">Prova</option>
                    <option value="aula">Aula Especial</option>
                    <option value="entrega">Entrega de Trabalho</option>
                    <option value="reuniao">Orientação / Reunião</option>
                    <option value="evento">Palestra / Evento</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                    Data
                  </label>
                  <input 
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                    Início
                  </label>
                  <input 
                    type="time"
                    required
                    value={newEventStartTime}
                    onChange={(e) => setNewEventStartTime(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                    Término
                  </label>
                  <input 
                    type="time"
                    required
                    value={newEventEndTime}
                    onChange={(e) => setNewEventEndTime(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                  Local / Sala / Link
                </label>
                <input 
                  type="text"
                  placeholder="Ex: Bloco C - Sala 204 ou Google Meet"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                  Lembrete com Antecedência
                </label>
                <select
                  value={newEventReminder}
                  onChange={(e) => setNewEventReminder(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100"
                >
                  <option value={15}>15 minutos antes</option>
                  <option value={30}>30 minutos antes</option>
                  <option value={60}>1 hora antes</option>
                  <option value={120}>2 horas antes</option>
                  <option value={1440}>1 dia antes</option>
                  <option value={2880}>2 dias antes</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] text-white font-bold text-xs shadow-xs"
                >
                  Salvar Compromisso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Calendar iCal URL Modal */}
      {showIcalSyncModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-md rounded-3xl p-6 border shadow-2xl animate-in zoom-in-95"
            style={{
              backgroundColor: isDark ? '#1c241e' : '#ffffff',
              borderColor: isDark ? '#2a382d' : '#e5e7eb',
            }}
          >
            <h3 className="text-lg font-bold text-stone-900 dark:text-emerald-300 mb-2 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <span>Vincular ao Google Calendar</span>
            </h3>

            <p className="text-xs text-stone-600 dark:text-stone-300 mb-4 leading-relaxed">
              Cole o endereço secreto ou público em formato <strong>iCal (.ics)</strong> da sua agenda do Google Calendar para sincronizar eventos externos automaticamente.
            </p>

            <div className="space-y-3 mb-4">
              <input 
                type="url"
                placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
                value={icalUrlInput}
                onChange={(e) => setIcalUrlInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100"
              />

              {gcalSyncedSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Google Calendar vinculado com sucesso!</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowIcalSyncModal(false)}
                className="px-4 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  setGcalSyncedSuccess(true);
                  setTimeout(() => {
                    setShowIcalSyncModal(false);
                    setGcalSyncedSuccess(false);
                  }, 1200);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
              >
                Conectar Agenda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
