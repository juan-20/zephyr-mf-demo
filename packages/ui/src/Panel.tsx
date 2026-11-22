import type { ReactNode } from 'react';

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ border: '1px solid #888', borderRadius: 8, padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {children}
    </section>
  );
}
