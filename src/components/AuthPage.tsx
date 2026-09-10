import React, { useRef, useState } from 'react';
import { 
  LogIn, 
  UserPlus, 
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
  BookOpen, 
  AlertCircle,
  Upload
} from 'lucide-react';
import { UserAccount } from '../types';
import { AVATAR_PRESETS } from '../data/initialData';
import { saveCurrentUser } from '../utils/storage';
import { isAuthConfigured, signInWithEmail, signUpWithEmail } from '../utils/auth';

interface AuthPageProps {
  onSuccess: (user: UserAccount) => void;
  defaultMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ 
  onSuccess,
  defaultMode = 'login' 
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [period, setPeriod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [university, setUniversity] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

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
      setErrorMsg('Por favor, preencha seu e-mail e sua senha.');
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
      setTimeout(() => onSuccess(user), 450);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Não foi possível entrar. Verifique seus dados.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!name.trim()) {
      setErrorMsg('Informe o seu nome completo.');
      return;
    }

    if (!course.trim()) {
      setErrorMsg('Informe o seu curso de graduação.');
      return;
    }

    if (!period.trim()) {
      setErrorMsg('Informe o seu período atual (Ex: 4º Período).');
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
      setErrorMsg('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem. Digite novamente.');
      return;
    }

    if (!isAuthConfigured) {
      setErrorMsg('A autenticação ainda não está configurada. Consulte o arquivo .env.example.');
      return;
    }

    // Default avatar assigned automatically - altering photo is restricted exclusively to Settings!
    const defaultAvatar = avatarUrl || AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)].url;

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
        setSuccessMsg(`Cadastro realizado com sucesso! Bem-vindo(a), ${result.account.name}!`);
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
    <div className="min-h-screen bg-[#0e1510] text-[#e8f0e9] flex flex-col justify-between relative overflow-x-hidden selection:bg-emerald-600 selection:text-white">
      {/* Background Ambience */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 bg-cover bg-center mix-blend-overlay"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1511497584788-87676104235f?w=1600&auto=format&fit=crop&q=80')`
        }}
      />
      <div className="fixed inset-0 pointer-events-none bg-radial from-emerald-950/20 via-transparent to-black/80" />

      {/* Top Brand Bar */}
      <header className="relative z-10 w-full px-6 py-6 max-w-5xl mx-auto flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1c2e21] border border-[#2e4d36] flex items-center justify-center text-emerald-300 shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-emerald-400">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Planner Acadêmico</span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-white">
              StudyWood
            </h1>
          </div>
        </div>

      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 w-full max-w-xl mx-auto px-4 py-4 sm:py-8 my-auto">
        <div className="rounded-3xl p-6 sm:p-8 border shadow-2xl bg-[#152017]/95 border-[#283c2b] backdrop-blur-md">
          
          {/* Card Title & Mode Toggle */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black tracking-tight text-white mb-1.5">
              {mode === 'login' ? 'Entrar no StudyWood' : 'Criar Nova Conta'}
            </h2>
            <p className="text-xs text-stone-400 max-w-md mx-auto">
              {mode === 'login' 
                ? 'Acesse seu painel universitário com tarefas, calendário e mural de estudos.'
                : 'Preencha os dados acadêmicos para personalizar seu planner universitário.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/40 border border-stone-800 mb-6">
            <button
              type="button"
              id="auth-tab-login"
              onClick={() => {
                setMode('login');
                resetAuthFields();
              }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar</span>
            </button>
            <button
              type="button"
              id="auth-tab-register"
              onClick={() => {
                setMode('register');
                resetAuthFields();
              }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                mode === 'register'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Novo Cadastro</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg ? (
            <div className="mb-5 p-3 rounded-2xl bg-red-950/70 border border-red-800 text-red-200 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : successMsg ? (
            <div className="mb-5 p-3 rounded-2xl bg-emerald-950/70 border border-emerald-700 text-emerald-200 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          ) : null}

          {/* 1. LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  E-mail Acadêmico ou Pessoal
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@universidade.edu.br"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha de acesso"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="submit-login-btn"
                className="w-full mt-2 py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar no StudyWood</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    resetAuthFields();
                  }}
                  className="text-xs text-stone-400 hover:text-emerald-300 transition-colors"
                >
                  Não tem uma conta? <strong className="text-emerald-400 font-bold underline">Criar cadastro agora</strong>
                </button>
              </div>
            </form>
          ) : (
            /* 2. REGISTRATION FORM */
            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* Nome Completo */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Alexandre Costa"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-stone-700 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Curso & Período (2 Colunas) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Curso *
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="Ex: Ciência da Computação"
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-stone-700 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Período *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <select
                      required
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-stone-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      <option value="">Selecione o período</option>
                      {Array.from({ length: 12 }, (_, index) => `${index + 1}º Período`).map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Datas: Início & Conclusão (2 Colunas) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Data de Início *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-stone-700 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Data de Conclusão ou Previsão *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-stone-700 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Universidade */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Universidade / Instituição *
                </label>
                <div className="relative">
                  <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="Ex: Universidade de São Paulo (USP)"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-stone-700 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  E-mail *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-stone-700 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Senha & Confirmar Senha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Senha *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-9 py-2 rounded-xl bg-black/40 border border-stone-700 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
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
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-stone-700 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
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
                id="submit-register-btn"
                disabled={isSubmitting}
                className="w-full mt-3 py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Criando cadastro...' : 'Criar Cadastro & Entrar'}</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    resetAuthFields();
                  }}
                  className="text-xs text-stone-400 hover:text-emerald-300 transition-colors"
                >
                  Já possui uma conta? <strong className="text-emerald-400 font-bold underline">Fazer Login</strong>
                </button>
              </div>
            </form>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-4 max-w-5xl mx-auto text-center text-[11px] text-stone-500">
        Planner Acadêmico StudyWood • Gestão de Tarefas, Calendário e Estudos Universitários
      </footer>
    </div>
  );
};
