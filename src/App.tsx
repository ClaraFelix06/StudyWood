import React, { useState, useEffect } from 'react';
import { 
  loadTasks, 
  saveTasks, 
  loadEvents, 
  saveEvents, 
  loadSubjects, 
  saveSubjects, 
  loadBuddies, 
  saveBuddies, 
  loadNotes, 
  saveNotes, 
  loadPhotos,
  savePhotos,
  loadThemeConfig, 
  saveThemeConfig, 
  playNotificationSound,
  loadCurrentUser,
  saveCurrentUser,
  loadProfile,
  saveProfile
} from './utils/storage';
import { 
  Task, 
  AcademicEvent, 
  Subject, 
  StudyBuddy, 
  AcademicNote, 
  GalleryPhoto,
  ThemeConfig, 
  CloudSyncStatus,
  TaskType,
  UserAccount,
  StudentProfile
} from './types';
import { INITIAL_PROFILE } from './data/initialData';
import { getAuthenticatedUser, isAuthConfigured, signOut } from './utils/auth';

// Components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TasksView } from './components/TasksView';
import { CalendarView } from './components/CalendarView';
import { SubjectsView } from './components/SubjectsView';
import { StudyGroupView } from './components/StudyGroupView';
import { NotesView } from './components/NotesView';
import { GalleryView } from './components/GalleryView';
import { SettingsModal } from './components/SettingsModal';
import { TaskModal } from './components/TaskModal';
import { AuthModal } from './components/AuthModal';
import { AuthPage } from './components/AuthPage';
import { LogoutConfirmModal } from './components/LogoutConfirmModal';

export default function App() {
  // User & Profile State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(loadCurrentUser);
  const [profile, setProfile] = useState<StudentProfile>(loadProfile);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // State Initialization
  const [theme, setTheme] = useState<ThemeConfig>(loadThemeConfig);
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [events, setEvents] = useState<AcademicEvent[]>(loadEvents);
  const [subjects, setSubjects] = useState<Subject[]>(loadSubjects);
  const [buddies, setBuddies] = useState<StudyBuddy[]>(loadBuddies);
  const [notes, setNotes] = useState<AcademicNote[]>(loadNotes);
  const [photos, setPhotos] = useState<GalleryPhoto[]>(loadPhotos);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [initialTaskType, setInitialTaskType] = useState<TaskType>('tarefa');

  // Cloud Sync Status
  const [cloudSync, setCloudSync] = useState<CloudSyncStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    pendingSyncCount: 0,
    syncInProgress: false,
  });

  useEffect(() => {
    if (!isAuthConfigured) {
      return;
    }

    getAuthenticatedUser().then((user) => {
      if (user) {
        setCurrentUser(user);
        saveCurrentUser(user);
      }
    });
  }, []);

  // Apply Theme & Mode to Document (Modo Escuro Permanente)
  useEffect(() => {
    saveThemeConfig({ ...theme, mode: 'dark' });
    const root = document.documentElement;
    root.classList.add('dark');
  }, [theme]);

  // Online / Offline Listeners
  useEffect(() => {
    const handleOnline = () => setCloudSync((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () => setCloudSync((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Task & Goal Handlers
  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === taskId) {
          const newStatus = t.status === 'concluido' || t.status === 'concluida' ? 'pendente' : 'concluido';
          return {
            ...t,
            status: newStatus as any,
            currentCount: newStatus === 'concluido' ? (t.targetCount || 100) : 0,
          };
        }
        return t;
      });
      saveTasks(updated);
      return updated;
    });
  };

  const handleUpdateProgress = (taskId: string, delta: number) => {
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === taskId) {
          const current = t.currentCount || 0;
          const target = t.targetCount || 100;
          const nextVal = Math.max(0, Math.min(target, current + delta));
          const isFinished = nextVal >= target;
          return {
            ...t,
            currentCount: nextVal,
            status: isFinished ? ('concluida' as any) : ('em_andamento' as any),
          };
        }
        return t;
      });
      saveTasks(updated);
      return updated;
    });
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (taskToEdit) {
      setTasks((prev) => {
        const updated = prev.map((t) => (t.id === taskToEdit.id ? { ...t, ...taskData } : t));
        saveTasks(updated);
        return updated;
      });
    } else {
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => {
        const updated = [newTask, ...prev];
        saveTasks(updated);
        return updated;
      });
    }
    setIsTaskModalOpen(false);
    setTaskToEdit(null);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Deseja excluir esta atividade permanentemente?')) {
      setTasks((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        saveTasks(updated);
        return updated;
      });
    }
  };

  const handleOpenNewTaskModal = (type: TaskType = 'tarefa') => {
    setTaskToEdit(null);
    setInitialTaskType(type);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setInitialTaskType(task.type);
    setIsTaskModalOpen(true);
  };

  // Calendar Event Handlers
  const handleAddEvent = (eventData: Omit<AcademicEvent, 'id'>) => {
    const newEvent: AcademicEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
    };
    setEvents((prev) => {
      const updated = [...prev, newEvent];
      saveEvents(updated);
      return updated;
    });
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveEvents(updated);
      return updated;
    });
  };

  // Subject Handlers
  const handleAddSubject = (subjectData: Omit<Subject, 'id'>) => {
    const newSub: Subject = {
      ...subjectData,
      id: `sub-${Date.now()}`,
    };
    setSubjects((prev) => {
      const updated = [...prev, newSub];
      saveSubjects(updated);
      return updated;
    });
  };

  const handleUpdateSubject = (updatedSubject: Subject) => {
    setSubjects((prev) => {
      const updated = prev.map((s) => (s.id === updatedSubject.id ? updatedSubject : s));
      saveSubjects(updated);
      return updated;
    });
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveSubjects(updated);
      return updated;
    });
  };

  // Study Buddy Handlers
  const handleAddBuddy = (buddyData: Omit<StudyBuddy, 'id'>) => {
    const newBuddy: StudyBuddy = {
      ...buddyData,
      id: `buddy-${Date.now()}`,
    };
    setBuddies((prev) => {
      const updated = [...prev, newBuddy];
      saveBuddies(updated);
      return updated;
    });
  };

  const handleDeleteBuddy = (id: string) => {
    setBuddies((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      saveBuddies(updated);
      return updated;
    });
  };

  // Note Handlers
  const handleAddNote = (noteData: Omit<AcademicNote, 'id' | 'date'>) => {
    const newNote: AcademicNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      date: 'Hoje, ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setNotes((prev) => {
      const updated = [newNote, ...prev];
      saveNotes(updated);
      return updated;
    });
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      saveNotes(updated);
      return updated;
    });
  };

  const handleTogglePinNote = (id: string) => {
    setNotes((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n));
      saveNotes(updated);
      return updated;
    });
  };

  // Photo Gallery Handlers
  const handleAddPhoto = (photoData: Omit<GalleryPhoto, 'id' | 'date'>) => {
    const newPhoto: GalleryPhoto = {
      ...photoData,
      id: `photo-${Date.now()}`,
      date: 'Hoje, ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setPhotos((prev) => {
      const updated = [newPhoto, ...prev];
      savePhotos(updated);
      return updated;
    });
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      savePhotos(updated);
      return updated;
    });
  };

  // Profile & User Handlers
  const handleUpdateProfile = (updatedFields: Partial<StudentProfile>) => {
    const updatedProfile: StudentProfile = {
      ...profile,
      ...updatedFields,
    };
    setProfile(updatedProfile);
    saveProfile(updatedProfile);

    if (currentUser) {
      const updatedUser: UserAccount = {
        ...currentUser,
        name: updatedFields.name ?? currentUser.name,
        course: updatedFields.course ?? currentUser.course,
        university: updatedFields.university ?? currentUser.university,
        avatarUrl: updatedFields.avatarUrl ?? currentUser.avatarUrl,
      };
      setCurrentUser(updatedUser);
      saveCurrentUser(updatedUser);
    }
  };

  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    saveCurrentUser(user);

    const updatedProfile: StudentProfile = {
      ...profile,
      name: user.name,
      email: user.email,
      course: user.course,
      period: user.period || profile.period,
      startDate: user.startDate || profile.startDate,
      endDate: user.endDate || profile.endDate,
      university: user.university,
      avatarUrl: user.avatarUrl,
      registrationNumber: user.registrationNumber || profile.registrationNumber,
      currentSemester: user.period || user.currentSemester || profile.currentSemester,
      targetGpa: user.targetGpa ?? profile.targetGpa,
      currentGpa: user.currentGpa ?? profile.currentGpa,
    };
    setProfile(updatedProfile);
    saveProfile(updatedProfile);
    setIsAuthModalOpen(false);
  };

  const handleRequestLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await signOut();
    } finally {
      saveCurrentUser(null);
      setCurrentUser(null);
      setShowLogoutConfirm(false);
      setIsSettingsOpen(false);
      setAuthInitialMode('login');
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  // Font style class mapping
  const getFontClass = () => {
    switch (theme.fontStyle || theme.fontFamily) {
      case 'handwriting':
        return 'font-handwriting';
      case 'technical':
        return 'font-technical';
      default:
        return 'font-default';
    }
  };

  // Dedicated, isolated login and registration page when unauthenticated
  if (!currentUser) {
    return (
      <AuthPage 
        onSuccess={handleAuthSuccess}
        defaultMode={authInitialMode}
      />
    );
  }

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${getFontClass()} bg-[#121a14] text-[#e8f0e9]`}
      style={{
        backgroundImage: theme.customBackgroundImage ? `url(${theme.customBackgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* App Shell Container */}
      <div className="flex h-screen overflow-hidden">
        
        {/* Sidebar */}
        <Sidebar 
          activeTab={activeTab}
          currentTab={activeTab}
          onTabChange={setActiveTab}
          onSelectTab={(t) => setActiveTab(t)}
          theme={theme}
          syncStatus={cloudSync}
          profile={profile}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAuthModal={() => handleOpenAuth('login')}
          onLogout={handleRequestLogout}
          mobileOpen={mobileMenuOpen}
          isMobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          setIsMobileOpen={setMobileMenuOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden relative">
          
          <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
            {/* Top Scenic Header */}
            <Header 
              profile={profile}
              theme={theme}
              syncStatus={cloudSync}
              onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
              onOpenMobileMenu={() => setMobileMenuOpen(true)}
            />

            {/* Dynamic Views based on activeTab */}
            {activeTab === 'dashboard' && (
              <Dashboard 
                profile={profile}
                tasks={tasks}
                events={events}
                subjects={subjects}
                buddies={buddies}
                notes={notes}
                photos={photos}
                theme={theme}
                onToggleTaskStatus={handleToggleTaskStatus}
                onUpdateProgress={handleUpdateProgress}
                onUpdateTaskProgress={handleUpdateProgress}
                onOpenNewTaskModal={handleOpenNewTaskModal}
                onNavigate={setActiveTab}
                onNavigateToTab={setActiveTab}
                onAddPhoto={handleAddPhoto}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView 
                events={events}
                tasks={tasks}
                subjects={subjects}
                theme={theme}
                onAddEvent={handleAddEvent}
                onDeleteEvent={handleDeleteEvent}
              />
            )}

            {activeTab === 'tasks' && (
              <TasksView 
                tasks={tasks}
                subjects={subjects}
                theme={theme}
                onToggleStatus={handleToggleTaskStatus}
                onUpdateProgress={handleUpdateProgress}
                onDeleteTask={handleDeleteTask}
                onOpenNewTaskModal={handleOpenNewTaskModal}
                onEditTask={handleEditTask}
              />
            )}

            {activeTab === 'gallery' && (
              <GalleryView 
                photos={photos}
                theme={theme}
                onAddPhoto={handleAddPhoto}
                onDeletePhoto={handleDeletePhoto}
              />
            )}

            {(activeTab === 'buddies' || activeTab === 'group') && (
              <StudyGroupView 
                buddies={buddies}
                theme={theme}
                onAddBuddy={handleAddBuddy}
                onDeleteBuddy={handleDeleteBuddy}
              />
            )}

            {activeTab === 'subjects' && (
              <SubjectsView 
                subjects={subjects}
                tasks={tasks}
                theme={theme}
                onAddSubject={handleAddSubject}
                onUpdateSubject={handleUpdateSubject}
                onDeleteSubject={handleDeleteSubject}
                onToggleTaskStatus={handleToggleTaskStatus}
                onOpenNewTaskModal={handleOpenNewTaskModal}
              />
            )}

            {activeTab === 'notes' && (
              <NotesView 
                notes={notes}
                theme={theme}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
                onTogglePin={handleTogglePinNote}
              />
            )}
          </div>
        </main>
      </div>

      {/* Task Creation & Editing Modal */}
      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        subjects={subjects}
        theme={theme}
        initialType={initialTaskType}
      />

      {/* Settings Modal (Foto de Perfil, Tipografia, Modo Noturno e Conta) */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onUpdateTheme={(patch) => setTheme(prev => ({ ...prev, ...patch }))}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onOpenAuthModal={() => {
          setIsSettingsOpen(false);
          handleOpenAuth('login');
        }}
        onLogout={handleRequestLogout}
      />

      {/* Authentication Modal (Cadastro & Login) */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authInitialMode}
        allowClose={true}
      />

      {/* Logout Confirmation Dialog ("Deseja sair?") */}
      <LogoutConfirmModal 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}
