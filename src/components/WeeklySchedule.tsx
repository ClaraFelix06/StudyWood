import React from 'react';
import { Subject, StudyBuddy, ThemeConfig, WeeklyClass } from '../types';

interface WeeklyScheduleProps {
  classes: WeeklyClass[];
  subjects: Subject[];
  buddies: StudyBuddy[];
  theme: ThemeConfig;
}

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({ classes, subjects, buddies, theme }) => {
  const isDark = theme.mode === 'dark';
  const weekdays = [
    { value: 1, label: 'Seg' }, { value: 2, label: 'Ter' }, { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' }, { value: 5, label: 'Sex' },
  ];

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
        {weekdays.map((day) => {
          const dayClasses = classes.filter((item) => item.weekday === day.value).sort((a, b) => a.startTime.localeCompare(b.startTime));
          return <div key={day.value} className="min-h-20 rounded-2xl p-3 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800">
            <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">{day.label}</span>
            {dayClasses.length === 0 ? (
              <span className="text-[10px] text-stone-400 dark:text-stone-500">Sem aula</span>
            ) : (
              <div className="space-y-1.5">
                {dayClasses.map((item) => {
                  const subject = subjects.find((value) => value.id === item.subjectId);
                  const buddy = buddies.find((value) => value.id === item.buddyId);
                  return <div key={item.id} className="border-l-2 pl-2" style={{ borderColor: subject?.color || '#34d399' }}>
                      <p className="text-[11px] font-bold text-stone-800 dark:text-stone-200 truncate">{subject?.name || 'Disciplina'}</p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400">{item.startTime} - {item.endTime}</p>
                      {buddy && <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">{buddy.name}</p>}
                    </div>
                })}
              </div>
            )}
          </div>;
        })}
      </div>
    </section>
  );
};
