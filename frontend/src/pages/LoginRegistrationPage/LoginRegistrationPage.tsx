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

const LoginRegistrationPage = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState<'login' | 'register'>('login');

    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleLogin = async () => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          password: password,
        }),
      });

      if (!res.ok) {
        console.log('Login failed');
        return;
      }

      navigate('/home');
    };

    const handleRegistration = async () => {
      if (password !== confirmPassword) {
        console.log('Passwords do not match');
        return;
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userName,
          email: userEmail,
          password: password,
        }),
      });

      if (!res.ok) {
        console.log('Registration failed');
        return;
      }

      navigate('/home');
    };


    return (
    <section id="login_form" className="min-w-md flex justify-center items-center h-screen">
      <FieldSet className="w-full max-w-md p-6 border-3 border-[#c8d69b] rounded-xl bg-white">
        <FieldGroup className="flex flex-row justify-center items-center gap-3 mb-4">
          <Button
            variant={mode === 'login' ? 'default' : 'outline'}
            className={`flex-1 ${mode === 'login' ? 'bg-[#3971b8] text-white' : 'bg-white text-black border-[#c8d69b]'}`}
            onClick={() => setMode('login')}
          >
            Login
          </Button>
          <Button
            variant={mode === 'register' ? 'default' : 'outline'}
            className={`flex-1 ${mode === 'register' ? 'bg-[#3971b8] text-white' : 'bg-white text-black border-[#c8d69b]'}`}
            onClick={() => setMode('register')}
          >
            Register
          </Button>
        </FieldGroup>
        <FieldSeparator />
        <FieldGroup>
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
          <Button className="bg-[#3971b8] w-full" onClick={mode == 'login' ? handleLogin : handleRegistration}>
            {mode === 'login' ? 'Login' : 'Register'}
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