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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiLogin, apiRegister } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

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
    <section id="login_form" className="min-w-md flex flex-col justify-center items-center h-screen">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="self-start mb-4 ml-[calc(50%-14rem)]"
      >
        &larr; Back
      </Button>
      <FieldSet className="w-full max-w-md p-6 border-3 border-[#c8d69b] rounded-xl bg-white">
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
              <Input id="userName"
                    type="text"
                    placeholder="John Doe"
                    className="border-2 border-[#c8d69b]"
                    onChange={(e) => setUserName(e.target.value)} />
            </Field>
          )}
          <Field>
            <FieldLabel htmlFor="userEmail">Email Address</FieldLabel>
            <Input
              id="userEmail"
              type="email"
              placeholder="example@mail.com"
              className="border-2 border-[#c8d69b]"
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="••••••••••"
              className="border-2 border-[#c8d69b]"
              onChange={(e) => setPassword(e.target.value)}
            />
            <FieldDescription>
              Must be at least 8 characters long.
            </FieldDescription>
          </Field>
          {mode === 'register' && (
            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••••"
                className="border-2 border-[#c8d69b]"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Field>
          )}
          <Button
            className="bg-[#3971b8] w-full"
            disabled={loading}
            onClick={mode === 'login' ? handleLogin : handleRegistration}
          >
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
  );
};

export default LoginRegistrationPage;
