import { useState, type FormEvent } from 'react';
import { useSession } from '@repo/store';
import { Panel } from '@repo/ui';

export default function LoginForm() {
  const { login, register, busy, error } = useSession();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const isLogin = mode === 'login';

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void (isLogin ? login : register)({ username, password });
  };

  return (
    <Panel title={isLogin ? 'Welcome back' : 'Create your account'}>
      <form onSubmit={submit} className="stack">
        <label className="field">
          Username
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label className="field">
          Password
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            minLength={8}
            required
          />
        </label>
        {error && (
          <p role="alert" className="alert" style={{ margin: 0 }}>
            {error}
          </p>
        )}
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Sign up'}
        </button>
        <button
          type="button"
          className="btn btn--link"
          onClick={() => setMode(isLogin ? 'register' : 'login')}
        >
          {isLogin ? 'Need an account? Sign up' : 'Have an account? Log in'}
        </button>
      </form>
    </Panel>
  );
}
