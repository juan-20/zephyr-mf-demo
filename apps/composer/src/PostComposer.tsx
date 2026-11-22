import { useState, type FormEvent } from 'react';
import { usePosts } from '@repo/store';
import { Panel } from '@repo/ui';

const MAX = 280;

export default function PostComposer() {
  const create = usePosts((s) => s.create);
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const trimmed = content.trim();
  const counterClass =
    content.length >= MAX ? 'counter counter--max' : content.length >= MAX - 20 ? 'counter counter--warn' : 'counter';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!trimmed || busy) return;
    setBusy(true);
    if (await create(trimmed)) setContent('');
    setBusy(false);
  };

  return (
    <Panel>
      <form onSubmit={(e) => void submit(e)} className="stack stack--tight">
        <label className="field">
          <span className="sr-only">Post content</span>
          <textarea
            className="textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX}
            rows={3}
            placeholder="What is on your mind?"
          />
        </label>
        <div className="composer__footer">
          <small className={counterClass} aria-live="polite">
            {content.length}/{MAX}
          </small>
          <button type="submit" className="btn btn--primary" disabled={!trimmed || busy}>
            {busy ? 'Posting…' : 'Post'}
          </button>
        </div>
      </form>
    </Panel>
  );
}
