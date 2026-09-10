import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, BookOpen, AlertCircle, Infinity as InfinityIcon } from 'lucide-react';
import { Task, Subject, ThemeConfig, TaskType, Priority } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt'>, existingId?: string) => void;
  taskToEdit?: Task | null;
  subjects: Subject[];
  theme: ThemeConfig;
  initialType?: TaskType;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  subjects,
  theme,
  initialType = 'tarefa',
}) => {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [type, setType] = useState<TaskType>(initialType);
  const [noDeadline, setNoDeadline] = useState(false);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('23:59');
  const [priority, setPriority] = useState<Priority>('media');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setSubjectId(taskToEdit.subjectId);
      setType(taskToEdit.type || 'tarefa');
      const hasNoDeadline = taskToEdit.noDeadline || !taskToEdit.dueDate;
      setNoDeadline(Boolean(hasNoDeadline));
      setDueDate(taskToEdit.dueDate || new Date().toISOString().split('T')[0]);
      setDueTime(taskToEdit.dueTime || '23:59');
      setPriority(taskToEdit.priority);
      setNotes(taskToEdit.notes || '');
    } else {
      setTitle('');
      setSubjectId(subjects[0]?.id || '');
      setType(initialType || 'tarefa');
      setNoDeadline(false);
      setDueDate(new Date().toISOString().split('T')[0]);
      setDueTime('23:59');
      setPriority('media');
      setNotes('');
    }
  }, [taskToEdit, initialType, subjects, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave(
      {
        title: title.trim(),
        subjectId,
        type,
        noDeadline,
        dueDate: noDeadline ? '' : dueDate,
        dueTime: noDeadline ? '' : dueTime,
        priority,
        status: taskToEdit ? taskToEdit.status : 'pendente',
        notes: notes.trim(),
      },
      taskToEdit?.id
    );

    onClose();
  };

  const isDark = theme.mode === 'dark';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg rounded-3xl p-6 border shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: isDark ? '#1c241e' : '#ffffff',
          borderColor: isDark ? '#2a382d' : '#e5e7eb',
        }}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <h3 className="text-lg font-bold text-stone-900 dark:text-emerald-300">
              {taskToEdit ? 'Editar Tarefa Acadêmica' : 'Nova Tarefa Acadêmica'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
              Título da Tarefa *
            </label>
            <input 
              type="text"
              required
              placeholder="Ex: Fazer lista de exercícios de Cálculo, Entregar relatório de IA..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#234d32]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                Disciplina
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#234d32]"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                Tipo de Tarefa
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#234d32]"
              >
                <option value="tarefa">Tarefa Simples / Exercício</option>
                <option value="trabalho">Trabalho Prático</option>
                <option value="prova">Prova / Exame</option>
                <option value="leitura">Leitura / Artigo</option>
              </select>
            </div>
          </div>

          {/* Opção Sem Tempo Limite */}
          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                <InfinityIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                  Sem tempo limite
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block">
                  Tarefa sem data ou prazo de entrega obrigatório
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={noDeadline}
                onChange={(e) => setNoDeadline(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#234d32]"></div>
            </label>
          </div>

          {/* Prazos de Entrega (se não for sem tempo limite) */}
          {!noDeadline ? (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                  Data de Entrega *
                </label>
                <input 
                  type="date"
                  required={!noDeadline}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                  Horário Limite
                </label>
                <input 
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                  Prioridade
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-2 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Esta tarefa não tem prazo e ficará visível até que você a conclua.</span>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-emerald-900 dark:text-emerald-200 mb-0.5">
                  Prioridade
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="px-2 py-1 rounded-lg bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-800 text-xs text-stone-900 dark:text-stone-100"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
              Anotações & Requisitos
            </label>
            <textarea 
              rows={2}
              placeholder="Critérios de entrega, capítulos do livro, observações do professor..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] text-white font-bold text-xs shadow-xs"
            >
              {taskToEdit ? 'Atualizar Tarefa' : 'Salvar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
