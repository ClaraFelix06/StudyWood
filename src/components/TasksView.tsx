import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  Trash2, 
  Edit, 
  Infinity as InfinityIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, Subject, ThemeConfig } from '../types';
import { playNotificationSound } from '../utils/storage';

interface TasksViewProps {
  tasks: Task[];
  subjects: Subject[];
  theme: ThemeConfig;
  onToggleStatus: (id: string) => void;
  onUpdateProgress?: (id: string, delta: number) => void;
  onDeleteTask: (id: string) => void;
  onOpenNewTaskModal: (type?: 'tarefa') => void;
  onEditTask: (task: Task) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  subjects,
  theme,
  onToggleStatus,
  onDeleteTask,
  onOpenNewTaskModal,
  onEditTask,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendente' | 'em_andamento' | 'concluido'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'tarefa' | 'prova' | 'trabalho' | 'leitura'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesSubject = subjectFilter === 'all' || t.subjectId === subjectFilter;
    return matchesSearch && matchesStatus && matchesType && matchesSubject;
  });

  const getSubject = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'alta':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">Alta</span>;
      case 'media':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Média</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Baixa</span>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'prova':
        return 'Prova / Exame';
      case 'trabalho':
        return 'Trabalho';
      case 'leitura':
        return 'Leitura';
      default:
        return 'Tarefa';
    }
  };

  const isDark = theme.mode === 'dark';

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner / Actions Bar */}
      <div 
        className="p-5 rounded-3xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          backgroundColor: isDark ? '#1c241e' : '#ffffff',
          borderColor: isDark ? '#2a382d' : '#e5e7eb',
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h2 className="text-xl font-extrabold tracking-tight text-stone-900 dark:text-emerald-300">
              Tarefas Acadêmicas
            </h2>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            Organize suas tarefas, trabalhos práticos, provas e leituras do semestre.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenNewTaskModal('tarefa')}
            className="px-4 py-2 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input 
            type="text"
            placeholder="Buscar por título ou anotação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#234d32]"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#234d32]"
        >
          <option value="all">Todos os Status</option>
          <option value="pendente">Pendente</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="concluido">Concluído</option>
        </select>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="px-3 py-2 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#234d32]"
        >
          <option value="all">Todos os Tipos</option>
          <option value="tarefa">Tarefas Simples</option>
          <option value="trabalho">Trabalhos Práticos</option>
          <option value="prova">Provas</option>
          <option value="leitura">Leituras</option>
        </select>

        {/* Subject Filter */}
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-3 py-2 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#234d32]"
        >
          <option value="all">Todas as Disciplinas</option>
          {subjects.map((sub) => (
            <option key={sub.id} value={sub.id}>{sub.name}</option>
          ))}
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400">
            <p className="text-sm font-medium">Nenhuma tarefa encontrada com os filtros selecionados.</p>
            <button
              onClick={() => onOpenNewTaskModal('tarefa')}
              className="mt-3 text-xs font-bold text-[#234d32] dark:text-emerald-400 hover:underline"
            >
              + Criar nova tarefa
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const subject = getSubject(task.subjectId);
            const isDone = task.status === 'concluido';
            const isNoDeadline = Boolean(task.noDeadline || !task.dueDate);

            return (
              <div
                key={task.id}
                className="p-4 rounded-2xl border transition-all duration-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:shadow-md"
                style={{
                  backgroundColor: isDark ? '#1c241e' : '#ffffff',
                  borderColor: isDone 
                    ? (isDark ? '#2f4937' : '#e5e7eb')
                    : (isDark ? '#3d5e45' : '#e5e7eb'),
                  opacity: isDone ? 0.75 : 1,
                }}
              >
                {/* Left Side: Checkbox + Title + Meta + Subject */}
                <div className="flex items-start gap-3 overflow-hidden">
                  <button
                    onClick={() => {
                      onToggleStatus(task.id);
                      if (!isDone) {
                        playNotificationSound();
                        confetti({ particleCount: 50, spread: 60 });
                      }
                    }}
                    className="mt-0.5 shrink-0 text-stone-400 hover:text-emerald-600 transition-colors"
                    title={isDone ? 'Marcar como pendente' : 'Concluir tarefa'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1 overflow-hidden">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`font-extrabold text-sm text-stone-900 dark:text-stone-100 truncate ${isDone ? 'line-through text-stone-400 dark:text-stone-500' : ''}`}>
                        {task.title}
                      </h3>
                      {getPriorityBadge(task.priority)}
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                        {getTypeLabel(task.type)}
                      </span>
                    </div>

                    {task.notes && (
                      <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-1">
                        {task.notes}
                      </p>
                    )}

                    {/* Meta information tags */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-600 dark:text-stone-400 pt-0.5">
                      {subject && (
                        <div className="flex items-center gap-1 font-semibold text-stone-800 dark:text-stone-200">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }} />
                          <span>{subject.name}</span>
                        </div>
                      )}

                      {isNoDeadline ? (
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <InfinityIcon className="w-3.5 h-3.5" />
                          <span>Sem tempo limite</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3 text-stone-500" />
                          <span>Entrega: {task.dueDate} {task.dueTime ? `às ${task.dueTime}` : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {/* Edit */}
                  <button
                    onClick={() => onEditTask(task)}
                    className="p-2 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
                    title="Editar tarefa"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (confirm(`Excluir a tarefa "${task.title}"?`)) {
                        onDeleteTask(task.id);
                      }
                    }}
                    className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 transition-colors"
                    title="Excluir tarefa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
