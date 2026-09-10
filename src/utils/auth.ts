import { createClient, type User } from '@supabase/supabase-js';
import { UserAccount } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isAuthConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const supabase = isAuthConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface RegistrationData {
  name: string;
  email: string;
  password: string;
  course: string;
  period: string;
  startDate: string;
  endDate: string;
  university: string;
  avatarUrl: string;
}

function requireClient() {
  if (!supabase) {
    throw new Error('A autenticação ainda não foi configurada. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
}

function userToAccount(user: User): UserAccount {
  const metadata = user.user_metadata ?? {};
  return {
    id: user.id,
    name: metadata.name || user.email?.split('@')[0] || 'Estudante',
    email: user.email || '',
    course: metadata.course || '',
    period: metadata.period || '',
    startDate: metadata.startDate || '',
    endDate: metadata.endDate || '',
    university: metadata.university || '',
    avatarUrl: metadata.avatarUrl,
    registrationNumber: metadata.registrationNumber || `RA-${user.id.slice(0, 6).toUpperCase()}`,
    currentSemester: metadata.currentSemester || metadata.period || '',
    targetGpa: metadata.targetGpa ?? 5,
    currentGpa: metadata.currentGpa ?? 5,
    createdAt: user.created_at,
  };
}

export async function signInWithEmail(email: string, password: string): Promise<UserAccount> {
  const client = requireClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  if (!data.user) throw new Error('Não foi possível iniciar a sessão.');
  return userToAccount(data.user);
}

export async function signUpWithEmail(data: RegistrationData): Promise<{ account: UserAccount | null; emailConfirmationRequired: boolean }> {
  const client = requireClient();
  const { data: result, error } = await client.auth.signUp({
    email: data.email.trim().toLowerCase(),
    password: data.password,
    options: {
      data: {
        name: data.name,
        course: data.course,
        period: data.period,
        startDate: data.startDate,
        endDate: data.endDate,
        university: data.university,
        avatarUrl: data.avatarUrl,
        registrationNumber: `RA-${Math.floor(100000 + Math.random() * 900000)}`,
        currentSemester: data.period,
        targetGpa: 5,
        currentGpa: 5,
      },
    },
  });
  if (error) throw error;
  return {
    account: result.user && result.session ? userToAccount(result.user) : null,
    emailConfirmationRequired: Boolean(result.user && !result.session),
  };
}

export async function getAuthenticatedUser(): Promise<UserAccount | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return userToAccount(data.user);
}

export async function signOut(): Promise<void> {
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}
