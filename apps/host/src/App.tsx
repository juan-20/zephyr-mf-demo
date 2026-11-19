import { lazy, Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

const RemoteCard = lazy(() => import('remote/Card'));

export default function App() {
  return (
    <main style={{ fontFamily: 'system-ui', maxWidth: 640, margin: '2rem auto' }}>
      <h1>Host application</h1>
      <ErrorBoundary
        fallback={(error, reset) => (
          <div role="alert" style={{ border: '1px solid #c33', borderRadius: 8, padding: 16 }}>
            <strong>The remote is unavailable.</strong>
            <p>{error.message}</p>
            <button onClick={reset}>Retry</button>
          </div>
        )}
      >
        <Suspense fallback={<p aria-busy="true">Loading remote…</p>}>
          <RemoteCard title="Card from remote" />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
