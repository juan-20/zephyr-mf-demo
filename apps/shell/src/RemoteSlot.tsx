import { Suspense, type ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

/** Isolates a remote: a failed or slow remote never takes the shell down. */
export function RemoteSlot({ name, children }: { name: string; children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div role="alert" style={{ border: '1px solid #c33', borderRadius: 8, padding: 16 }}>
          <strong>{name} is unavailable.</strong>
          <p>{error.message}</p>
          <button onClick={reset}>Retry</button>
        </div>
      )}
    >
      <Suspense fallback={<p aria-busy="true">Loading {name}…</p>}>{children}</Suspense>
    </ErrorBoundary>
  );
}
