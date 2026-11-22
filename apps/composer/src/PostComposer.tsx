import { useState, type FormEvent } from 'react';
import { usePosts } from '@repo/store';
import { Panel } from '@repo/ui';

const MAX = 280;

export default function PostComposer() {
  const create = usePosts((s) => s.create);
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const trimmed = content.trim();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!trimmed || busy) return;
    setBusy(true);
    if (await create(trimmed)) setContent('');
    setBusy(false);
  };

  return (
    <Panel title="New post">
      <form onSubmit={(e) => void submit(e)} style={{ display: 'grid', gap: 8 }}>
        <label>
          <span style={{ position: 'absolute', left: -9999 }}>Post content</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX}
            rows={3}
            placeholder="What is on your mind?"
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </label>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <small aria-live="polite">
            {content.length}/{MAX}
          </small>
          <button type="submit" disabled={!trimmed || busy}>
            {busy ? 'Posting…' : 'Post'}
          </button>
        </div>
      </form>
    </Panel>
  );
}
