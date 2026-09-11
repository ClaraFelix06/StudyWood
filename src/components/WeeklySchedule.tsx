import React from 'react';
import { AcademicEvent, Subject, ThemeConfig } from '../types';

interface WeeklyScheduleProps {
  events: AcademicEvent[];
  subjects: Subject[];
  theme: ThemeConfig;
}

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({ events, subjects, theme }) => {
  const today = new Date();
  const monday = new Date(today);
  const day = monday.getDay();
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));

  const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
  const days = weekdays.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const dateKey = date.toISOString().split('T')[0];
    return {
      label,
      date,
      events: events.filter((event) => event.date === dateKey && event.type === 'aula'),
    };
  });

  const isDark = theme.mode === 'dark';

  return (
    <section
      className="rounded-3xl p-5 md:p-6 border shadow-xs"
      style={{
        backgroundColor: isDark ? '#1c241e' : '#ffffff',
        borderColor: isDark ? '#2a382d' : '#e5e7eb',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">Semana de aulas</h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">Uma visão rápida das aulas de segunda a sexta</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {days.map((day) => (
          <div key={day.label} className="min-h-20 rounded-2xl p-3 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">{day.label}</span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">{day.date.getDate()}</span>
            </div>
            {day.events.length === 0 ? (
              <span className="text-[10px] text-stone-400 dark:text-stone-500">Sem aula</span>
            ) : (
              <div className="space-y-1.5">
                {day.events.map((event) => {
                  const subject = subjects.find((item) => item.id === event.subjectId);
                  return (
                    <div key={event.id} className="border-l-2 pl-2" style={{ borderColor: subject?.color || '#34d399' }}>
                      <p className="text-[11px] font-bold text-stone-800 dark:text-stone-200 truncate">{subject?.name || event.title}</p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400">{event.startTime}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
