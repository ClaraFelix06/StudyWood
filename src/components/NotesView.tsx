import React, { useState } from 'react';
import { StickyNote, Plus, Pin, Trash2, Tag, Search } from 'lucide-react';
import { AcademicNote, ThemeConfig } from '../types';

interface NotesViewProps {
  notes: AcademicNote[];
  theme: ThemeConfig;
  onAddNote: (note: Omit<AcademicNote, 'id'>) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  theme,
  onAddNote,
  onDeleteNote,
  onTogglePin,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [color, setColor] = useState<'yellow' | 'green' | 'blue' | 'pink' | 'orange'>('yellow');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onAddNote({
      title: title || 'Sem título',
      content,
      date: 'Hoje',
      tags: tags.length ? tags : ['Geral'],
      isPinned: false,
      color,
    });

    setTitle('');
    setContent('');
    setTagsInput('');
    setShowModal(false);
  };

  const filteredNotes = notes.filter((n) => {
    const q = searchTerm.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const getColorClasses = (col: string) => {
    switch (col) {
      case 'green':
        return 'bg-[#f0fdf4] dark:bg-[#152418] border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100';
      case 'blue':
        return 'bg-[#eff6ff] dark:bg-[#142233] border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-100';
      case 'pink':
        return 'bg-[#fff1f2] dark:bg-[#2e151f] border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100';
      case 'orange':
        return 'bg-[#fff7ed] dark:bg-[#2b1b11] border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100';
      default: // yellow
        return 'bg-[#fefce8] dark:bg-[#26240f] border-yellow-300 dark:border-yellow-800 text-yellow-950 dark:text-yellow-100';
    }
  };

  const isDark = theme.mode === 'dark';

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div 
        className="p-5 rounded-3xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          backgroundColor: isDark ? '#1c241e' : '#ffffff',
          borderColor: isDark ? '#2a382d' : '#e5e7eb',
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <h2 className="text-xl font-extrabold tracking-tight text-stone-900 dark:text-emerald-300">
              Bloco de Notas & Ideias de Estudo
            </h2>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            Capture reflexões rápidas, orientações de professores, resumos e sonhos acadêmicos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="text"
              placeholder="Buscar notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#234d32]"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Nota</span>
          </button>
        </div>
      </div>

      {/* Sticky Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNotes.map((note) => {
          const colorStyle = getColorClasses(note.color);

          return (
            <div
              key={note.id}
              className={`p-5 rounded-3xl border shadow-xs transition-all hover:shadow-md flex flex-col justify-between relative group ${colorStyle}`}
            >
              <div>
                {/* Note Header: Pin + Title */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-extrabold text-sm tracking-tight">
                    {note.title}
                  </h3>
                  <button
                    onClick={() => onTogglePin(note.id)}
                    className={`p-1 rounded-full hover:bg-black/10 transition-colors ${
                      note.isPinned ? 'text-amber-600 dark:text-amber-400 fill-amber-500' : 'text-stone-400 opacity-0 group-hover:opacity-100'
                    }`}
                    title={note.isPinned ? 'Desafixar nota' : 'Fixar nota no topo'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Content */}
                <p className="text-xs whitespace-pre-line leading-relaxed mb-4 opacity-95">
                  {note.content}
                </p>
              </div>

              {/* Note Footer: Tags + Date + Delete */}
              <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px]">
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((t, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px] font-bold">
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium opacity-75">{note.date}</span>
                  <button
                    onClick={() => {
                      if (confirm('Excluir esta nota?')) {
                        onDeleteNote(note.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-red-500 transition-opacity p-0.5"
                    title="Excluir nota"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Note Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-md rounded-3xl p-6 border shadow-2xl animate-in zoom-in-95"
            style={{
              backgroundColor: isDark ? '#1c241e' : '#ffffff',
              borderColor: isDark ? '#2a382d' : '#e5e7eb',
            }}
          >
            <h3 className="text-lg font-bold text-stone-900 dark:text-emerald-300 mb-4 flex items-center gap-2">
              <span>📝</span> Criar Nova Anotação
            </h3>

            <form onSubmit={handleAdd} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                  Título
                </label>
                <input 
                  type="text"
                  placeholder="Ex: Dicas para a Prova de Cálculo..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                  Conteúdo da Nota
                </label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Escreva suas anotações, fórmulas, lembretes ou ideias..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                  Tags (separadas por vírgula)
                </label>
                <input 
                  type="text"
                  placeholder="TCC, IA, Fórmulas"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                  Cor do Cartão
                </label>
                <div className="flex items-center gap-3">
                  {(['yellow', 'green', 'blue', 'pink', 'orange'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        c === 'yellow' ? 'bg-yellow-200' :
                        c === 'green' ? 'bg-emerald-200' :
                        c === 'blue' ? 'bg-blue-200' :
                        c === 'pink' ? 'bg-rose-200' : 'bg-amber-200'
                      } ${color === c ? 'border-stone-900 dark:border-white scale-110' : 'border-transparent'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] text-white font-bold text-xs shadow-xs"
                >
                  Criar Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
