import React, { useRef, useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  GraduationCap, 
  School, 
  Calendar,
  Clock,
  Eye, 
  EyeOff, 
  Sparkles, 
  Check, 
  ArrowRight, 
  LogIn, 
  UserPlus,
  BookOpen,
  Upload
} from 'lucide-react';
import { UserAccount } from '../types';
import { AVATAR_PRESETS } from '../data/initialData';
import { saveCurrentUser } from '../utils/storage';
import { isAuthConfigured, signInWithEmail, signUpWithEmail } from '../utils/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (user: UserAccount) => void;
  initialMode?: 'login' | 'register';
  allowClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  allowClose = true,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [course, setCourse] = useState('');
  const [period, setPeriod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [university, setUniversity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const resetAuthFields = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    resetMessages();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Informe seu e-mail e senha para entrar.');
      return;
    }

    if (!isAuthConfigured) {
      setErrorMsg('A autenticação ainda não está configurada. Consulte o arquivo .env.example.');
      return;
    }

    try {
      const user = await signInWithEmail(email, password);
      saveCurrentUser(user);
      setSuccessMsg(`Bem-vindo(a) de volta, ${user.name.split(' ')[0]}!`);
      setTimeout(() => onSuccess(user), 400);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Não foi possível entrar. Verifique seus dados.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!name.trim()) {
      setErrorMsg('Informe seu nome completo.');
      return;
    }

    if (!course.trim()) {
      setErrorMsg('Informe seu curso de graduação.');
      return;
    }

    if (!period.trim()) {
      setErrorMsg('Informe seu período atual (Ex: 4º Período).');
      return;
    }

    if (!startDate) {
      setErrorMsg('Informe a data de início do curso.');
      return;
    }

    if (!endDate) {
      setErrorMsg('Informe a data prevista de conclusão.');
      return;
    }

    if (!university.trim()) {
      setErrorMsg('Informe a sua universidade ou faculdade.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Informe um endereço de e-mail válido.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('A senha deve conter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }

    if (!isAuthConfigured) {
      setErrorMsg('A autenticação ainda não está configurada. Consulte o arquivo .env.example.');
      return;
    }

    const defaultAvatar = avatarUrl || AVATAR_PRESETS[0].url;

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const result = await signUpWithEmail({ name: name.trim(), email, password, course: course.trim(), period: period.trim(), startDate, endDate, university: university.trim(), avatarUrl: defaultAvatar });
      if (result.emailConfirmationRequired) {
        setSuccessMsg('Cadastro realizado com sucesso!');
        return;
      }
      if (result.account) {
        saveCurrentUser(result.account);
        setSuccessMsg(`Conta criada com sucesso! Seja bem-vindo(a), ${result.account.name}!`);
        setTimeout(() => onSuccess(result.account!), 500);
      }
    } catch (error) {
      setSuccessMsg(null);
      setErrorMsg(error instanceof Error ? error.message : 'Não foi possível criar sua conta.');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = () => {
    setErrorMsg('O acesso demo foi desativado. Cadastre-se com seu email para entrar.');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={allowClose ? onClose : undefined}
    >
      <div 
        className="w-full max-w-md my-auto rounded-3xl p-6 md:p-7 border shadow-2xl animate-in zoom-in-95 bg-[#162118] border-[#293d2c] text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-extrabold text-emerald-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>StudyWood Planner</span>
              </div>
              <h3 className="text-base font-bold text-white">
                {mode === 'login' ? 'Acesso do Estudante' : 'Novo Cadastro'}
              </h3>
            </div>
          </div>
          {allowClose && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tab Switcher (Entrar / Cadastrar) */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/40 border border-stone-800 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              resetAuthFields();
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              resetAuthFields();
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Cadastrar</span>
          </button>
        </div>

        {/* Status Alerts */}
        {errorMsg ? (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs font-medium animate-in fade-in">
            {errorMsg}
          </div>
        ) : successMsg ? (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-700 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        ) : null}

        {/* ===================== FORMULÁRIO DE LOGIN ===================== */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@universidade.edu.br"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/30 border border-stone-700 text-white placeholder:text-stone-600 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/30 border border-stone-700 text-white placeholder:text-stone-600 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 mt-2"
            >
              <span>Entrar no StudyWood</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Login Option */}
            <div className="pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-300 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Entrar como Estudante Demo (1 clique)</span>
              </button>
            </div>
          </form>
        ) : (
          /* ===================== FORMULÁRIO DE CADASTRO ===================== */
          <form onSubmit={handleRegister} className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
            {/* Nome Completo */}
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                Nome Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Mariana Silva"
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-black/40 border border-stone-700 text-white placeholder:text-stone-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Curso e Período */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Curso *
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="Ex: Medicina"
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-black/40 border border-stone-700 text-white placeholder:text-stone-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Período *
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-black/40 border border-stone-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  >
                    <option value="">Selecione o período</option>
                    {Array.from({ length: 12 }, (_, index) => `${index + 1}º Período`).map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Datas de Início e Conclusão */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Data de Início *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-black/40 border border-stone-700 text-white placeholder:text-stone-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Data de Conclusão *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-black/40 border border-stone-700 text-white placeholder:text-stone-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Universidade */}
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                Universidade / Faculdade *
              </label>
              <div className="relative">
                <School className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="Ex: Universidade Federal"
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-black/40 border border-stone-700 text-white placeholder:text-stone-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                E-mail *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@universidade.br"
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-black/40 border border-stone-700 text-white placeholder:text-stone-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Senhas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Senha (mín. 6 dígitos) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-9 py-2 rounded-xl bg-black/40 border border-stone-700 text-white placeholder:text-stone-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-black/40 border border-stone-700 text-white placeholder:text-stone-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                Foto de perfil <span className="font-normal text-stone-500">(opcional)</span>
              </label>
              <label className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-black/40 border border-stone-700 text-stone-300 text-xs cursor-pointer hover:border-emerald-500 transition-colors">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>{avatarUrl ? 'Foto selecionada' : 'Escolher uma foto'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setAvatarUrl(String(reader.result));
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 pt-2.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Criando conta...' : 'Criar Minha Conta & Acessar'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
