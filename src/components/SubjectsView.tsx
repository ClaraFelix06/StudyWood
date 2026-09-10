import React, { useState, useRef } from 'react';
import { 
  BookOpen, 
  Plus, 
  MapPin, 
  User, 
  Trash2, 
  Edit, 
  ArrowLeft, 
  FolderOpen, 
  FileText, 
  Presentation, 
  Upload, 
  Download, 
  ExternalLink, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Layers, 
  Check, 
  Calendar,
  AlertCircle,
  X,
  FileUp,
  Link2
} from 'lucide-react';
import { Subject, Task, ThemeConfig, SubjectTopic, SubjectMaterial, TopicStatus, MaterialType, TaskType } from '../types';

interface SubjectsViewProps {
  subjects: Subject[];
  tasks: Task[];
  theme: ThemeConfig;
  onAddSubject: (subject: Omit<Subject, 'id'>) => void;
  onUpdateSubject?: (subject: Subject) => void;
  onDeleteSubject: (id: string) => void;
  onToggleTaskStatus?: (id: string) => void;
  onOpenNewTaskModal?: (type?: TaskType, subjectId?: string) => void;
}

const PRESET_COLORS = [
  '#10b981', // Esmeralda
  '#3b82f6', // Azul
  '#f59e0b', // Âmbar
  '#ec4899', // Rosa
  '#8b5cf6', // Roxo
  '#06b6d4', // Ciano
  '#ef4444', // Vermelho
  '#84cc16', // Verde Lima
];

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  tasks,
  theme,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onToggleTaskStatus,
  onOpenNewTaskModal,
}) => {
  // Navigation & selection state
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<'assuntos' | 'materiais' | 'tarefas'>('assuntos');

  // New Subject Modal State (ONLY name, professor, room, color)
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [name, setName] = useState('');
  const [professor, setProfessor] = useState('');
  const [room, setRoom] = useState('');
  const [color, setColor] = useState('#10b981');

  // Edit Subject Modal State
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Subject to Delete (Custom In-App Confirmation Modal)
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  // New Topic Modal / State
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [topicStatus, setTopicStatus] = useState<TopicStatus>('estudando');

  // New Material (Slide / PDF) Modal / State
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialType, setMaterialType] = useState<MaterialType>('pdf');
  const [materialInputMethod, setMaterialInputMethod] = useState<'upload' | 'link'>('upload');
  const [materialUrl, setMaterialUrl] = useState('');
  const [materialFileName, setMaterialFileName] = useState('');
  const [materialFileSize, setMaterialFileSize] = useState('');
  const [materialNotes, setMaterialNotes] = useState('');
  const [materialTopicId, setMaterialTopicId] = useState('');
  const [materialFilter, setMaterialFilter] = useState<'all' | 'pdf' | 'slide'>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDark = theme.mode === 'dark';

  // Find currently selected subject
  const currentSubject = subjects.find(s => s.id === selectedSubjectId);

  // Helper to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Add Subject Form Submit (No Code, No Credits!)
  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddSubject({
      name: name.trim(),
      professor: professor.trim() || 'A definir',
      room: room.trim() || 'Sala a definir',
      color: color || '#10b981',
      icon: 'BookOpen',
      attendanceTotal: 30,
      attendancePresent: 30,
      currentTopics: [],
      materials: [],
    });

    setName('');
    setProfessor('');
    setRoom('');
    setColor('#10b981');
    setShowAddSubjectModal(false);
  };

  // Edit Subject Form Submit
  const handleEditSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !editingSubject.name.trim() || !onUpdateSubject) return;

    onUpdateSubject(editingSubject);
    setEditingSubject(null);
  };

  // Confirm and Execute Subject Deletion
  const handleConfirmDeleteSubject = () => {
    if (!subjectToDelete) return;
    onDeleteSubject(subjectToDelete.id);
    if (selectedSubjectId === subjectToDelete.id) {
      setSelectedSubjectId(null);
    }
    setSubjectToDelete(null);
  };

  // Add Topic to Current Subject
  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSubject || !topicTitle.trim() || !onUpdateSubject) return;

    const newTopic: SubjectTopic = {
      id: `top-${Date.now()}`,
      title: topicTitle.trim(),
      description: topicDescription.trim() || undefined,
      status: topicStatus,
      addedAt: new Date().toISOString().split('T')[0],
    };

    const updatedSubject: Subject = {
      ...currentSubject,
      currentTopics: [newTopic, ...(currentSubject.currentTopics || [])],
    };

    onUpdateSubject(updatedSubject);
    setTopicTitle('');
    setTopicDescription('');
    setTopicStatus('estudando');
    setShowAddTopicModal(false);
  };

  // Change Topic Status
  const handleUpdateTopicStatus = (topicId: string, nextStatus: TopicStatus) => {
    if (!currentSubject || !onUpdateSubject) return;

    const updatedTopics = (currentSubject.currentTopics || []).map(topic => 
      topic.id === topicId ? { ...topic, status: nextStatus } : topic
    );

    onUpdateSubject({
      ...currentSubject,
      currentTopics: updatedTopics,
    });
  };

  // Delete Topic
  const handleDeleteTopic = (topicId: string) => {
    if (!currentSubject || !onUpdateSubject) return;

    const updatedTopics = (currentSubject.currentTopics || []).filter(t => t.id !== topicId);
    onUpdateSubject({
      ...currentSubject,
      currentTopics: updatedTopics,
    });
  };

  // Handle File Selection for Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const fileSize = formatFileSize(file.size);
    setMaterialFileName(fileName);
    setMaterialFileSize(fileSize);

    if (!materialTitle) {
      // Auto-populate title with cleaner filename
      const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setMaterialTitle(cleanName);
    }

    // Auto-detect type
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.pdf')) {
      setMaterialType('pdf');
    } else if (lower.endsWith('.ppt') || lower.endsWith('.pptx') || lower.endsWith('.key') || lower.endsWith('.odp')) {
      setMaterialType('slide');
    }

    // Read as Base64 Data URL
    const reader = new FileReader();
    reader.onload = () => {
      setMaterialUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Add Material to Current Subject
  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSubject || !materialTitle.trim() || !onUpdateSubject) return;

    const newMaterial: SubjectMaterial = {
      id: `mat-${Date.now()}`,
      title: materialTitle.trim(),
      type: materialType,
      url: materialUrl.trim() || undefined,
      fileName: materialFileName.trim() || (materialType === 'pdf' ? `${materialTitle}.pdf` : `${materialTitle}.pptx`),
      fileSize: materialFileSize || (materialInputMethod === 'link' ? 'Link Web' : 'Arquivo'),
      notes: materialNotes.trim() || undefined,
      topicId: materialTopicId || undefined,
      addedAt: new Date().toISOString().split('T')[0],
    };

    const updatedSubject: Subject = {
      ...currentSubject,
      materials: [newMaterial, ...(currentSubject.materials || [])],
    };

    onUpdateSubject(updatedSubject);
    setMaterialTitle('');
    setMaterialUrl('');
    setMaterialFileName('');
    setMaterialFileSize('');
    setMaterialNotes('');
    setMaterialTopicId('');
    setShowAddMaterialModal(false);
  };

  // Delete Material
  const handleDeleteMaterial = (matId: string) => {
    if (!currentSubject || !onUpdateSubject) return;

    const updatedMaterials = (currentSubject.materials || []).filter(m => m.id !== matId);
    onUpdateSubject({
      ...currentSubject,
      materials: updatedMaterials,
    });
  };

  // Open/Download Material
  const handleOpenMaterial = (mat: SubjectMaterial) => {
    if (!mat.url) {
      alert(`Visualização não disponível diretamente para "${mat.title}". O arquivo foi registrado na matéria.`);
      return;
    }

    // If it's a web link
    if (mat.url.startsWith('http://') || mat.url.startsWith('https://')) {
      window.open(mat.url, '_blank');
      return;
    }

    // If Base64 data URL
    try {
      const win = window.open();
      if (win) {
        win.document.write(
          `<iframe src="${mat.url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
        );
        win.document.title = mat.title;
      } else {
        // Fallback download
        const a = document.createElement('a');
        a.href = mat.url;
        a.download = mat.fileName || `${mat.title}.${mat.type === 'pdf' ? 'pdf' : 'pptx'}`;
        a.click();
      }
    } catch {
      const a = document.createElement('a');
      a.href = mat.url;
      a.download = mat.fileName || `${mat.title}.${mat.type === 'pdf' ? 'pdf' : 'pptx'}`;
      a.click();
    }
  };

  const handleDownloadMaterial = (mat: SubjectMaterial) => {
    if (!mat.url) {
      alert(`Arquivo "${mat.fileName || mat.title}" adicionado sem link binário.`);
      return;
    }

    const a = document.createElement('a');
    a.href = mat.url;
    a.download = mat.fileName || `${mat.title}.${mat.type === 'pdf' ? 'pdf' : 'pptx'}`;
    a.click();
  };

  /* =========================================================================
     VIEW: SUBJECT DETAIL (When a subject is clicked)
     ========================================================================= */
  if (currentSubject) {
    const subjectTopics = currentSubject.currentTopics || [];
    const studyingTopics = subjectTopics.filter(t => t.status === 'estudando');
    const upcomingTopics = subjectTopics.filter(t => t.status === 'proximo');
    const completedTopics = subjectTopics.filter(t => t.status === 'concluido');

    const subjectMaterials = currentSubject.materials || [];
    const filteredMaterials = subjectMaterials.filter(m => {
      if (materialFilter === 'all') return true;
      return m.type === materialFilter;
    });

    const subjectTasks = tasks.filter(t => t.subjectId === currentSubject.id);

    return (
      <div className="space-y-6 pb-24 md:pb-12 animate-in fade-in-50 duration-200">
        {/* Top Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setSelectedSubjectId(null)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-xs hover:scale-[1.01]"
            style={{
              backgroundColor: isDark ? '#1c241e' : '#ffffff',
              borderColor: isDark ? '#2a382d' : '#e5e7eb',
              color: isDark ? '#d1d5db' : '#374151',
            }}
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Voltar para todas as disciplinas</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditingSubject(currentSubject)}
              className="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors"
              style={{
                backgroundColor: isDark ? '#1c241e' : '#ffffff',
                borderColor: isDark ? '#2a382d' : '#e5e7eb',
                color: isDark ? '#d1d5db' : '#4b5563',
              }}
              title="Editar dados da disciplina"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
            <button
              onClick={() => {
                setSubjectToDelete(currentSubject);
              }}
              className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors"
              title="Excluir disciplina"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir Disciplina</span>
            </button>
          </div>
        </div>

        {/* Subject Main Header Card */}
        <div 
          className="p-6 md:p-8 rounded-3xl border shadow-xs relative overflow-hidden"
          style={{
            backgroundColor: isDark ? '#1c241e' : '#ffffff',
            borderColor: isDark ? '#2a382d' : '#e5e7eb',
          }}
        >
          {/* Top color indicator banner */}
          <div 
            className="absolute top-0 left-0 right-0 h-2"
            style={{ backgroundColor: currentSubject.color }}
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span 
                  className="w-4 h-4 rounded-full shadow-xs" 
                  style={{ backgroundColor: currentSubject.color }}
                />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  Disciplina Acadêmica
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-stone-900 dark:text-stone-100">
                {currentSubject.name}
              </h1>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-stone-600 dark:text-stone-300 pt-1">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Prof. <strong>{currentSubject.professor}</strong></span>
                </div>

                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>{currentSubject.room || 'Sala a definir'}</span>
                </div>

                {studyingTopics.length > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20">
                    <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Assunto recente: {studyingTopics[0].title}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Badges / Actions */}
            <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1 rounded-xl bg-stone-100 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700/60 font-semibold">
                  📖 {subjectTopics.length} assuntos
                </span>
                <span className="text-xs px-3 py-1 rounded-xl bg-stone-100 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700/60 font-semibold">
                  📎 {subjectMaterials.length} slides/PDFs
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs inside the Subject */}
          <div className="flex items-center gap-2 mt-8 pt-5 border-t border-stone-200 dark:border-stone-800 overflow-x-auto">
            <button
              onClick={() => setDetailTab('assuntos')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                detailTab === 'assuntos'
                  ? 'bg-[#234d32] text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Assuntos da Matéria</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                detailTab === 'assuntos' ? 'bg-white/20 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
              }`}>
                {subjectTopics.length}
              </span>
            </button>

            <button
              onClick={() => setDetailTab('materiais')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                detailTab === 'materiais'
                  ? 'bg-[#234d32] text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              <Presentation className="w-4 h-4" />
              <span>Slides e PDFs</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                detailTab === 'materiais' ? 'bg-white/20 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
              }`}>
                {subjectMaterials.length}
              </span>
            </button>

            <button
              onClick={() => setDetailTab('tarefas')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                detailTab === 'tarefas'
                  ? 'bg-[#234d32] text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Tarefas & Trabalhos</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                detailTab === 'tarefas' ? 'bg-white/20 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
              }`}>
                {subjectTasks.length}
              </span>
            </button>
          </div>
        </div>

        {/* TAB 1: ASSUNTOS QUE ESTÁ VENDO ATUALMENTE */}
        {detailTab === 'assuntos' && (
          <div className="space-y-5">
            {/* Action Bar */}
            <div 
              className="p-5 rounded-3xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={{
                backgroundColor: isDark ? '#1c241e' : '#ffffff',
                borderColor: isDark ? '#2a382d' : '#e5e7eb',
              }}
            >
              <div>
                <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>📖</span> Assuntos & Tópicos da Disciplina
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                  Acompanhe os assuntos recentes das aulas e o que vem a seguir na ementa.
                </p>
              </div>

              <button
                onClick={() => setShowAddTopicModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Assunto</span>
              </button>
            </div>

            {/* In-Study Alert Banner if topics are being studied */}
            {studyingTopics.length > 0 && (
              <div 
                className="p-4 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 flex items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-2xl bg-emerald-600 text-white shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      Assunto Recente
                    </div>
                    <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {studyingTopics[0].title}
                    </div>
                    {studyingTopics[0].description && (
                      <div className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                        {studyingTopics[0].description}
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-xs shrink-0">
                  Assunto recente
                </span>
              </div>
            )}

            {/* List of Topics */}
            {subjectTopics.length === 0 ? (
              <div 
                className="p-10 rounded-3xl border border-dashed text-center space-y-3"
                style={{
                  backgroundColor: isDark ? '#1c241e' : '#ffffff',
                  borderColor: isDark ? '#2a382d' : '#d1d5db',
                }}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                  Nenhum assunto cadastrado ainda nesta disciplina
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                  Adicione os tópicos e matérias que o professor está passando em aula para manter seu estudo organizado.
                </p>
                <button
                  onClick={() => setShowAddTopicModal(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Primeiro Assunto</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {subjectTopics.map((topic, index) => {
                  const isStudying = topic.status === 'estudando';
                  const isUpcoming = topic.status === 'proximo';
                  const isCompleted = topic.status === 'concluido';

                  return (
                    <div
                      key={topic.id}
                      className={`p-4 rounded-3xl border shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isStudying 
                          ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/20' 
                          : ''
                      }`}
                      style={{
                        backgroundColor: isStudying 
                          ? undefined 
                          : (isDark ? '#1c241e' : '#ffffff'),
                        borderColor: isStudying 
                          ? undefined 
                          : (isDark ? '#2a382d' : '#e5e7eb'),
                      }}
                    >
                      <div className="flex items-start gap-3.5">
                        <span className="w-7 h-7 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </span>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className={`font-extrabold text-sm ${
                              isCompleted 
                                ? 'line-through text-stone-500 dark:text-stone-400' 
                                : 'text-stone-900 dark:text-stone-100'
                            }`}>
                              {topic.title}
                            </h3>

                            {isStudying && (
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                Assunto Recente
                              </span>
                            )}

                            {isUpcoming && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                Próximo
                              </span>
                            )}

                            {isCompleted && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                                Concluído
                              </span>
                            )}
                          </div>

                          {topic.description && (
                            <p className="text-xs text-stone-600 dark:text-stone-300">
                              {topic.description}
                            </p>
                          )}

                          {topic.addedAt && (
                            <p className="text-[10px] text-stone-500 dark:text-stone-400">
                              Adicionado em: {topic.addedAt}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status switchers & delete */}
                      <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0">
                        {/* Status Toggle Buttons */}
                        <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60 text-[11px] font-semibold">
                          <button
                            onClick={() => handleUpdateTopicStatus(topic.id, 'estudando')}
                            className={`px-2 py-1 rounded-lg transition-colors ${
                              isStudying 
                                ? 'bg-emerald-600 text-white shadow-xs font-bold' 
                                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                            }`}
                            title="Marcar como assunto recente"
                          >
                            Assunto recente
                          </button>
                          <button
                            onClick={() => handleUpdateTopicStatus(topic.id, 'proximo')}
                            className={`px-2 py-1 rounded-lg transition-colors ${
                              isUpcoming 
                                ? 'bg-amber-600 text-white shadow-xs font-bold' 
                                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                            }`}
                            title="Marcar como próximo assunto"
                          >
                            Próximo
                          </button>
                          <button
                            onClick={() => handleUpdateTopicStatus(topic.id, 'concluido')}
                            className={`px-2 py-1 rounded-lg transition-colors ${
                              isCompleted 
                                ? 'bg-stone-600 text-white shadow-xs font-bold' 
                                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                            }`}
                            title="Marcar como concluído"
                          >
                            Concluído
                          </button>
                        </div>

                        <button
                          onClick={() => handleDeleteTopic(topic.id)}
                          className="p-1.5 rounded-xl text-stone-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Excluir assunto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SLIDES E PDFS */}
        {detailTab === 'materiais' && (
          <div className="space-y-5">
            {/* Header with Add Material button & filters */}
            <div 
              className="p-5 rounded-3xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              style={{
                backgroundColor: isDark ? '#1c241e' : '#ffffff',
                borderColor: isDark ? '#2a382d' : '#e5e7eb',
              }}
            >
              <div>
                <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>📑</span> Slides, PDFs & Apostilas
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                  Faça upload de slides da aula, apostilas em PDF ou adicione links para estudar a qualquer momento.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Filter Pills */}
                <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs">
                  <button
                    onClick={() => setMaterialFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      materialFilter === 'all' 
                        ? 'bg-[#234d32] text-white shadow-xs' 
                        : 'text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    Todos ({subjectMaterials.length})
                  </button>
                  <button
                    onClick={() => setMaterialFilter('pdf')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      materialFilter === 'pdf' 
                        ? 'bg-red-600 text-white shadow-xs' 
                        : 'text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    PDFs ({subjectMaterials.filter(m => m.type === 'pdf').length})
                  </button>
                  <button
                    onClick={() => setMaterialFilter('slide')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      materialFilter === 'slide' 
                        ? 'bg-amber-600 text-white shadow-xs' 
                        : 'text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    Slides ({subjectMaterials.filter(m => m.type === 'slide').length})
                  </button>
                </div>

                <button
                  onClick={() => setShowAddMaterialModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <FileUp className="w-4 h-4" />
                  <span>Adicionar Slide ou PDF</span>
                </button>
              </div>
            </div>

            {/* Quick Upload Drop Area */}
            <div 
              onClick={() => {
                setShowAddMaterialModal(true);
                setMaterialInputMethod('upload');
              }}
              className="p-5 rounded-3xl border-2 border-dashed transition-all hover:border-emerald-500 cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left"
              style={{
                backgroundColor: isDark ? '#1c241e' : '#fcfcfc',
                borderColor: isDark ? '#2a382d' : '#e5e7eb',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Clique para enviar um PDF ou Slide da sua máquina
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    Suporta arquivos .pdf, .ppt, .pptx, .key ou links de apresentações online
                  </div>
                </div>
              </div>

              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-500/20">
                + Enviar Arquivo
              </span>
            </div>

            {/* Materials Grid */}
            {filteredMaterials.length === 0 ? (
              <div 
                className="p-10 rounded-3xl border border-dashed text-center space-y-3"
                style={{
                  backgroundColor: isDark ? '#1c241e' : '#ffffff',
                  borderColor: isDark ? '#2a382d' : '#d1d5db',
                }}
              >
                <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 mx-auto flex items-center justify-center">
                  <Presentation className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                  Nenhum material encontrado
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                  Adicione os slides disponibilizados pelo professor ou o PDF das apostilas para tê-los sempre à mão.
                </p>
                <button
                  onClick={() => setShowAddMaterialModal(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Slide ou PDF</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMaterials.map((mat) => {
                  const isPdf = mat.type === 'pdf';
                  const isSlide = mat.type === 'slide';

                  return (
                    <div
                      key={mat.id}
                      className="p-5 rounded-3xl border shadow-xs transition-all hover:shadow-md flex flex-col justify-between group"
                      style={{
                        backgroundColor: isDark ? '#1c241e' : '#ffffff',
                        borderColor: isDark ? '#2a382d' : '#e5e7eb',
                      }}
                    >
                      <div>
                        {/* Top Badge & Delete */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                            isPdf 
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' 
                              : isSlide 
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          }`}>
                            {isPdf ? <FileText className="w-3 h-3" /> : <Presentation className="w-3 h-3" />}
                            <span>{isPdf ? 'PDF / Documento' : 'Slide de Aula'}</span>
                          </span>

                          <button
                            onClick={() => handleDeleteMaterial(mat.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Excluir arquivo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Title & Filename */}
                        <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 mb-1 leading-snug line-clamp-2">
                          {mat.title}
                        </h4>

                        {mat.fileName && (
                          <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400 truncate mb-2">
                            📄 {mat.fileName}
                          </div>
                        )}

                        {mat.notes && (
                          <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 mb-3 bg-stone-50 dark:bg-stone-900/50 p-2 rounded-xl border border-stone-200/60 dark:border-stone-800">
                            {mat.notes}
                          </p>
                        )}

                        {/* Meta info */}
                        <div className="flex items-center gap-3 text-[10px] text-stone-500 dark:text-stone-400 mb-4">
                          <span>{mat.fileSize || 'Tamanho desconhecido'}</span>
                          <span>•</span>
                          <span>{mat.addedAt}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2">
                        <button
                          onClick={() => handleOpenMaterial(mat)}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Visualizar</span>
                        </button>

                        {mat.url && !mat.url.startsWith('http') && (
                          <button
                            onClick={() => handleDownloadMaterial(mat)}
                            className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
                            title="Baixar arquivo"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TAREFAS DA MATÉRIA */}
        {detailTab === 'tarefas' && (
          <div className="space-y-4">
            <div 
              className="p-5 rounded-3xl border shadow-xs flex items-center justify-between gap-4"
              style={{
                backgroundColor: isDark ? '#1c241e' : '#ffffff',
                borderColor: isDark ? '#2a382d' : '#e5e7eb',
              }}
            >
              <div>
                <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>📋</span> Tarefas & Atividades de {currentSubject.name}
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                  Provas, listas de exercícios e trabalhos vinculados a esta disciplina.
                </p>
              </div>

              {onOpenNewTaskModal && (
                <button
                  onClick={() => onOpenNewTaskModal('tarefa', currentSubject.id)}
                  className="px-4 py-2 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Atividade</span>
                </button>
              )}
            </div>

            {subjectTasks.length === 0 ? (
              <div 
                className="p-10 rounded-3xl border border-dashed text-center space-y-3"
                style={{
                  backgroundColor: isDark ? '#1c241e' : '#ffffff',
                  borderColor: isDark ? '#2a382d' : '#d1d5db',
                }}
              >
                <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                  Nenhuma atividade pendente para esta matéria!
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Você está com todos os trabalhos e estudos em dia por aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {subjectTasks.map((t) => {
                  const isDone = t.status === 'concluido';
                  return (
                    <div
                      key={t.id}
                      className="p-4 rounded-2xl border shadow-xs flex items-center justify-between gap-3"
                      style={{
                        backgroundColor: isDark ? '#1c241e' : '#ffffff',
                        borderColor: isDark ? '#2a382d' : '#e5e7eb',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onToggleTaskStatus && onToggleTaskStatus(t.id)}
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                            isDone 
                              ? 'bg-emerald-600 border-emerald-600 text-white' 
                              : 'border-stone-300 dark:border-stone-700'
                          }`}
                        >
                          {isDone && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <div>
                          <div className={`text-xs font-bold ${isDone ? 'line-through text-stone-400' : 'text-stone-900 dark:text-stone-100'}`}>
                            {t.title}
                          </div>
                          <div className="text-[10px] text-stone-500 dark:text-stone-400">
                            Prazo: {t.dueDate} {t.dueTime ? `às ${t.dueTime}` : ''}
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.priority === 'alta' 
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400' 
                          : t.priority === 'media'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            MODAL: ADICIONAR ASSUNTO
           ========================================================================= */}
        {showAddTopicModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div 
              className="w-full max-w-md rounded-3xl p-6 border shadow-2xl animate-in zoom-in-95"
              style={{
                backgroundColor: isDark ? '#1c241e' : '#ffffff',
                borderColor: isDark ? '#2a382d' : '#e5e7eb',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-stone-900 dark:text-emerald-300 flex items-center gap-2">
                  <span>📖</span> Novo Assunto em {currentSubject.name}
                </h3>
                <button
                  onClick={() => setShowAddTopicModal(false)}
                  className="p-1 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTopic} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                    Nome do Assunto / Tópico *
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Ex: Integrais Duplas e Polares, Redes Neurais..."
                    value={topicTitle}
                    onChange={(e) => setTopicTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                    Descrição ou Anotações Rápidas (opcional)
                  </label>
                  <textarea 
                    rows={2}
                    placeholder="Ex: Foco no capítulo 3 do livro, cai na Prova 1..."
                    value={topicDescription}
                    onChange={(e) => setTopicDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1.5">
                    Status do Assunto
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTopicStatus('estudando')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                        topicStatus === 'estudando' 
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300' 
                          : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      <span>🟢 Assunto recente</span>
                      <span className="text-[9px] font-normal opacity-80">Em estudo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTopicStatus('proximo')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                        topicStatus === 'proximo' 
                          ? 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300' 
                          : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      <span>🟡 Próximo</span>
                      <span className="text-[9px] font-normal opacity-80">Ementa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTopicStatus('concluido')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                        topicStatus === 'concluido' 
                          ? 'border-stone-500 bg-stone-500/10 text-stone-800 dark:text-stone-300' 
                          : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      <span>⚪ Concluído</span>
                      <span className="text-[9px] font-normal opacity-80">Já visto</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setShowAddTopicModal(false)}
                    className="px-4 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] text-white font-bold text-xs shadow-xs"
                  >
                    Salvar Assunto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL: ADICIONAR SLIDE OU PDF
           ========================================================================= */}
        {showAddMaterialModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div 
              className="w-full max-w-lg rounded-3xl p-6 border shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto"
              style={{
                backgroundColor: isDark ? '#1c241e' : '#ffffff',
                borderColor: isDark ? '#2a382d' : '#e5e7eb',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-stone-900 dark:text-emerald-300 flex items-center gap-2">
                  <span>📑</span> Adicionar Slide ou PDF
                </h3>
                <button
                  onClick={() => setShowAddMaterialModal(false)}
                  className="p-1 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Method Switch: Upload File vs Web Link */}
              <div className="flex p-1 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 mb-4">
                <button
                  type="button"
                  onClick={() => setMaterialInputMethod('upload')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    materialInputMethod === 'upload'
                      ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload de Arquivo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMaterialInputMethod('link')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    materialInputMethod === 'link'
                      ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Link da Web</span>
                </button>
              </div>

              <form onSubmit={handleAddMaterial} className="space-y-3.5">
                {/* File Upload Zone */}
                {materialInputMethod === 'upload' ? (
                  <div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.ppt,.pptx,.key,.odp,.doc,.docx"
                      className="hidden"
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-5 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-emerald-500 cursor-pointer text-center space-y-2 bg-stone-50/50 dark:bg-stone-900/30"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center">
                        <FileUp className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        {materialFileName ? `Arquivo Selecionado: ${materialFileName}` : 'Clique para selecionar o PDF ou Slide'}
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400">
                        {materialFileSize ? `Tamanho: ${materialFileSize}` : 'Suporte a PDF, PowerPoint (.pptx), Keynote'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                      Link do Slide ou PDF (Google Drive, Canva, Web) *
                    </label>
                    <input 
                      type="url"
                      required={materialInputMethod === 'link'}
                      placeholder="https://docs.google.com/presentation/... ou link direto"
                      value={materialUrl}
                      onChange={(e) => setMaterialUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                    Título do Material *
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Ex: Slides Aula 04 - Álgebra Linear, Apostila Cap 2..."
                    value={materialTitle}
                    onChange={(e) => setMaterialTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Material Type Selection */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1.5">
                    Tipo de Material
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMaterialType('pdf')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                        materialType === 'pdf' 
                          ? 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400' 
                          : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      <FileText className="w-4 h-4 text-red-500" />
                      <span>Documento PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMaterialType('slide')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                        materialType === 'slide' 
                          ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400' 
                          : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      <Presentation className="w-4 h-4 text-amber-500" />
                      <span>Slide / Apresentação</span>
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                    Observações ou Dicas de Estudo (opcional)
                  </label>
                  <textarea 
                    rows={2}
                    placeholder="Ex: Slides com gabarito da lista 2, revisar para a prova..."
                    value={materialNotes}
                    onChange={(e) => setMaterialNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setShowAddMaterialModal(false)}
                    className="px-4 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] text-white font-bold text-xs shadow-xs"
                  >
                    Salvar Material
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL: EDITAR DISCIPLINA (Nome, Professor, Sala/Prédio, Cor)
           ========================================================================= */}
        {editingSubject && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div 
              className="w-full max-w-md rounded-3xl p-6 border shadow-2xl animate-in zoom-in-95"
              style={{
                backgroundColor: isDark ? '#1c241e' : '#ffffff',
                borderColor: isDark ? '#2a382d' : '#e5e7eb',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-stone-900 dark:text-emerald-300 flex items-center gap-2">
                  <span>✏️</span> Editar Disciplina
                </h3>
                <button
                  onClick={() => setEditingSubject(null)}
                  className="p-1 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubjectSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                    Nome da Disciplina *
                  </label>
                  <input 
                    type="text"
                    required
                    value={editingSubject.name}
                    onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                    Professor(a)
                  </label>
                  <input 
                    type="text"
                    value={editingSubject.professor}
                    onChange={(e) => setEditingSubject({ ...editingSubject, professor: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                    Sala ou Prédio
                  </label>
                  <input 
                    type="text"
                    placeholder="Ex: Bloco B - Sala 204"
                    value={editingSubject.room || ''}
                    onChange={(e) => setEditingSubject({ ...editingSubject, room: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1.5">
                    Cor de Identificação
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditingSubject({ ...editingSubject, color: c })}
                        className={`w-6 h-6 rounded-full transition-transform ${editingSubject.color === c ? 'scale-125 ring-2 ring-emerald-500' : 'hover:scale-110'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <input 
                    type="color"
                    value={editingSubject.color}
                    onChange={(e) => setEditingSubject({ ...editingSubject, color: e.target.value })}
                    className="w-full h-8 rounded-xl p-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => {
                      const toDel = editingSubject;
                      setEditingSubject(null);
                      setSubjectToDelete(toDel);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir disciplina</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingSubject(null)}
                      className="px-4 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] text-white font-bold text-xs shadow-xs"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* =========================================================================
     VIEW: SUBJECTS GRID LIST (Default View)
     ========================================================================= */
  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div 
        className="p-5 md:p-6 rounded-3xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          backgroundColor: isDark ? '#1c241e' : '#ffffff',
          borderColor: isDark ? '#2a382d' : '#e5e7eb',
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📚</span>
            <h2 className="text-xl font-extrabold tracking-tight text-stone-900 dark:text-emerald-300">
              Disciplinas do Semestre
            </h2>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            Abra qualquer matéria para acompanhar os assuntos recentes e gerenciar seus slides e PDFs.
          </p>
        </div>

        <button
          onClick={() => setShowAddSubjectModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Disciplina</span>
        </button>
      </div>

      {/* Grid of Subjects */}
      {subjects.length === 0 ? (
        <div 
          className="p-12 rounded-3xl border border-dashed text-center space-y-3"
          style={{
            backgroundColor: isDark ? '#1c241e' : '#ffffff',
            borderColor: isDark ? '#2a382d' : '#d1d5db',
          }}
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
            Nenhuma disciplina cadastrada
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
            Cadastre suas matérias informando apenas o nome, professor, sala/prédio e a cor de identificação!
          </p>
          <button
            onClick={() => setShowAddSubjectModal(true)}
            className="mt-2 px-5 py-2.5 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Primeira Disciplina</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((sub) => {
            const subTasks = tasks.filter((t) => t.subjectId === sub.id);
            const pendingTasks = subTasks.filter(t => t.status === 'pendente').length;
            const subTopics = sub.currentTopics || [];
            const studyingTopic = subTopics.find(t => t.status === 'estudando');
            const subMaterials = sub.materials || [];

            return (
              <div
                key={sub.id}
                className="p-5 rounded-3xl border shadow-xs transition-all hover:shadow-md flex flex-col justify-between group relative overflow-hidden"
                style={{
                  backgroundColor: isDark ? '#1c241e' : '#ffffff',
                  borderColor: isDark ? '#2a382d' : '#e5e7eb',
                }}
              >
                {/* Accent Top Border */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: sub.color }}
                />

                <div>
                  {/* Top: Color Dot & Room */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3.5 h-3.5 rounded-full shadow-xs"
                        style={{ backgroundColor: sub.color }}
                      />
                      <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                        <span className="truncate max-w-[180px]">{sub.room || 'Sala a definir'}</span>
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSubjectToDelete(sub);
                      }}
                      className="p-1.5 rounded-xl text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Excluir disciplina"
                      aria-label="Excluir disciplina"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Subject Name */}
                  <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100 mb-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {sub.name}
                  </h3>

                  {/* Professor */}
                  <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 mb-3.5">
                    <User className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                    <span>Prof. <strong>{sub.professor}</strong></span>
                  </div>

                  {/* Highlight current topic if available */}
                  {studyingTopic ? (
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs mb-3.5">
                      <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Assunto recente:</span>
                      </div>
                      <div className="font-bold text-stone-900 dark:text-stone-100 truncate mt-0.5">
                        {studyingTopic.title}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 mb-3.5 flex items-center justify-between">
                      <span>{subTopics.length > 0 ? `${subTopics.length} tópicos cadastrados` : 'Nenhum assunto cadastrado'}</span>
                      <span>📖</span>
                    </div>
                  )}

                  {/* Materials & Tasks Indicators */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800">
                      <div className="text-[10px] font-bold text-stone-500 mb-0.5 flex items-center gap-1">
                        <Presentation className="w-3 h-3" />
                        <span>Slides & PDFs</span>
                      </div>
                      <div className="font-extrabold text-stone-900 dark:text-stone-100">
                        {subMaterials.length} arquivos
                      </div>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800">
                      <div className="text-[10px] font-bold text-stone-500 mb-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Tarefas</span>
                      </div>
                      <div className={`font-extrabold ${pendingTasks > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                        {pendingTasks > 0 ? `${pendingTasks} pendentes` : 'Tudo em dia'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Button to Open Subject Detail + Quick Delete */}
                <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedSubjectId(sub.id);
                      setDetailTab('assuntos');
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-[#234d32] hover:text-white dark:hover:bg-[#234d32] dark:hover:text-white text-stone-800 dark:text-stone-200 text-xs font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-[#234d32] group-hover:text-white"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Abrir Disciplina</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSubjectToDelete(sub);
                    }}
                    className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:border-red-900/50 transition-colors shrink-0"
                    title={`Excluir disciplina "${sub.name}"`}
                    aria-label={`Excluir disciplina "${sub.name}"`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MODAL: CADASTRAR NOVA DISCIPLINA (Apenas: Nome, Professor, Sala/Prédio, Cor)
         ========================================================================= */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-md rounded-3xl p-6 border shadow-2xl animate-in zoom-in-95"
            style={{
              backgroundColor: isDark ? '#1c241e' : '#ffffff',
              borderColor: isDark ? '#2a382d' : '#e5e7eb',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-stone-900 dark:text-emerald-300 flex items-center gap-2">
                <span>📚</span> Cadastrar Nova Disciplina
              </h3>
              <button
                onClick={() => setShowAddSubjectModal(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubjectSubmit} className="space-y-4">
              {/* Nome da Disciplina */}
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                  Nome da Disciplina *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Física Quântica, Inteligência Artificial, Direito Civil..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Professor */}
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                  Professor(a)
                </label>
                <input 
                  type="text"
                  placeholder="Ex: Prof. Albert Einstein, Dra. Maria Silva..."
                  value={professor}
                  onChange={(e) => setProfessor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Sala ou Prédio */}
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                  Sala ou Prédio
                </label>
                <input 
                  type="text"
                  placeholder="Ex: Bloco B - Sala 104, Laboratório 2, Auditório..."
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Cor de Identificação */}
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1.5">
                  Cor de Identificação
                </label>
                <div className="flex items-center gap-2 mb-2">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-emerald-500' : 'hover:scale-110'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <input 
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-8 rounded-xl p-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] text-white font-bold text-xs shadow-xs"
                >
                  Salvar Disciplina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CONFIRMAR EXCLUSÃO DE DISCIPLINA (Custom In-App Modal)
         ========================================================================= */}
      {subjectToDelete && (
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
                  Excluir Disciplina
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                  Tem certeza que deseja excluir a matéria{' '}
                  <strong className="text-stone-900 dark:text-stone-100 font-bold">
                    "{subjectToDelete.name}"
                  </strong>
                  ?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/40 text-xs text-red-800 dark:text-red-300 mb-5 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                Esta ação removerá a disciplina, todos os tópicos de aula e arquivos vinculados a ela. Esta ação não poderá ser desfeita.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setSubjectToDelete(null)}
                className="px-4 py-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSubject}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir Disciplina</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
