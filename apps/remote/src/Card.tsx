import { useState } from 'react';
import { Panel } from '@repo/ui';

export default function Card({ title = 'Remote Card' }: { title?: string }) {
  const [count, setCount] = useState(0);
  return (
    <Panel title={title}>
      <p>Rendered by the remote micro-frontend (v0.2.0).</p>
      <button onClick={() => setCount((c) => c + 1)}>Clicks: {count}</button>
    </Panel>
  );
}
