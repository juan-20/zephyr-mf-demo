import { useState, type FormEvent } from 'react';
import { useSession } from '@repo/store';
import { Panel } from '@repo/ui';

export default function LoginForm() {
  const { login, register, busy, error } = useSession();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void (mode === 'login' ? login : register)({ username, password });
  };

  return (
    <Panel title={mode === 'login' ? 'Log in' : 'Create account'}>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            style={{ display: 'block', width: '100%' }}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={8}
            required
            style={{ display: 'block', width: '100%' }}
          />
        </label>
        {error && (
          <p role="alert" style={{ color: '#c33', margin: 0 }}>
            {error}
          </p>
        )}
        <button type="submit" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
        <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Log in'}
        </button>
      </form>
    </Panel>
  );
}
