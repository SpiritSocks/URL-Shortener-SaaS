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
            color: "#2d3319"
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

    const handleLogin = async () => {
      setError('');
      setLoading(true);
      try {
        await apiLogin(userEmail, password);
        await refreshUser();
        navigate('/home');
      } catch (err: any) {
        setError(err.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    };

    const handleRegistration = async () => {
      setError('');

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setLoading(true);
      try {
        await apiRegister(userName, userEmail, password);
        await refreshUser();
        navigate('/home');
      } catch (err: any) {
        setError(err.message || 'Registration failed');
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
            <span className="text-white text-xl font-medium">Url Shortener</span>
          </div>
          <h1 className="text-white text-4xl font-medium leading-snug mb-3">
            Short links.<br />Real insights.
          </h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Track every click, understand your audience, grow your reach.
          </p>
        </div>
      </div>
      <section id="login_form" className="w-full md:w-[480px] relative flex flex-col justify-center h-full bg-white border-l border-[#c8d69b] px-10">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="absolute top-6 left-6"
        >
          &larr; Back
        </Button>
        <FieldSet className="w-full p-6 border-3 border-[#c8d69b] rounded-xl bg-white">
          <FieldGroup className="flex flex-row justify-center items-center gap-3 mb-4">
            <Button
              variant={mode === 'login' ? 'default' : 'outline'}
              className={`flex-1 ${mode === 'login' ? 'bg-[#3971b8] text-white' : 'bg-white text-black border-[#c8d69b]'}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Login
            </Button>
            <Button
              variant={mode === 'register' ? 'default' : 'outline'}
              className={`flex-1 ${mode === 'register' ? 'bg-[#3971b8] text-white' : 'bg-white text-black border-[#c8d69b]'}`}
              onClick={() => { setMode('register'); setError(''); }}
            >
              Register
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
                <FieldLabel htmlFor="userName">Username</FieldLabel>
                <Input id="userName" type="text" placeholder="John Doe" value={userName}
                  className="border-2 border-[#c8d69b]" onChange={(e) => setUserName(e.target.value)} />
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="userEmail">Email Address</FieldLabel>
              <Input id="userEmail" type="email" placeholder="example@mail.com" value={userEmail}
                className="border-2 border-[#c8d69b]" onChange={(e) => setUserEmail(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" type="password" placeholder="••••••••••" value={password}
                className="border-2 border-[#c8d69b]" onChange={(e) => setPassword(e.target.value)} />
              <FieldDescription>Must be at least 8 characters long.</FieldDescription>
            </Field>
            {mode === 'register' && (
              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                <Input id="confirmPassword" type="password" placeholder="••••••••••" value={confirmPassword}
                  className="border-2 border-[#c8d69b]" onChange={(e) => setConfirmPassword(e.target.value)} />
              </Field>
            )}
            <Button className="bg-[#3971b8] w-full" disabled={loading}
              onClick={mode === 'login' ? handleLogin : handleRegistration}>
              {loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Register')}
            </Button>
          </FieldGroup>
          <FieldSeparator>Or continue with</FieldSeparator>
          <FieldGroup className="grid grid-cols-3 gap-3">
            <Button className="bg-transparent border-2 border-[#c8d69b] text-black">Google</Button>
            <Button className="bg-transparent border-2 border-[#c8d69b] text-black">Github</Button>
            <Button className="bg-transparent border-2 border-[#c8d69b] text-black">VK</Button>
          </FieldGroup>
        </FieldSet>
      </section>
    </div>
  );
};

export default LoginRegistrationPage;
