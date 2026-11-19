import { useState } from 'react';

export default function Card({ title = 'Remote Card' }: { title?: string }) {
  const [count, setCount] = useState(0);
  return (
    <section style={{ border: '1px solid #888', borderRadius: 8, padding: 16 }}>
      <h2>{title}</h2>
      <p>Rendered by the remote micro-frontend.</p>
      <button onClick={() => setCount((c) => c + 1)}>Clicks: {count}</button>
    </section>
  );
}
