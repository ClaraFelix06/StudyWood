import { 
  Task, 
  Subject, 
  AcademicEvent, 
  StudyBuddy, 
  AcademicNote, 
  GalleryPhoto,
  WidgetConfig, 
  ThemeConfig,
  UserAccount,
  StudentProfile
} from '../types';
import { 
  INITIAL_WIDGETS, 
  INITIAL_THEME,
  EMPTY_PROFILE
} from '../data/initialData';

// Storage and integration utilities

const STORAGE_KEYS = {
  TASKS: 'studywood_tasks_v2',
  SUBJECTS: 'studywood_subjects_v2',
  EVENTS: 'studywood_events_v2',
  BUDDIES: 'studywood_buddies_v2',
  NOTES: 'studywood_notes_v2',
  PHOTOS: 'studywood_photos_v2',
  THEME: 'studywood_theme_v2',
  WIDGETS: 'studywood_widgets_v2',
  PROFILE: 'studywood_profile_v2',
  NOTIFICATIONS: 'studywood_notifications_v2',
  SYNC_INFO: 'studywood_sync_info_v2',
  USERS: 'studywood_users_v2',
  CURRENT_USER: 'studywood_current_user_v2',
};

export { STORAGE_KEYS };

// Save data locally
export function saveStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Dispatch broadcast event for multi-tab / window sync
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      const channel = new BroadcastChannel('sherwood_sync_channel');
      channel.postMessage({ type: 'DATA_UPDATED', key, timestamp: Date.now() });
      channel.close();
    }
  } catch (err) {
    console.error('Erro ao salvar no storage local:', err);
  }
}

// Load data locally
export function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.error('Erro ao carregar do storage:', err);
    return fallback;
  }
}

// Typed Loaders & Savers
export const loadTasks = (): Task[] => loadStorage(STORAGE_KEYS.TASKS, []);
export const saveTasks = (tasks: Task[]): void => saveStorage(STORAGE_KEYS.TASKS, tasks);

export const loadEvents = (): AcademicEvent[] => loadStorage(STORAGE_KEYS.EVENTS, []);
export const saveEvents = (events: AcademicEvent[]): void => saveStorage(STORAGE_KEYS.EVENTS, events);

export const loadSubjects = (): Subject[] => {
  return loadStorage<Subject[]>(STORAGE_KEYS.SUBJECTS, []);
};
export const saveSubjects = (subjects: Subject[]): void => saveStorage(STORAGE_KEYS.SUBJECTS, subjects);

export const loadBuddies = (): StudyBuddy[] => loadStorage(STORAGE_KEYS.BUDDIES, []);
export const saveBuddies = (buddies: StudyBuddy[]): void => saveStorage(STORAGE_KEYS.BUDDIES, buddies);

export const loadNotes = (): AcademicNote[] => loadStorage(STORAGE_KEYS.NOTES, []);
export const saveNotes = (notes: AcademicNote[]): void => saveStorage(STORAGE_KEYS.NOTES, notes);

export const loadPhotos = (): GalleryPhoto[] => loadStorage(STORAGE_KEYS.PHOTOS, []);
export const savePhotos = (photos: GalleryPhoto[]): void => saveStorage(STORAGE_KEYS.PHOTOS, photos);

export const loadThemeConfig = (): ThemeConfig => {
  const loaded = loadStorage(STORAGE_KEYS.THEME, INITIAL_THEME);
  return {
    ...loaded,
    mode: 'dark',
  };
};
export const saveThemeConfig = (theme: ThemeConfig): void => {
  saveStorage(STORAGE_KEYS.THEME, { ...theme, mode: 'dark' });
};

export const loadWidgets = (): WidgetConfig[] => loadStorage(STORAGE_KEYS.WIDGETS, INITIAL_WIDGETS);
export const saveWidgets = (widgets: WidgetConfig[]): void => saveStorage(STORAGE_KEYS.WIDGETS, widgets);

// User Accounts & Authentication
export const loadUsers = (): UserAccount[] => loadStorage(STORAGE_KEYS.USERS, []);
export const saveUsers = (users: UserAccount[]): void => saveStorage(STORAGE_KEYS.USERS, users);

export const loadCurrentUser = (): UserAccount | null => {
  return loadStorage<UserAccount | null>(STORAGE_KEYS.CURRENT_USER, null);
};

export const saveCurrentUser = (user: UserAccount | null): void => {
  saveStorage(STORAGE_KEYS.CURRENT_USER, user);
};

export const clearStudyData = (): void => {
  [
    STORAGE_KEYS.TASKS,
    STORAGE_KEYS.SUBJECTS,
    STORAGE_KEYS.EVENTS,
    STORAGE_KEYS.BUDDIES,
    STORAGE_KEYS.NOTES,
    STORAGE_KEYS.PHOTOS,
    STORAGE_KEYS.WIDGETS,
    STORAGE_KEYS.NOTIFICATIONS,
    STORAGE_KEYS.SYNC_INFO,
    STORAGE_KEYS.PROFILE,
  ].forEach((key) => localStorage.removeItem(key));
};

export const loadProfile = (): StudentProfile => {
  const current = loadCurrentUser();
  if (current) {
    return {
      name: current.name,
      email: current.email,
      course: current.course,
      period: current.period,
      startDate: current.startDate,
      endDate: current.endDate,
      university: current.university,
      registrationNumber: current.registrationNumber || 'DA-1234-5678-9101',
      currentSemester: current.period || current.currentSemester || '2024.2 • Semestre 6',
      targetGpa: current.targetGpa ?? 5.0,
      currentGpa: current.currentGpa ?? 4.8,
      avatarUrl: current.avatarUrl,
    };
  }
  return loadStorage(STORAGE_KEYS.PROFILE, EMPTY_PROFILE);
};

export const saveProfile = (profile: StudentProfile): void => {
  saveStorage(STORAGE_KEYS.PROFILE, profile);
  // Also synchronize active user account if logged in
  const current = loadCurrentUser();
  if (current) {
    const updatedUser: UserAccount = {
      ...current,
      name: profile.name,
      course: profile.course,
      period: profile.period ?? current.period,
      startDate: profile.startDate ?? current.startDate,
      endDate: profile.endDate ?? current.endDate,
      university: profile.university,
      avatarUrl: profile.avatarUrl || current.avatarUrl,
    };
    saveCurrentUser(updatedUser);

    const users = loadUsers();
    const idx = users.findIndex(u => u.id === current.id || u.email === current.email);
    if (idx >= 0) {
      users[idx] = updatedUser;
      saveUsers(users);
    }
  }
};

// Notification permission alias
export const requestNotificationPermission = async (): Promise<boolean> => {
  return requestBrowserNotification();
};

export const sendAcademicReminder = (title: string, body: string): void => {
  triggerBrowserNotification(title, { body });
};

// Synthesize pleasant cozy chime for reminders
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play two gentle notes (C6 -> G6)
    const now = ctx.currentTime;
    
    // Note 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1046.5, now); // C6
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Note 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1567.98, now + 0.12); // G6
    gain2.gain.setValueAtTime(0.18, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.8);
  } catch (e) {
    console.warn('Audio playback error (muted or blocked):', e);
  }
}

// Request browser notification permission
export async function requestBrowserNotification(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

// Send browser notification
export function triggerBrowserNotification(title: string, options?: NotificationOptions) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch {
      // Ignore if iframe blocked
    }
  }
}

// Generate direct Google Calendar 1-Click Event Link
export function createGoogleCalendarUrl(params: {
  title: string;
  details?: string;
  location?: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endDate?: string;
  endTime?: string;
}): string {
  const { title, details = '', location = '', startDate, startTime = '09:00', endDate = startDate, endTime = '10:00' } = params;
  
  // Format to Google Calendar ISO: YYYYMMDDTHHmmSSZ or YYYYMMDD
  const formatDateTime = (dateStr: string, timeStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const [hour, min] = timeStr.split(':');
    return `${year}${month}${day}T${hour || '09'}${min || '00'}00`;
  };

  const datesParam = `${formatDateTime(startDate, startTime)}/${formatDateTime(endDate, endTime)}`;

  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', title);
  url.searchParams.set('dates', datesParam);
  if (details) url.searchParams.set('details', details);
  if (location) url.searchParams.set('location', location);

  return url.toString();
}

// Export events to ICS format (for importing to Google Calendar on Android / Desktop)
export function exportToICS(events: Array<{
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  notes?: string;
}>): void {
  const formatDateToICS = (dateStr: string, timeStr: string = '09:00') => {
    const d = new Date(`${dateStr}T${timeStr}:00`);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//StudyWood Academic//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:StudyWood Tarefas Acadêmicas',
    'X-WR-TIMEZONE:America/Sao_Paulo',
  ];

  events.forEach((evt) => {
    const start = formatDateToICS(evt.date, evt.startTime || '09:00');
    const end = formatDateToICS(evt.date, evt.endTime || '10:00');
    ics.push(
      'BEGIN:VEVENT',
      `UID:${evt.id}@studywoodacademic.app`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${evt.title}`,
      `DESCRIPTION:${(evt.notes || '').replace(/\n/g, '\\n')}`,
      `LOCATION:${evt.location || 'Universidade'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  ics.push('END:VCALENDAR');

  const blob = new Blob([ics.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sherwood_compromissos_academicos_${new Date().toISOString().split('T')[0]}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export complete data backup to JSON
export function exportBackupJSON(allData: Record<string, unknown>): void {
  const jsonStr = JSON.stringify(allData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sherwood_backup_academico_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
