import { Suspense, type ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

/** Isolates a remote: a failed or slow remote never takes the shell down. */
export function RemoteSlot({ name, children }: { name: string; children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div role="alert" className="alert">
          <strong>{name} is unavailable</strong>
          <p>{error.message}</p>
          <button className="btn btn--ghost" onClick={reset}>
            Retry
          </button>
        </div>
      )}
    >
      <Suspense fallback={<p className="loading" aria-busy="true">Loading {name}…</p>}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
