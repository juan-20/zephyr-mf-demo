import { lazy, Suspense } from 'react';

const RemoteCard = lazy(() => import('remote/Card'));

export default function App() {
  return (
    <main style={{ fontFamily: 'system-ui', maxWidth: 640, margin: '2rem auto' }}>
      <h1>Host application</h1>
      <Suspense fallback={<p>Loading remote…</p>}>
        <RemoteCard title="Card from remote" />
      </Suspense>
    </main>
  );
}
