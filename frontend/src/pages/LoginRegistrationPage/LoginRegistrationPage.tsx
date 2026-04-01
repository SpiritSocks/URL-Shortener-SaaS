import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiLogin, apiRegister } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { tsParticles } from "@tsparticles/engine";
import { loadLinksPreset } from "@tsparticles/preset-links";

import { Eye, EyeOff } from "lucide-react";

const ParticleNetwork = () => {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    loadLinksPreset(tsParticles).then(() => {
      tsParticles.load({
        id: "particle-canvas",
        options: {
          preset: "links",
          fullScreen: { enable: false },
          background: {
            color: "#1e3a2f"
          },
          particles: {
            number: { value: 60 },
            color: { value: "#ffffff" },
            opacity: { value: 0.3 },
            size: { value: 2 },
            links: {
              enable: true,
              color: "#ffffff",
              opacity: 0.12,
              distance: 140,
            },
            move: {
              enable: true,
              speed: 0.6,
            },
          },
        },
      });
    });

    return () => {
      tsParticles.domItem(0)?.destroy();
    };
  }, []);

  return (
    <div
      id="particle-canvas"
      style={{
        position: "absolute",
        top: 0, left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
};



const LoginRegistrationPage = () => {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const [mode, setMode] = useState<'login' | 'register'>('login');

    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordsDoNotMatch = mode === "register" && confirmPassword.length > 0 && password !== confirmPassword;

    const handleLogin = async () => {
      setError('');
      setLoading(true);
      try {
        await apiLogin(userEmail, password);
        await refreshUser();
        navigate('/home');
      } catch (err: any) {
        setError(err.message || 'Ошибка входа');
      } finally {
        setLoading(false);
      }
    };

    const handleRegistration = async () => {
      setError('');

      if (passwordsDoNotMatch) {
        setError('Пароли не совпадают');
        return;
      }

      setLoading(true);
      try {
        await apiRegister(userName, userEmail, password);
        await refreshUser();
        navigate('/home');
      } catch (err: any) {
        setError(err.message || 'Ошибка регистрации');
      } finally {
        setLoading(false);
      }
    };


  return (
    <div className="flex h-screen">
      <div className="hidden md:flex flex-1 relative overflow-hidden">
        <ParticleNetwork />

        <div className="relative flex flex-col justify-center items-center text-center h-full px-12 w-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <span className="text-white text-xl font-medium">Linxie</span>
          </div>
          <h1 className="text-white text-4xl font-medium leading-snug mb-3">
            Короткие ссылки.<br />Реальная аналитика.
          </h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Отслеживайте каждый клик, изучайте аудиторию, расширяйте охват.
          </p>
        </div>
      </div>
      <section
        id="login_form"
        className="w-full md:w-[480px] relative flex flex-col justify-start md:justify-center min-h-screen bg-white border-l border-border px-4 sm:px-6 md:px-10 pt-20 md:pt-0 pb-6"
      >
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="absolute top-6 left-6"
        >
          &larr; Назад
        </Button>
        <FieldSet className="w-full p-4 sm:p-5 md:p-6 border-3 border-border rounded-xl bg-white">
            <FieldGroup className="flex flex-row justify-center items-center gap-3 mb-4">
            <Button
              variant={mode === 'login' ? 'default' : 'outline'}
              className={`flex-1 ${mode === 'login' ? 'bg-primary text-white' : 'bg-white text-black border-border'}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Вход
            </Button>
            <Button
              variant={mode === 'register' ? 'default' : 'outline'}
              className={`flex-1 ${mode === 'register' ? 'bg-primary text-white' : 'bg-white text-black border-border'}`}
              onClick={() => { setMode('register'); setError(''); }}
            >
              Регистрация
            </Button>
          </FieldGroup>
          <FieldSeparator />
          <FieldGroup>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}
            {mode === 'register' && (
              <Field>
                <FieldLabel htmlFor="userName">Имя пользователя</FieldLabel>
                <Input id="userName" type="text" placeholder="Иван Иванов" value={userName}
                  className="border-2 border-border" onChange={(e) => setUserName(e.target.value)} />
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="userEmail">Эл. почта</FieldLabel>
              <Input id="userEmail" type="email" placeholder="example@mail.com" value={userEmail}
                className="border-2 border-border" onChange={(e) => setUserEmail(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Пароль</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  className="border-2 border-border pr-12"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-muted-foreground"
                  aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FieldDescription>Минимум 8 символов.</FieldDescription>
            </Field>
            {mode === 'register' && (
              <Field>
                <FieldLabel htmlFor="confirmPassword">Подтвердите пароль</FieldLabel>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={confirmPassword}
                    className="border-2 border-border pr-12"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-muted-foreground"
                    aria-label={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </Field>
            )}
            <Button className="bg-primary w-full" disabled={loading}
              onClick={mode === 'login' ? handleLogin : handleRegistration}>
              {loading ? 'Подождите...' : (mode === 'login' ? 'Войти' : 'Зарегистрироваться')}
            </Button>
          </FieldGroup>
        </FieldSet>
      </section>
    </div>
  );
};

export default LoginRegistrationPage;
