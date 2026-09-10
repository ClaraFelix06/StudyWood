import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Mail, 
  Phone, 
  Trash2, 
  GraduationCap, 
  X, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { StudyBuddy, ThemeConfig } from '../types';

interface StudyGroupViewProps {
  buddies: StudyBuddy[];
  theme: ThemeConfig;
  onAddBuddy: (buddy: Omit<StudyBuddy, 'id'>) => void;
  onDeleteBuddy: (id: string) => void;
}

export const StudyGroupView: React.FC<StudyGroupViewProps> = ({
  buddies,
  theme,
  onAddBuddy,
  onDeleteBuddy,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [professorToDelete, setProfessorToDelete] = useState<StudyBuddy | null>(null);

  // Form: ONLY nome do professor, contato, and email
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddBuddy({
      name: name.trim(),
      contact: contact.trim(),
      email: email.trim(),
      role: 'professor',
      course: 'Docente',
      status: 'online',
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 500)}?w=150&auto=format&fit=crop&q=80`,
    });

    setName('');
    setContact('');
    setEmail('');
    setShowModal(false);
  };

  const handleConfirmDelete = () => {
    if (!professorToDelete) return;
    onDeleteBuddy(professorToDelete.id);
    setProfessorToDelete(null);
  };

  const isDark = theme.mode === 'dark';

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div 
        className="p-6 rounded-3xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          backgroundColor: isDark ? '#1c241e' : '#ffffff',
          borderColor: isDark ? '#2a382d' : '#e5e7eb',
        }}
      >
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">👨‍🏫</span>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-stone-900 dark:text-emerald-300">
              Professores
            </h2>
          </div>
          <p className="text-xs md:text-sm text-stone-600 dark:text-stone-300 mt-1">
            Contatos, telefones e e-mails de atendimento dos seus professores e orientadores.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-[#234d32] hover:bg-[#1a3d27] text-white font-bold text-sm flex items-center gap-2 shadow-xs transition-colors self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Professor</span>
        </button>
      </div>

      {/* Professors Grid */}
      {buddies.length === 0 ? (
        <div 
          className="p-12 text-center rounded-3xl border border-dashed border-stone-300 dark:border-stone-700 bg-white/50 dark:bg-stone-900/30"
        >
          <GraduationCap className="w-12 h-12 mx-auto text-stone-400 mb-3" />
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
            Nenhum professor cadastrado
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Clique no botão acima para cadastrar o nome, contato e e-mail dos seus professores.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {buddies.map((prof) => (
            <div
              key={prof.id}
              className="p-5 rounded-3xl border shadow-xs transition-all hover:shadow-md flex flex-col justify-between group"
              style={{
                backgroundColor: isDark ? '#1c241e' : '#ffffff',
                borderColor: isDark ? '#2a382d' : '#e5e7eb',
              }}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-[#234d32] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 shadow-xs">
                    <GraduationCap className="w-6 h-6" />
                  </div>

                  <button
                    onClick={() => setProfessorToDelete(prof)}
                    className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Excluir professor"
                    aria-label={`Excluir professor ${prof.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100 line-clamp-1 mb-2">
                  {prof.name}
                </h3>

                <div className="space-y-2 text-xs">
                  {prof.contact ? (
                    <div className="flex items-start gap-2 text-stone-700 dark:text-stone-300 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <span className="block text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500">
                          Contato
                        </span>
                        <span className="font-medium break-words text-stone-800 dark:text-stone-200">
                          {prof.contact}
                        </span>
                      </div>
                    </div>
                  ) : prof.course ? (
                    <div className="flex items-start gap-2 text-stone-700 dark:text-stone-300 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <span className="block text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500">
                          Área / Matéria
                        </span>
                        <span className="font-medium break-words text-stone-800 dark:text-stone-200">
                          {prof.course}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {prof.email && (
                    <div className="flex items-start gap-2 text-stone-700 dark:text-stone-300 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800">
                      <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <span className="block text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500">
                          E-mail
                        </span>
                        <a 
                          href={`mailto:${prof.email}`}
                          className="font-medium text-blue-700 dark:text-blue-300 hover:underline break-all block"
                        >
                          {prof.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2">
                {prof.email ? (
                  <a 
                    href={`mailto:${prof.email}`}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-[#234d32] hover:text-white dark:hover:bg-[#234d32] dark:hover:text-white text-stone-700 dark:text-stone-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Enviar E-mail</span>
                  </a>
                ) : (
                  <div className="flex-1" />
                )}

                <button
                  onClick={() => setProfessorToDelete(prof)}
                  className="p-1.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:border-red-900/50 transition-colors"
                  title={`Excluir professor ${prof.name}`}
                  aria-label={`Excluir professor ${prof.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Adicionar Professor (ONLY nome, contato, email) */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="w-full max-w-md rounded-3xl p-6 border shadow-2xl animate-in zoom-in-95"
            style={{
              backgroundColor: isDark ? '#1c241e' : '#ffffff',
              borderColor: isDark ? '#2a382d' : '#e5e7eb',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">👨‍🏫</span>
                <h3 className="text-lg font-bold text-stone-900 dark:text-emerald-300">
                  Adicionar Novo Professor
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                  Nome do Professor *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Prof. Dr. Carlos Mendes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#234d32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                  Contato
                </label>
                <input 
                  type="text"
                  placeholder="Ex: (11) 98765-4321 / Sala 304 - Bloco B"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#234d32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                  E-mail
                </label>
                <input 
                  type="email"
                  placeholder="Ex: professor@universidade.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#234d32]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Salvar Professor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Exclusão de Professor */}
      {professorToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div 
            className="w-full max-w-md rounded-3xl p-6 border shadow-2xl animate-in zoom-in-95"
            style={{
              backgroundColor: isDark ? '#1c241e' : '#ffffff',
              borderColor: isDark ? '#2a382d' : '#e5e7eb',
            }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 border border-red-200 dark:border-red-900/40">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                  Excluir Professor
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                  Tem certeza que deseja remover o cadastro do professor{' '}
                  <strong className="text-stone-900 dark:text-stone-100 font-bold">
                    "{professorToDelete.name}"
                  </strong>
                  ?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/40 text-xs text-red-800 dark:text-red-300 mb-5 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                Os dados de contato e e-mail deste docente serão excluídos da sua lista de professores.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setProfessorToDelete(null)}
                className="px-4 py-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
