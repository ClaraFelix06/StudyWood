export type Priority = 'baixa' | 'media' | 'alta';
export type TaskStatus = 'pendente' | 'em_andamento' | 'concluido' | 'concluida';
export type TaskType = 'tarefa' | 'prova' | 'trabalho' | 'leitura';

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  noDeadline?: boolean; // Sem tempo limite
  priority: Priority;
  status: TaskStatus;
  notes?: string;
  reminderMinutes?: number;
  googleCalendarSynced?: boolean;
  type: TaskType;
  progressCurrent?: number;
  progressTarget?: number;
  progressUnit?: string;
  currentCount?: number;
  targetCount?: number;
  icon?: string;
  createdAt: string;
}

export type TopicStatus = 'estudando' | 'proximo' | 'concluido';

export interface SubjectTopic {
  id: string;
  title: string;
  description?: string;
  status: TopicStatus; // 'estudando' = vendo atualmente na matéria
  addedAt?: string;
}

export type MaterialType = 'slide' | 'pdf' | 'link' | 'arquivo';

export interface SubjectMaterial {
  id: string;
  title: string;
  type: MaterialType;
  url?: string; // Base64 data URL or external link
  fileName?: string;
  fileSize?: string;
  topicId?: string; // Optional link to a specific topic
  addedAt: string;
  notes?: string;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  professor: string;
  color: string;
  icon: string;
  room?: string; // Sala ou Prédio
  credits?: number;
  attendanceTotal?: number;
  attendancePresent?: number;
  attendanceAttended?: number;
  currentTopics?: SubjectTopic[];
  materials?: SubjectMaterial[];
}

export type EventType = 'aula' | 'prova' | 'entrega' | 'reuniao' | 'evento';

export interface AcademicEvent {
  id: string;
  title: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  type: EventType;
  time?: string;
  color?: string;
  description?: string;
  location?: string;
  notes?: string;
  reminderMinutes?: number;
  googleEventId?: string;
}

export interface WeeklyClass {
  id: string;
  weekday: number;
  subjectId: string;
  buddyId?: string;
  startTime: string;
  endTime: string;
}

export interface StudyBuddy {
  id: string;
  name: string;
  contact?: string;
  role?: 'colega' | 'orientador' | 'monitor' | 'professor';
  avatar?: string;
  course?: string;
  email?: string;
  status?: 'online' | 'estudando' | 'ocupado' | 'offline';
  specialty?: string;
}

export interface AcademicNote {
  id: string;
  title: string;
  content: string;
  subjectId?: string;
  date: string;
  tags: string[];
  isPinned?: boolean;
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'orange';
}

export interface GalleryPhoto {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  tag?: string;
}

export interface WidgetConfig {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  size: 'small' | 'medium' | 'large' | 'full';
}

export type ThemePreset = 'sherwood' | 'dark_academia' | 'sakura' | 'warm_coffee' | 'tech_cyber';
export type FontFamilyOption = 'handwriting' | 'technical' | 'default';

export interface ThemeConfig {
  mode: 'light' | 'dark';
  preset: ThemePreset;
  fontFamily: FontFamilyOption;
  fontStyle?: 'handwriting' | 'technical' | 'default';
  primaryColor?: string;
  customBackgroundColor?: string;
  customBackgroundImage?: string | null;
  bannerImage: string;
  accentColor: string;
  woodTexture: boolean;
  soundEffects?: boolean;
}

export interface NotificationSettings {
  enablePush: boolean;
  soundEnabled: boolean;
  defaultAdvanceMinutes: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSynced: string | null;
  cloudSyncId: string;
  syncState: 'synced' | 'syncing' | 'offline' | 'error';
  googleCalendarConnected: boolean;
  googleCalendarIcalUrl?: string;
}

export interface CloudSyncStatus {
  isOnline: boolean;
  lastSyncTime: string | null;
  pendingSyncCount: number;
  syncInProgress: boolean;
}

export interface StudentProfile {
  name: string;
  course: string;
  period?: string;
  startDate?: string;
  endDate?: string;
  university: string;
  registrationNumber: string;
  currentSemester: string;
  targetGpa: number;
  currentGpa: number;
  avatarUrl?: string;
  email?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  course: string;
  period?: string;
  startDate?: string;
  endDate?: string;
  university: string;
  avatarUrl: string;
  registrationNumber?: string;
  currentSemester?: string;
  targetGpa?: number;
  currentGpa?: number;
  createdAt: string;
}
