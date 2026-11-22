import { lazy, type ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useSession } from '@repo/store';
import { RemoteSlot } from './RemoteSlot';

const LoginForm = lazy(() => import('auth/LoginForm'));
const UserMenu = lazy(() => import('auth/UserMenu'));
const Feed = lazy(() => import('feed/Feed'));
const PostComposer = lazy(() => import('composer/PostComposer'));

function RequireAuth({ children }: { children: ReactNode }) {
  const status = useSession((s) => s.status);
  if (status === 'unknown') return <p className="loading" aria-busy="true">Checking session…</p>;
  return status === 'authed' ? children : <Navigate to="/login" replace />;
}

function LoginPage() {
  const status = useSession((s) => s.status);
  if (status === 'authed') return <Navigate to="/" replace />;
  return (
    <RemoteSlot name="Login">
      <LoginForm />
    </RemoteSlot>
  );
}

function Home() {
  return (
    <div className="stack">
      <RemoteSlot name="Composer">
        <PostComposer />
      </RemoteSlot>
      <RemoteSlot name="Feed">
        <Feed />
      </RemoteSlot>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <div className="app">
        <header className="app-header">
          <h1 className="brand brand-heading">
            <span className="brand-mark" aria-hidden="true" />
            Feed
          </h1>
          <RemoteSlot name="Account">
            <UserMenu />
          </RemoteSlot>
        </header>
        <main>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Home />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
